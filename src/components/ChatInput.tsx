"use client";

import { useRef, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  FaPaperPlane,
  FaImage,
  FaMicrophone,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";

type ChatParams = {
  chatId: string;
};

export default function ChatInput() {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);

  // ✅ NEW STATE
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: session } = useSession();
  const currentUser = session?.user?.id;

  const params = useParams() as ChatParams;
  const chatId = params?.chatId;

  /* ================= IMAGE SELECT ================= */

  const handleSelectImage = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  /* ================= SEND TEXT ================= */

  const sendTextMessage = async () => {
    if (!text.trim() || !chatId || !currentUser) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      userId: currentUser,
      createdAt: serverTimestamp(),
      type: "text",
    });

    setText("");
  };

  /* ================= SEND IMAGE ================= */

  const sendImage = async () => {
    if (!selectedImage || !chatId || !currentUser) return;

    try {
      const storageRef = ref(
        storage,
        `chats/${chatId}/images/${Date.now()}_${selectedImage.name}`
      );

      await uploadBytesResumable(storageRef, selectedImage);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "image",
        fileUrl: url,
        userId: currentUser,
        createdAt: serverTimestamp(),
      });

      // ✅ reset
      handleRemoveImage();
    } catch (err) {
      console.error("Image send error:", err);
    }
  };

  /* ================= AUDIO ================= */

  const startRecording = async () => {
    if (!chatId || !currentUser) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      const storageRef = ref(
        storage,
        `chats/${chatId}/audio/${Date.now()}.webm`
      );

      await uploadBytesResumable(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "chats", chatId, "messages"), {
        type: "audio",
        fileUrl: url,
        userId: currentUser,
        createdAt: serverTimestamp(),
      });
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  /* ================= UI ================= */

  return (
    <div className="p-3 bg-card border-t border-border space-y-2">

      {/* 🔥 IMAGE PREVIEW */}
      {previewUrl && (
        <div className="relative w-fit">
          <Image
          alt="name"
          width={250}
          height={250}
            src={previewUrl}
            className="w-32 h-32 object-cover rounded-lg border"
          />

          <button
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          hidden
          id="imageInput"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSelectImage(file);
          }}
        />

        <label htmlFor="imageInput" className="cursor-pointer p-2">
          <FaImage size={20} />
        </label>

        {/* TEXT INPUT */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && sendTextMessage()}
        />

        {/* AUDIO */}
        <button onClick={recording ? stopRecording : startRecording}>
          <FaMicrophone size={20} />
        </button>

        {/* SEND BUTTON */}
        <button
          onClick={selectedImage ? sendImage : sendTextMessage}
          className="bg-blue-500 text-white p-2 rounded-full"
        >
          <FaPaperPlane size={16} />
        </button>

      </div>
    </div>
  );
}