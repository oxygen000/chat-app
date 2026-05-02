"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatInput from "@/components/ChatInput";
import Image from "next/image";

/* ================= TYPES ================= */

type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

type BaseMessage = {
  id: string;
  userId: string;
  createdAt?: FirestoreTimestamp;
};

type TextMessage = BaseMessage & {
  type: "text";
  text: string;
};

type ImageMessage = BaseMessage & {
  type: "image";
  fileUrl: string;
};

type AudioMessage = BaseMessage & {
  type: "audio";
  fileUrl: string;
};

type Message = TextMessage | ImageMessage | AudioMessage;

/* ================= COMPONENT ================= */

export default function ChatPage() {
  const { chatId } = useParams();
  const { data: session } = useSession();

  const currentUser = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId as string, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as Omit<Message, "id">),
          }) as Message,
      );

      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-bg text-text">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-soft">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUser;

          return (
            <div
              key={msg.id}
              className={`flex w-full ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  px-4 py-2 rounded-2xl max-w-[70%] text-sm break-words shadow-sm
                  flex flex-col
                  ${
                    isMe
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-card text-text border border-border rounded-bl-none"
                  }
                `}
              >
                {/* TEXT */}
                {msg.type === "text" && <span>{msg.text}</span>}

                {/* IMAGE */}
                {msg.type === "image" && (
                  <Image
                    width={200}
                    height={200}
                    src={msg.fileUrl}
                    alt="image"
                    className="rounded-lg max-w-[200px]"
                  />
                )}

                {/* AUDIO */}
                {msg.type === "audio" && <audio controls src={msg.fileUrl} />}

                {/* TIME */}
                {msg.createdAt?.seconds && (
                  <span
                    className={`text-[10px] mt-1 opacity-70 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-border bg-card">
        <ChatInput />
      </div>
    </div>
  );
}
