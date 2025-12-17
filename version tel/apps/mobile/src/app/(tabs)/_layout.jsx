import { Tabs } from "expo-router";
import { Home, ListTodo, Clock, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 1,
          borderColor: "#1a1a1a",
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tâches",
          tabBarIcon: ({ color }) => <ListTodo color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-task"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="task/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
