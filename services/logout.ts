import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export const logoutUser = async () => {
  await signOut(auth);
};