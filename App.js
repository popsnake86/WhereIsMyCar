import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  AppState,
} from "react-native";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import { fetchDB, getStorageImageUrl, storeDB, storeStorage } from "./firebase";
import IconButton from "./components/UI/IconButton";

const { width } = Dimensions.get("window");

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const fetchDBResult = await fetchDB();
      setName(fetchDBResult.name);
      setDate(fetchDBResult.date);
      const imageUrl = await getStorageImageUrl();
      setImage(imageUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const takeAndUploadPhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      Alert.alert("Permission required", "Camera access is required");
      return;
    }

    const image = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
    });

    if (image.assets != null) {
      setIsLoading(true);
      const storeDBResult = await storeDB(Device.modelName, new Date());
      const storeStorageResult = await storeStorage(image); // Firebase에 업로드
      if (storeDBResult && storeStorageResult) {
        fetchData();
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.text}>Image Loading...</Text>
        )}
        <Text style={styles.text}>Date: {date}</Text>
        <Text style={styles.text}>Name: {name}</Text>
      </View>

      <View style={styles.bottomContainer}>
        <IconButton
          icon="camera-outline"
          onPress={takeAndUploadPhoto}
          size={50}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: {
    width: width,
    height: width,
    resizeMode: "cover",
  },
  text: {
    fontWeight: "bold",
    fontSize: 18,
  },
  bottomContainer: {
    height: "20%",
    width: "100%",
    backgroundColor: "gray",
    justifyContent: "center",
  },
});
