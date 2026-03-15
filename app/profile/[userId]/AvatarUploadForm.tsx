'use client';

import { useState, useTransition } from 'react';
import { uploadAvatar } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AvatarUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    startTransition(async () => {
      try {
        const options = {
          maxSizeMB: 0.2, // Avatars can be smaller
          maxWidthOrHeight: 500,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });

        const formData = new FormData();
        formData.append('avatar', compressedFile);

        const result = await uploadAvatar(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          router.refresh();
        }
      } catch (err) {
        console.error('Compression error:', err);
        setError('Failed to process image');
      }
    });
  };

  return (
    <div className="absolute bottom-0 right-0 z-20">
      <label
        className={`
          flex items-center justify-center w-10 h-10 rounded-full
          bg-white shadow-lg border-2 border-slate-100 cursor-pointer
          hover:bg-slate-50 transition-all transform hover:scale-105 text-slate-600 hover:text-emerald-600
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Change Profile Picture"
      >
        {isPending ? <Loader2 size={20} className="animate-spin text-emerald-600" /> : <Camera size={20} />}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>
      {error && (
        <div className="absolute top-full mt-2 right-0 w-max bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
