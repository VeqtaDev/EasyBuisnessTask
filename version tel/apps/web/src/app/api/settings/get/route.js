import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const rows = await sql`
      SELECT discord_webhook_url, api_key, created_at, updated_at
      FROM user_settings
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    const settings = rows[0] || {
      discord_webhook_url: null,
      api_key: null,
    };

    return Response.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
