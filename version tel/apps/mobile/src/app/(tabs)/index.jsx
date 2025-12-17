import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Target } from "lucide-react-native";
import { LineGraph } from "react-native-graph";
import { useRequireAuth } from "@/utils/auth/useAuth";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function HomePage() {
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get("window").width;
  const graphWidth = windowWidth - 48;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/list");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  const generateMonthlyGraphData = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let cumulativeEarned = 0;

    return daysInMonth.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const completedTasksOnDay = tasks.filter(
        (task) =>
          task.completed &&
          task.completed_at &&
          format(new Date(task.completed_at), "yyyy-MM-dd") === dayStr,
      );

      const earnedOnDay = completedTasksOnDay.reduce(
        (sum, task) => sum + parseFloat(task.amount),
        0,
      );

      cumulativeEarned += earnedOnDay;

      return {
        date: day,
        value: cumulativeEarned,
      };
    });
  };

  const graphData = generateMonthlyGraphData();

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 16,
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#ffffff" }}>
          EBT
        </Text>
        <Text style={{ fontSize: 14, color: "#666666", marginTop: 4 }}>
          Easy Business Task
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 16, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.2)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DollarSign color="#22c55e" size={24} />
                </View>
                <Text style={{ fontSize: 16, color: "#888888" }}>
                  Gagné ce mois
                </Text>
              </View>
              <Text
                style={{ fontSize: 42, fontWeight: "bold", color: "#22c55e" }}
              >
                {parseFloat(stats?.earned_this_month || 0).toFixed(2)}€
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(59, 130, 246, 0.2)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Target color="#3b82f6" size={24} />
                </View>
                <Text style={{ fontSize: 16, color: "#888888" }}>
                  En attente
                </Text>
              </View>
              <Text
                style={{ fontSize: 42, fontWeight: "bold", color: "#3b82f6" }}
              >
                {parseFloat(stats?.pending_amount || 0).toFixed(2)}€
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(251, 146, 60, 0.1)",
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(251, 146, 60, 0.2)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(251, 146, 60, 0.2)",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp color="#fb923c" size={24} />
                </View>
                <Text style={{ fontSize: 16, color: "#888888" }}>
                  Projection fin de mois
                </Text>
              </View>
              <Text
                style={{ fontSize: 42, fontWeight: "bold", color: "#fb923c" }}
              >
                {parseFloat(stats?.projected_end_of_month || 0).toFixed(2)}€
              </Text>
            </View>
          </View>

          {graphData.length > 0 && (
            <View
              style={{
                backgroundColor: "#0a0a0a",
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "#1a1a1a",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: 16,
                }}
              >
                Progression du mois
              </Text>
              <View style={{ height: 200, marginBottom: 12 }}>
                <LineGraph
                  points={graphData}
                  color="#22c55e"
                  animated={true}
                  enablePanGesture={true}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  gradientFillColors={[
                    "rgba(34, 197, 94, 0.2)",
                    "rgba(34, 197, 94, 0)",
                  ]}
                  enableIndicator={true}
                  indicatorPulsating={true}
                  height={200}
                  width={graphWidth - 40}
                />
              </View>
              <Text
                style={{ fontSize: 12, color: "#666666", textAlign: "center" }}
              >
                Revenus cumulés du{" "}
                {format(graphData[0].date, "d MMM", { locale: fr })} au{" "}
                {format(graphData[graphData.length - 1].date, "d MMM", {
                  locale: fr,
                })}
              </Text>
            </View>
          )}

          <View
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#1a1a1a",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: 16,
              }}
            >
              Statistiques
            </Text>
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#1a1a1a",
                }}
              >
                <Text style={{ fontSize: 14, color: "#888888" }}>
                  Tâches complétées
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#ffffff" }}
                >
                  {stats?.completed_this_month || 0}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#1a1a1a",
                }}
              >
                <Text style={{ fontSize: 14, color: "#888888" }}>
                  Tâches en attente
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#ffffff" }}
                >
                  {stats?.pending_tasks || 0}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#888888" }}>
                  Revenu moyen/tâche
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#22c55e" }}
                >
                  {parseFloat(stats?.average_task_amount || 0).toFixed(2)}€
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
