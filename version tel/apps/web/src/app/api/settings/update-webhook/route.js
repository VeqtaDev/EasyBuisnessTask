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
    const { webhook_url } = body;

    // Check if settings exist
    const existing = await sql`
      SELECT id FROM user_settings WHERE user_id = ${userId} LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing
      await sql`
        UPDATE user_settings
        SET discord_webhook_url = ${webhook_url || null}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      // Insert new
      await sql`
        INSERT INTO user_settings (user_id, discord_webhook_url)
        VALUES (${userId}, ${webhook_url || null})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
