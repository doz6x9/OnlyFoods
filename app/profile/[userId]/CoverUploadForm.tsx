'use client';

import { useState, useTransition } from 'react';
import { uploadCover } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function CoverUploadForm() {
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
          maxSizeMB: 0.4, // Covers can be a bit larger
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });

        const formData = new FormData();
        formData.append('cover', compressedFile);

        const result = await uploadCover(formData);
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
    <div className="absolute top-4 right-4 z-20">
      <label
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10
          text-white text-xs font-bold cursor-pointer transition-all shadow-lg
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        <span>{isPending ? 'Uploading...' : 'Change Cover'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      </label>
      {error && (
        <div className="absolute top-full mt-2 right-0 w-max bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
