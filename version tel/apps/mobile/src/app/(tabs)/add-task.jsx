import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Calendar as RNCalendar } from "react-native-calendars";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useRequireAuth } from "@/utils/auth/useAuth";

export default function AddTaskPage() {
  useRequireAuth(); // Require authentication

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [upload, { loading: uploadLoading }] = useUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.back();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de créer la tâche");
    },
  });

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);

      const { url, error } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (error) {
        Alert.alert("Erreur", "Impossible de télécharger l'image");
        return;
      }
      setImageUrl(url);
    }
  }, [upload]);

  const handleDateSelect = (day) => {
    setDeadline(day.dateString);
    setShowCalendar(false);
  };

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est requis");
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      amount: parseFloat(amount) || 0,
    };

    createTaskMutation.mutate(taskData);
  }, [title, description, imageUrl, deadline, amount, createTaskMutation]);

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#000000" }}
      behavior="padding"
    >
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1a1a1a",
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#ffffff" }}>
            Nouvelle Tâche
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#888888",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Titre *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nom de la tâche"
            placeholderTextColor="#444444"
            style={{
              backgroundColor: "#0a0a0a",
              borderWidth: 1,
              borderColor: "#1a1a1a",
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: "#ffffff",
            }}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#888888",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Détails de la tâche"
            placeholderTextColor="#444444"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: "#0a0a0a",
              borderWidth: 1,
              borderColor: "#1a1a1a",
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: "#ffffff",
              minHeight: 100,
            }}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#888888",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Montant (€)
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#0a0a0a",
                borderWidth: 1,
                borderColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              <DollarSign color="#22c55e" size={20} />
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#444444"
                keyboardType="decimal-pad"
                style={{
                  fontSize: 16,
                  color: "#ffffff",
                  flex: 1,
                  marginLeft: 8,
                }}
              />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#888888",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Date limite
          </Text>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            style={{
              backgroundColor: "#0a0a0a",
              borderWidth: 1,
              borderColor: "#1a1a1a",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Calendar color="#888888" size={20} />
            <Text
              style={{
                fontSize: 16,
                color: deadline ? "#ffffff" : "#444444",
                flex: 1,
                marginLeft: 12,
              }}
            >
              {deadline
                ? format(new Date(deadline), "dd MMMM yyyy", { locale: fr })
                : "Sélectionner une date"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#888888",
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Image (facultatif)
          </Text>

          {selectedImage ? (
            <View>
              <Image
                source={{ uri: selectedImage.uri }}
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadLoading}
                style={{
                  backgroundColor: "#0a0a0a",
                  borderWidth: 1,
                  borderColor: "#1a1a1a",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#ffffff", fontSize: 16, fontWeight: "500" }}
                >
                  {uploadLoading ? "Téléchargement..." : "Changer l'image"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploadLoading}
              style={{
                backgroundColor: "#0a0a0a",
                borderWidth: 1,
                borderColor: "#1a1a1a",
                borderRadius: 16,
                padding: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {uploadLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <ImageIcon color="#666666" size={40} />
                  <Text
                    style={{
                      color: "#666666",
                      fontSize: 14,
                      marginTop: 12,
                      fontWeight: "500",
                    }}
                  >
                    Ajouter une image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createTaskMutation.isPending || !title.trim()}
          style={{
            backgroundColor: title.trim() ? "#ffffff" : "#1a1a1a",
            borderRadius: 12,
            padding: 18,
            alignItems: "center",
            shadowColor: title.trim() ? "#ffffff" : "transparent",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {createTaskMutation.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text
              style={{
                color: title.trim() ? "#000000" : "#666666",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Créer la tâche
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#0a0a0a",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#1a1a1a",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "#ffffff" }}
              >
                Sélectionner une date
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <X color="#888888" size={24} />
              </TouchableOpacity>
            </View>
            <RNCalendar
              onDayPress={handleDateSelect}
              markedDates={
                deadline
                  ? {
                      [deadline]: {
                        selected: true,
                        selectedColor: "#22c55e",
                      },
                    }
                  : {}
              }
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                calendarBackground: "#0a0a0a",
                textSectionTitleColor: "#888888",
                selectedDayBackgroundColor: "#22c55e",
                selectedDayTextColor: "#000000",
                todayTextColor: "#22c55e",
                dayTextColor: "#ffffff",
                textDisabledColor: "#444444",
                monthTextColor: "#ffffff",
                arrowColor: "#ffffff",
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingAnimatedView>
  );
}
