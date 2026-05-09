"use server";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { adminDb } from "@/lib/firebase-admin";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterInput) {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCred.user;

    await updateProfile(user, {
      displayName: data.name,
    });

    await adminDb.collection("users").doc(user.uid).set({
      name: data.name,
      email: data.email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Account created successfully",
      user: {
        id: user.uid,
        email: user.email,
        name: data.name,
      },
    };
  } catch (error: any) {
    let errorMessage = "Something went wrong";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email already exists";
        break;

      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;

      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters";
        break;

      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}