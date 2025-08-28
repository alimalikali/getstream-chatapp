'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  DefaultStreamChatGenerics,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useCreateChatClient,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { ChannelSort } from 'stream-chat';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, logout } from '@/lib/auth-client';
import type { User } from '@/lib/auth-client';
import { UserSearch } from './UserSearch';

export default function ChatApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const tokenProvider = useCallback(async () => {
    if (!user) throw new Error('User not found');
    
    // Get a fresh token from the server
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      throw new Error('Failed to get user token');
    }
    
    const data = await response.json();
    return data.streamToken;
  }, [user]);

  // Child component mounts only after user is available and is responsible
  // for creating the Stream client. This prevents the token provider from
  // being called before a valid user exists (which caused the runtime error).
  function ChatClient({
    user,
    tokenProvider,
  }: {
    user: User;
    tokenProvider: () => Promise<string>;
  }) {
    const client = useCreateChatClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_KEY || '',
      tokenOrProvider: tokenProvider,
      userData: {
        id: user.streamUserId,
        name: user.name,
        image: `https://getstream.io/random_png/?name=${user.name}`,
      },
    }) as any;

    const sort: ChannelSort<DefaultStreamChatGenerics> = { last_message_at: -1 };
    const filters = {
      type: 'messaging',
      members: { $in: [user.streamUserId] },
    };
    const options = { limit: 10 };

    const startChat = async (otherUserId: string) => {
      if (!client) return;

      const channel = client.channel('messaging', {
        members: [user.streamUserId, otherUserId],
      });

      await channel.watch();
    };

    if (!client) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Setting up client & connection</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
            <span className="text-sm text-gray-500">Welcome, {user.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push('/profile')} variant="outline" size="sm">
              Profile
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              Logout
            </Button>
          </div>
        </div>

        <UserSearch onSelect={startChat} />

        {/* Chat Interface */}
        <div className="flex flex-row flex-1 overflow-hidden">
          <Chat client={client}>
            <ChannelList filters={filters} sort={sort} options={options} />
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // parent component handles loading and user checks; ChatClient handles Stream setup

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading chat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">User not found</div>
      </div>
    );
  }

  // Render ChatClient only when we have a valid user to avoid tokenProvider being called early
  return <ChatClient user={user} tokenProvider={tokenProvider} />;
}
