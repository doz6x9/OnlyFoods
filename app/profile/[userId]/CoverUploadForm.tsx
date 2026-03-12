'use client';

import { useState, useTransition } from 'react';
import { uploadCover } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function CoverUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    startTransition(async () => {
      const result = await uploadCover(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <label
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-black/30 hover:bg-black/50 backdrop-blur-md
          text-white text-xs font-medium cursor-pointer transition-all
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
        <span>{isPending ? 'Uploading...' : 'Edit Cover'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>
      {error && (
        <div className="absolute top-full mt-2 right-0 w-max bg-red-100 text-red-600 text-xs px-2 py-1 rounded shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
