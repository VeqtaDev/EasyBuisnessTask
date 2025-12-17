import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

function generateApiKey() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "ebt-";
  for (let i = 0; i < 36; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const apiKey = generateApiKey();

    // Check if settings exist
    const existing = await sql`
      SELECT id FROM user_settings WHERE user_id = ${userId} LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing
      await sql`
        UPDATE user_settings
        SET api_key = ${apiKey}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      // Insert new
      await sql`
        INSERT INTO user_settings (user_id, api_key)
        VALUES (${userId}, ${apiKey})
      `;
    }

    return Response.json({ api_key: apiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
