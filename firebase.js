import { Alert } from "react-native";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";

// DB
const DB_URL =
  "https://whereismycar-4f647-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function storeDB(name, date) {
  try {
    const response = await axios.post(DB_URL + "/date.json", {
      date: date,
      name: name,
    });
    const id = response.data.name;
    return id;
  } catch (error) {
    Alert.alert("storeDB Error", error);
    return "";
  }
}

export async function fetchDB() {
  const result = {};

  const response = await axios.get(
    DB_URL + `/date.json?orderBy="$key"&limitToLast=1`
  );

  for (const key in response.data) {
    result.date = response.data[key].date;
    result.name = response.data[key].name;
  }

  return result;
}

// Storage
const firebaseConfig = {
  projectId: "whereismycar-4f647",
  storageBucket: "whereismycar-4f647.appspot.com",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, `images/image.jpg`);

export async function storeStorage(image) {
  if (!image) return;

  try {
    const response = await fetch(image.assets[0].uri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob)
      .then(() => {
        return true;
      })
      .catch((error) => {
        Alert.alert("uploadBytes Error", error);
        return false;
      });
  } catch (error) {
    Alert.alert("getDownloadURL Error", error);
  }
}

export async function getStorageImageUrl() {
  const url = await getDownloadURL(storageRef);
  return url;
}
