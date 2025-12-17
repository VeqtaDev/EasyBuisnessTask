import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "Task ID is required" }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM tasks 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return Response.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
