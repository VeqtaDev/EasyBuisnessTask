import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react-native";
import { Image } from "expo-image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRequireAuth } from "@/utils/auth/useAuth";

export default function HistoryPage() {
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const [sortBy, setSortBy] = useState("date"); // date, amount

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "completed"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/list?completed=true");
      if (!response.ok) {
        throw new Error("Failed to fetch completed tasks");
      }
      return response.json();
    },
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "amount") {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    return new Date(b.completed_at) - new Date(a.completed_at);
  });

  const totalEarned = tasks.reduce(
    (sum, task) => sum + parseFloat(task.amount),
    0,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1a1a1a",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#ffffff" }}>
          Historique
        </Text>
        <Text style={{ fontSize: 14, color: "#666666", marginTop: 4 }}>
          {tasks.length} tâche{tasks.length > 1 ? "s" : ""} complétée
          {tasks.length > 1 ? "s" : ""}
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setSortBy("date")}
            style={{
              flex: 1,
              backgroundColor: sortBy === "date" ? "#ffffff" : "#0a0a0a",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#1a1a1a",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Calendar
              color={sortBy === "date" ? "#000000" : "#888888"}
              size={18}
            />
            <Text
              style={{
                color: sortBy === "date" ? "#000000" : "#888888",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Par date
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy("amount")}
            style={{
              flex: 1,
              backgroundColor: sortBy === "amount" ? "#ffffff" : "#0a0a0a",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#1a1a1a",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <TrendingUp
              color={sortBy === "amount" ? "#000000" : "#888888"}
              size={18}
            />
            <Text
              style={{
                color: sortBy === "amount" ? "#000000" : "#888888",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Rentabilité
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : tasks.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Clock color="#333333" size={64} />
          <Text
            style={{
              fontSize: 18,
              color: "#666666",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Aucune tâche complétée
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#444444",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Les tâches terminées apparaîtront ici
          </Text>
        </View>
      ) : (
        <>
          <View
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(34, 197, 94, 0.2)",
            }}
          >
            <Text style={{ fontSize: 12, color: "#888888", marginBottom: 4 }}>
              Total gagné
            </Text>
            <Text
              style={{ fontSize: 32, fontWeight: "bold", color: "#22c55e" }}
            >
              {totalEarned.toFixed(2)}€
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {sortedTasks.map((task) => (
              <HistoryCard key={task.id} task={task} />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function HistoryCard({ task }) {
  return (
    <View
      style={{
        backgroundColor: "#0a0a0a",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1a1a1a",
      }}
    >
      {task.image_url && (
        <Image
          source={{ uri: task.image_url }}
          style={{
            width: "100%",
            height: 180,
            borderRadius: 16,
            marginBottom: 16,
          }}
          contentFit="cover"
          transition={200}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#ffffff",
            flex: 1,
            marginRight: 12,
          }}
        >
          {task.title}
        </Text>
        <View
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "rgba(34, 197, 94, 0.3)",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#22c55e" }}>
            {parseFloat(task.amount).toFixed(2)}€
          </Text>
        </View>
      </View>

      {task.description && (
        <Text
          style={{
            fontSize: 14,
            color: "#888888",
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          {task.description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#1a1a1a",
        }}
      >
        <Clock color="#666666" size={16} />
        <Text style={{ fontSize: 13, color: "#666666" }}>
          Complétée le{" "}
          {format(new Date(task.completed_at), "dd MMMM yyyy 'à' HH:mm", {
            locale: fr,
          })}
        </Text>
      </View>
    </View>
  );
}
