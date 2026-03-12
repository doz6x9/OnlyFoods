import Image from 'next/image';
import Link from 'next/link';

type Post = {
  id: string;
  created_at: string;
  image_url: string;
  description: string;
  has_recipe: boolean;
  profiles: {
    id: string;
    email: string;
  } | null;
};

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const authorEmail = post.profiles?.email ?? 'Unknown User';
  const authorId = post.profiles?.id;

  return (
    <div className="relative group rounded-[32px] overflow-hidden aspect-[3/4] shadow-2xl">
      {/* The Main Image */}
      <Image
        src={post.image_url}
        alt={post.description}
        fill
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

      {/* Content Overlays */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <Link href={`/profile/${authorId}`} className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded-full" />
            <span className="text-xs font-medium">{authorEmail}</span>
          </Link>
          {post.has_recipe && (
            <div className="bg-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase italic">
              Live Recipe
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-black leading-tight mb-2 uppercase italic tracking-tighter">
            {post.description.split(' ').slice(0, 3).join(' ')}
          </h3>
          <div className="flex items-center gap-4 text-sm font-medium">
             <span className="flex items-center gap-1"><span className="text-orange-500">🔥</span> 86.5k</span>
             <span className="flex items-center gap-1"><span className="text-blue-400">💬</span> 1.2k</span>
          </div>
        </div>
      </div>
    </div>
  );
}
