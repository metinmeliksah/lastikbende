'use client';

import { UserIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
  name: string;
  email: string;
}

export default function UserProfile({ name, email }: UserProfileProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 rounded-full bg-dark-200 relative overflow-hidden flex items-center justify-center">
        <UserIcon className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{name}</h1>
        <p className="text-gray-400">{email}</p>
      </div>
    </div>
  );
} 