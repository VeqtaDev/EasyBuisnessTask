import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const completedStats = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as earned_this_month,
        COUNT(*) as completed_count
      FROM tasks
      WHERE user_id = ${userId} AND completed = true 
        AND completed_at >= ${startOfMonth.toISOString()}
        AND completed_at <= ${endOfMonth.toISOString()}
    `;

    const pendingStats = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as pending_amount,
        COUNT(*) as pending_count
      FROM tasks
      WHERE user_id = ${userId} AND completed = false
    `;

    const avgStats = await sql`
      SELECT COALESCE(AVG(amount), 0) as avg_amount
      FROM tasks
      WHERE user_id = ${userId}
    `;

    const earnedThisMonth = parseFloat(
      completedStats[0]?.earned_this_month || 0,
    );
    const pendingAmount = parseFloat(pendingStats[0]?.pending_amount || 0);
    const completedCount = parseInt(completedStats[0]?.completed_count || 0);
    const pendingCount = parseInt(pendingStats[0]?.pending_count || 0);
    const averageAmount = parseFloat(avgStats[0]?.avg_amount || 0);

    return Response.json({
      earned_this_month: earnedThisMonth,
      pending_amount: pendingAmount,
      projected_end_of_month: earnedThisMonth + pendingAmount,
      completed_this_month: completedCount,
      pending_tasks: pendingCount,
      average_task_amount: averageAmount,
      potential_earnings: pendingAmount,
      total_projected: earnedThisMonth + pendingAmount,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return Response.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
