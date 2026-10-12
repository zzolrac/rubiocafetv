import { useEffect, useState } from 'react';
import { useMessageStore, TemporaryMessage } from '../store/messageStore';

interface MessageBannerProps {
  screenId: string;
}

export default function MessageBanner({ screenId }: MessageBannerProps) {
  const { messages, fetchActiveMessages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const [activeMessage, setActiveMessage] = useState<TemporaryMessage | null>(null);

  useEffect(() => {
    fetchActiveMessages(screenId);
    subscribeToMessages(screenId);

    const interval = setInterval(() => {
      fetchActiveMessages(screenId);
    }, 120000);

    return () => {
      clearInterval(interval);
      unsubscribeFromMessages();
    };
  }, [screenId, fetchActiveMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const screenMessages = messages.filter(msg =>
      msg.screen_ids.includes(screenId) &&
      new Date(msg.expires_at) > new Date()
    );

    if (screenMessages.length > 0) {
      setActiveMessage(screenMessages[0]);
    } else {
      setActiveMessage(null);
    }
  }, [messages, screenId]);

  if (!activeMessage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 text-white py-6 shadow-2xl z-50 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="text-4xl font-bold mx-16 inline-block">
          {activeMessage.message}
        </span>
        <span className="text-4xl font-bold mx-16 inline-block">
          {activeMessage.message}
        </span>
        <span className="text-4xl font-bold mx-16 inline-block">
          {activeMessage.message}
        </span>
        <span className="text-4xl font-bold mx-16 inline-block">
          {activeMessage.message}
        </span>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
