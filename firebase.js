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
    Alert.alert("storeDB Error");
    console.log(error);
    return "";
  }
}

export async function fetchDB() {
  try {
    const result = {};

    const response = await axios.get(
      DB_URL + `/date.json?orderBy="$key"&limitToLast=1`
    );

    for (const key in response.data) {
      result.date = response.data[key].date;
      result.name = response.data[key].name;
    }

    return result;
  } catch (error) {
    Alert.alert("fetchDB error");
    console.log(error);
  }
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

  const response = await fetch(image.assets[0].uri);
  const blob = await response.blob();
  let result = false;

  await uploadBytes(storageRef, blob)
    .then(() => {
      result = true;
    })
    .catch((error) => {
      Alert.alert("uploadBytes Error");
      result = false;
    });

  return result;
}

export async function getStorageImageUrl() {
  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    Alert.alert("getStorageImageUrl error");
  }
}
