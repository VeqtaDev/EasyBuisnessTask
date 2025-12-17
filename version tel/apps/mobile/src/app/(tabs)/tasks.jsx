import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Check,
  Clock,
  DollarSign,
  Trash2,
  Edit3,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRequireAuth } from "@/utils/auth/useAuth";

export default function TasksPage() {
  useRequireAuth(); // Require authentication

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/list?completed=false");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }) => {
      const response = await fetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de mettre à jour la tâche");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de supprimer la tâche");
    },
  });

  const handleToggleTask = (id, completed) => {
    toggleTaskMutation.mutate({ id, completed: !completed });
  };

  const handleDeleteTask = (id, title) => {
    Alert.alert(
      "Supprimer la tâche",
      `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteTaskMutation.mutate(id),
        },
      ],
    );
  };

  const handleEditTask = (task) => {
    router.push(`/(tabs)/edit-task?id=${task.id}`);
  };

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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#ffffff" }}
            >
              Mes Tâches
            </Text>
            <Text style={{ fontSize: 14, color: "#666666", marginTop: 4 }}>
              {tasks.length} tâche{tasks.length > 1 ? "s" : ""} en cours
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add-task")}
            style={{
              backgroundColor: "#ffffff",
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#ffffff",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Plus color="#000000" size={24} />
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
          <Text style={{ fontSize: 18, color: "#666666", textAlign: "center" }}>
            Aucune tâche en cours
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#444444",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Appuyez sur + pour créer votre première tâche
          </Text>
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
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => handleToggleTask(task.id, task.completed)}
              onDelete={() => handleDeleteTask(task.id, task.title)}
              onEdit={() => handleEditTask(task)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );

    checkScale.value = task.completed
      ? withTiming(0, { duration: 200 })
      : withSpring(1, { damping: 8, stiffness: 150 });

    onToggle();
  };

  return (
    <Animated.View
      style={[
        {
          backgroundColor: "#0a0a0a",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#1a1a1a",
        },
        cardAnimatedStyle,
      ]}
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
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={onEdit}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(59, 130, 246, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Edit3 color="#3b82f6" size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: task.completed ? "#22c55e" : "#333333",
              backgroundColor: task.completed
                ? "rgba(34, 197, 94, 0.2)"
                : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View style={checkAnimatedStyle}>
              {task.completed && <Check color="#22c55e" size={20} />}
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
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

      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {task.deadline && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "rgba(59, 130, 246, 0.2)",
            }}
          >
            <Clock color="#3b82f6" size={16} />
            <Text
              style={{
                fontSize: 13,
                color: "#3b82f6",
                marginLeft: 6,
                fontWeight: "500",
              }}
            >
              {format(new Date(task.deadline), "dd MMM yyyy", {
                locale: fr,
              })}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "rgba(34, 197, 94, 0.2)",
          }}
        >
          <DollarSign color="#22c55e" size={16} />
          <Text
            style={{
              fontSize: 13,
              color: "#22c55e",
              marginLeft: 4,
              fontWeight: "700",
            }}
          >
            {parseFloat(task.amount).toFixed(2)}€
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
