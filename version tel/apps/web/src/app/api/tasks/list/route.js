import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const completed = searchParams.get("completed");

    let rows;
    if (completed === "true") {
      rows = await sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId} AND completed = true 
        ORDER BY completed_at DESC
      `;
    } else if (completed === "false") {
      rows = await sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId} AND completed = false 
        ORDER BY deadline ASC NULLS LAST, created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId}
        ORDER BY completed ASC, deadline ASC NULLS LAST, created_at DESC
      `;
    }

    return Response.json(rows);
  } catch (error) {
    console.error("Error listing tasks:", error);
    return Response.json({ error: "Failed to list tasks" }, { status: 500 });
  }
}
