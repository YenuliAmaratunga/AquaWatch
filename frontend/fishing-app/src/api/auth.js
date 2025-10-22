import AsyncStorage from "@react-native-async-storage/async-storage";

// Always give us a normalized { userId, userName }
// (We ignore NIC for these 4 screens)
export async function ensureProfile() {
  let a = {}, b = {};
  try { a = JSON.parse((await AsyncStorage.getItem("authData")) || "{}"); } catch {}
  try { b = JSON.parse((await AsyncStorage.getItem("auth")) || "{}"); } catch {}

  const userId =
    a.userId ||
    b?.user?.id ||
    b?.user?._id ||
    b?.user?.userId ||
    b?.user?.nationalId ||
    null;

  const userName =
    a.userName ||
    b?.user?.userName ||
    b?.user?.name ||
    null;

  return { userId, userName };
}
