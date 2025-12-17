import sql from "@/app/api/utils/sql";

async function sendDiscordWebhook(webhookUrl, embed) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
  }
}

function createTaskCreatedEmbed(task) {
  return {
    title: "✨ Nouvelle tâche créée",
    description: task.description || "Aucune description",
    color: 3447003,
    fields: [
      { name: "📋 Titre", value: task.title, inline: false },
      {
        name: "💰 Montant",
        value: `${parseFloat(task.amount).toFixed(2)}€`,
        inline: true,
      },
      {
        name: "📅 Date limite",
        value: task.deadline
          ? new Date(task.deadline).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "Non définie",
        inline: true,
      },
    ],
    thumbnail: task.image_url ? { url: task.image_url } : undefined,
    timestamp: new Date().toISOString(),
    footer: { text: "EBT - Easy Business Task" },
  };
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const apiKey = authHeader.substring(7);

    const userSettings = await sql`
      SELECT user_id FROM user_settings WHERE api_key = ${apiKey} LIMIT 1
    `;

    if (userSettings.length === 0) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    const userId = userSettings[0].user_id;
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

    const settings = await sql`
      SELECT discord_webhook_url FROM user_settings WHERE user_id = ${userId} LIMIT 1
    `;

    if (settings.length > 0 && settings[0].discord_webhook_url) {
      const embed = createTaskCreatedEmbed(task);
      await sendDiscordWebhook(settings[0].discord_webhook_url, embed);
    }

    return Response.json(task);
  } catch (error) {
    console.error("Error creating task via API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
