'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '../providers';

export default function ChatPage() {
  const router = useRouter();
  const { setChatOpen, setChatTab } = useChat();

  useEffect(() => {
    setChatTab('chat');
    setChatOpen(true);
    router.replace('/');
  }, [router, setChatOpen, setChatTab]);

  return (
    <div className="min-h-screen bg-[#050e0a] text-gray-100 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-500 border-t-transparent"></div>
      <p className="mt-4 text-xs text-gray-400">Redirecting to Live Consultant Workspace...</p>
    </div>
  );
}
