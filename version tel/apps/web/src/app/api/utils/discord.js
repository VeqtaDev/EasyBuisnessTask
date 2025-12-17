export async function sendDiscordWebhook(webhookUrl, embed) {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (error) {
    console.error("Error sending Discord webhook:", error);
  }
}

export function createTaskCreatedEmbed(task) {
  return {
    title: "✨ Nouvelle tâche créée",
    description: task.description || "Aucune description",
    color: 3447003, // Blue
    fields: [
      {
        name: "📋 Titre",
        value: task.title,
        inline: false,
      },
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
    footer: {
      text: "EBT - Easy Business Task",
    },
  };
}

export function createTaskCompletedEmbed(task) {
  return {
    title: "✅ Tâche complétée !",
    description: task.description || "Aucune description",
    color: 2280504, // Green
    fields: [
      {
        name: "📋 Titre",
        value: task.title,
        inline: false,
      },
      {
        name: "💸 Revenu",
        value: `**${parseFloat(task.amount).toFixed(2)}€**`,
        inline: true,
      },
      {
        name: "⏱️ Complétée le",
        value: new Date().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        inline: true,
      },
    ],
    thumbnail: task.image_url ? { url: task.image_url } : undefined,
    timestamp: new Date().toISOString(),
    footer: {
      text: "EBT - Easy Business Task",
    },
  };
}
