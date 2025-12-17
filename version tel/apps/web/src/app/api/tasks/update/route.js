import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import {
  sendDiscordWebhook,
  createTaskCompletedEmbed,
} from "@/app/api/utils/discord";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, title, description, image_url, deadline, amount, completed } =
      body;

    if (!id) {
      return Response.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Check if task belongs to user
    const existing = await sql`
      SELECT * FROM tasks WHERE id = ${id} AND user_id = ${userId} LIMIT 1
    `;

    if (existing.length === 0) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const existingTask = existing[0];
    const wasCompleted = existingTask.completed;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${paramCount++}`);
      values.push(deadline);
    }
    if (amount !== undefined) {
      updates.push(`amount = $${paramCount++}`);
      values.push(amount);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount++}`);
      values.push(completed);
      if (completed) {
        updates.push(`completed_at = NOW()`);
      } else {
        updates.push(`completed_at = NULL`);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    values.push(userId);
    const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;

    const rows = await sql(query, values);
    const task = rows[0];

    // Send Discord webhook notification if task was just completed
    if (completed && !wasCompleted) {
      const settings = await sql`
        SELECT discord_webhook_url FROM user_settings WHERE user_id = ${userId} LIMIT 1
      `;

      if (settings.length > 0 && settings[0].discord_webhook_url) {
        const embed = createTaskCompletedEmbed(task);
        await sendDiscordWebhook(settings[0].discord_webhook_url, embed);
      }
    }

    return Response.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return Response.json({ error: "Failed to update task" }, { status: 500 });
  }
}
