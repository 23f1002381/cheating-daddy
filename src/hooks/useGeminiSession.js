import { useEffect, useState } from 'react';
import { useElectronAPI } from './useElectronAPI';

export const useGeminiSession = () => {
  const { api } = useElectronAPI();
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!api) return;
    const handleResponse = (response) => {
      setMessages((prev) => [...prev, response]);
    };
    api.onAIResponse(handleResponse);
    return () => {
      // Cleanup if needed
    };
  }, [api]);

  const startSession = async (apiKey, profile, language) => {
    const result = await api.startSession(apiKey, profile, language);
    setIsActive(result.success);
    return result;
  };
  const sendMessage = async (message) => {
    return await api.sendMessage(message);
  };
  return { isActive, messages, startSession, sendMessage };
};
