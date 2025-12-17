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

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN completed = true AND completed_at >= ${firstDayOfMonth.toISOString()} AND completed_at <= ${lastDayOfMonth.toISOString()} THEN amount ELSE 0 END), 0) as earned_this_month,
        COALESCE(SUM(CASE WHEN completed = false THEN amount ELSE 0 END), 0) as pending_amount,
        COUNT(CASE WHEN completed = true AND completed_at >= ${firstDayOfMonth.toISOString()} AND completed_at <= ${lastDayOfMonth.toISOString()} THEN 1 END) as completed_this_month,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending_tasks,
        COALESCE(AVG(CASE WHEN completed = true THEN amount END), 0) as average_task_amount
      FROM tasks
      WHERE user_id = ${userId}
    `;

    const result = stats[0];

    const earnedThisMonth = parseFloat(result.earned_this_month);
    const pendingAmount = parseFloat(result.pending_amount);
    const projectedEndOfMonth = earnedThisMonth + pendingAmount;

    return Response.json({
      earned_this_month: earnedThisMonth,
      pending_amount: pendingAmount,
      projected_end_of_month: projectedEndOfMonth,
      completed_this_month: parseInt(result.completed_this_month),
      pending_tasks: parseInt(result.pending_tasks),
      average_task_amount: parseFloat(result.average_task_amount),
      potential_earnings: pendingAmount,
      total_projected: projectedEndOfMonth,
    });
  } catch (error) {
    console.error("Error fetching stats via API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
