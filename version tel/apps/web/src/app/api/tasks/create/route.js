import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import {
  sendDiscordWebhook,
  createTaskCreatedEmbed,
} from "@/app/api/utils/discord";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title, description, image_url, deadline, amount } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO tasks (title, description, image_url, deadline, amount, user_id)
      VALUES (
        ${title},
        ${description || null},
        ${image_url || null},
        ${deadline || null},
        ${amount || 0},
        ${userId}
      )
      RETURNING *
    `;

    const task = rows[0];

    // Send Discord webhook notification
    const settings = await sql`
      SELECT discord_webhook_url FROM user_settings WHERE user_id = ${userId} LIMIT 1
    `;

    if (settings.length > 0 && settings[0].discord_webhook_url) {
      const embed = createTaskCreatedEmbed(task);
      await sendDiscordWebhook(settings[0].discord_webhook_url, embed);
    }

    return Response.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return Response.json({ error: "Failed to create task" }, { status: 500 });
  }
}
