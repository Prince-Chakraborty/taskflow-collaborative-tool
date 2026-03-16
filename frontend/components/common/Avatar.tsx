import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar = ({ name, avatar, size = 'md', className }: AvatarProps) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (avatar) {
    return (
      <div className={cn('relative rounded-full overflow-hidden', sizes[size], className)}>
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
        sizes[size],
        getAvatarColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
