'use client';

import { UserIcon } from '@heroicons/react/24/outline';

interface UserProfileProps {
  name: string;
  surname: string;
  email: string;
}

export default function UserProfile({ name, surname, email }: UserProfileProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{name.charAt(0)}{surname.charAt(0)}</span>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-100">{name} {surname}</h2>
        <p className="text-gray-400">{email}</p>
      </div>
    </div>
  );
} 