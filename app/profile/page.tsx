'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getCurrentUser, logout } from '@/lib/auth-client';
import type { User } from '@/lib/auth-client';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg">User not found</div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-2xl mx-auto">
    //     <div className="mb-8">
    //       <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
    //       <p className="mt-2 text-gray-600">Manage your account settings</p>
    //     </div>

    //     <div className="space-y-6">
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Account Information</CardTitle>
    //           <CardDescription>
    //             Your personal account details
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700">Name</label>
    //             <p className="mt-1 text-sm text-gray-900">{user.name}</p>
    //           </div>
              
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700">Email</label>
    //             <p className="mt-1 text-sm text-gray-900">{user.email}</p>
    //           </div>
              
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700">User ID</label>
    //             <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
    //           </div>
              
    //           <div>
    //             <label className="block text-sm font-medium text-gray-700">Stream User ID</label>
    //             <p className="mt-1 text-sm text-gray-900 font-mono">{user.streamUserId}</p>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Actions</CardTitle>
    //           <CardDescription>
    //             Manage your account
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-4">
    //           <div className="flex space-x-4">
    //             <Button
    //               onClick={() => router.push('/chat')}
    //               variant="outline"
    //             >
    //               Back to Chat
    //             </Button>
                
    //             <Button
    //               onClick={handleLogout}
    //               variant="destructive"
    //             >
    //               Sign Out
    //             </Button>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </div>
    //   </div>
    // </div>
      <div className="container py-6">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <strong>Stream ID:</strong> <span className="break-all">{user.streamUserId}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => router.push('/chat')}>Go to Chat</Button>
                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
