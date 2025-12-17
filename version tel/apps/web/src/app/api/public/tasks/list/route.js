import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const apiKey = authHeader.substring(7);

    // Find user by API key
    const userSettings = await sql`
      SELECT user_id FROM user_settings WHERE api_key = ${apiKey} LIMIT 1
    `;

    if (userSettings.length === 0) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    const userId = userSettings[0].user_id;
    const { searchParams } = new URL(request.url);
    const completedParam = searchParams.get("completed");

    let query;
    if (completedParam === "true") {
      query = sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId} AND completed = true 
        ORDER BY completed_at DESC
      `;
    } else if (completedParam === "false") {
      query = sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId} AND completed = false 
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT * FROM tasks 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    }

    const tasks = await query;
    return Response.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks via API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
