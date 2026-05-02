"use server";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { adminDb } from "@/lib/firebase-admin";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterInput) {
  try {
    // 1️⃣ إنشاء المستخدم في Firebase Auth
    const userCred = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCred.user;

    // 2️⃣ تحديث الاسم
    await updateProfile(user, {
      displayName: data.name,
    });

    // 3️⃣ 🔥 تخزين المستخدم في Firestore (دي أهم خطوة)
    await adminDb.collection("users").doc(user.uid).set({
      name: data.name,
      email: data.email,
      createdAt: new Date(),
    });

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: data.name,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}