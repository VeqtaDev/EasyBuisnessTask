import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Webhook,
  Key,
  Copy,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  LogOut,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useRequireAuth, useAuth } from "@/utils/auth/useAuth";

export default function SettingsPage() {
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/get");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setWebhookUrl(data.discord_webhook_url || "");
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async (url) => {
      const response = await fetch("/api/settings/update-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_url: url }),
      });
      if (!response.ok) {
        throw new Error("Failed to update webhook");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      Alert.alert("Succès", "Webhook Discord mis à jour !");
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de mettre à jour le webhook");
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/settings/generate-api-key", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to generate API key");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      Alert.alert("Succès", "Nouvelle clé API générée !");
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de générer la clé API");
    },
  });

  const copyApiKey = async () => {
    if (settings?.api_key) {
      await Clipboard.setStringAsync(settings.api_key);
      Alert.alert("Copié !", "Clé API copiée dans le presse-papier");
    }
  };

  const handleSaveWebhook = () => {
    updateWebhookMutation.mutate(webhookUrl);
  };

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#ffffff" }}>
          Paramètres
        </Text>
        <Text style={{ fontSize: 14, color: "#666666", marginTop: 4 }}>
          Configuration et intégrations
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
          {/* Discord Webhook Section */}
          <View
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#1a1a1a",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(88, 101, 242, 0.1)",
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Webhook color="#5865F2" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#ffffff" }}
                >
                  Webhook Discord
                </Text>
                <Text style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>
                  Notifications automatiques
                </Text>
              </View>
            </View>

            <TextInput
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://discord.com/api/webhooks/..."
              placeholderTextColor="#444444"
              style={{
                backgroundColor: "#000000",
                borderWidth: 1,
                borderColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
                color: "#ffffff",
                marginBottom: 12,
              }}
            />

            <TouchableOpacity
              onPress={handleSaveWebhook}
              disabled={updateWebhookMutation.isPending}
              style={{
                backgroundColor: "#5865F2",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {updateWebhookMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Save color="#ffffff" size={20} />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Enregistrer
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 12,
                color: "#666666",
                marginTop: 12,
                lineHeight: 18,
              }}
            >
              Les notifications seront envoyées lors de la création et de la
              complétion de tâches
            </Text>
          </View>

          {/* API Key Section */}
          <View
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#1a1a1a",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(251, 146, 60, 0.1)",
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Key color="#fb923c" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#ffffff" }}
                >
                  Clé API
                </Text>
                <Text style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>
                  Intégration externe
                </Text>
              </View>
            </View>

            {settings?.api_key ? (
              <>
                <View
                  style={{
                    backgroundColor: "#000000",
                    borderWidth: 1,
                    borderColor: "#1a1a1a",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "#ffffff",
                      fontFamily: "monospace",
                    }}
                    numberOfLines={1}
                  >
                    {showApiKey ? settings.api_key : "ebt-" + "•".repeat(32)}
                  </Text>
                  <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? (
                      <EyeOff color="#888888" size={20} />
                    ) : (
                      <Eye color="#888888" size={20} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={copyApiKey}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(251, 146, 60, 0.1)",
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderWidth: 1,
                      borderColor: "rgba(251, 146, 60, 0.2)",
                    }}
                  >
                    <Copy color="#fb923c" size={20} />
                    <Text
                      style={{
                        color: "#fb923c",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Copier
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => generateApiKeyMutation.mutate()}
                    disabled={generateApiKeyMutation.isPending}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderWidth: 1,
                      borderColor: "rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <RefreshCw color="#ef4444" size={20} />
                    <Text
                      style={{
                        color: "#ef4444",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Regénérer
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => generateApiKeyMutation.mutate()}
                disabled={generateApiKeyMutation.isPending}
                style={{
                  backgroundColor: "#fb923c",
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {generateApiKeyMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Key color="#ffffff" size={20} />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Générer une clé API
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <Text
              style={{
                fontSize: 12,
                color: "#666666",
                marginTop: 12,
                lineHeight: 18,
              }}
            >
              Utilisez cette clé pour accéder à l'API EBT et créer des tâches
              depuis vos applications externes
            </Text>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            <LogOut color="#ef4444" size={20} />
            <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
