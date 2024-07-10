import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { aiChatAxios } from "@/client/libs/axios";

export type ChatMessage = {
  from: "user" | "bot";
  text: string;
};

export type ChatResponse = {
  message: string;
};

export type SendMessagePayload = {
  message: string;
  resumeId: string;
};

const sendChatMessage = async ({
  message,
  resumeId,
}: SendMessagePayload): Promise<ChatResponse> => {
  const response = await aiChatAxios.post<ChatResponse>(`/threads/${resumeId}/chats`, {
    message,
  });
  return response.data;
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: sendChatMessage,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setMessages((prevMessages) => [...prevMessages, { from: "bot", text: data.message }]);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const handleSendMessage = async ({ message, resumeId }: SendMessagePayload) => {
    setMessages((prevMessages) => [...prevMessages, { from: "user", text: message }]);
    await sendMessage({ message, resumeId });
  };

  return {
    messages,
    handleSendMessage,
    loading,
  };
};
