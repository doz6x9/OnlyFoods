'use client';

import { useState, useTransition } from 'react';
import { uploadAvatar } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';

export default function AvatarUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Automatically submit when a file is selected
    const formData = new FormData();
    formData.append('avatar', file);

    startTransition(async () => {
      const result = await uploadAvatar(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="absolute bottom-0 right-0">
      <label
        className={`
          flex items-center justify-center w-8 h-8 rounded-full
          bg-white shadow-md border border-slate-200 cursor-pointer
          hover:bg-slate-50 transition-colors text-slate-600
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Change Profile Picture"
      >
        <Camera size={16} />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>
      {error && (
        <div className="absolute top-full mt-1 right-0 w-max bg-red-100 text-red-600 text-xs px-2 py-1 rounded shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
