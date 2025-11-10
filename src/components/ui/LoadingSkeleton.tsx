import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'avatar' | 'button' | 'input';
  lines?: number;
  animated?: boolean;
}

export function LoadingSkeleton({
  className = '',
  variant = 'text',
  lines = 1,
  animated = true
}: LoadingSkeletonProps) {
  const baseClasses = `bg-gray-200 ${animated ? 'animate-pulse' : ''}`;

  const variants = {
    card: 'rounded-xl h-32',
    text: 'rounded h-4',
    circle: 'rounded-full w-12 h-12',
    avatar: 'rounded-full w-16 h-16',
    button: 'rounded-lg h-10 w-24',
    input: 'rounded-lg h-12'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variants.text} ${className}`}
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
}

interface SearchLoadingProps {
  message?: string;
  progress?: number;
}

export function SearchLoadingSkeleton({ message = 'جاري البحث...', progress }: SearchLoadingProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          {progress !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-lg font-semibold text-gray-700 mb-4">{message}</p>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="space-y-4">
        <LoadingSkeleton variant="text" lines={2} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    </div>
  );
}

interface PackageCardSkeletonProps {
  count?: number;
}

export function PackageCardSkeleton({ count = 3 }: PackageCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" className="w-3/4" />
              <LoadingSkeleton variant="text" className="w-1/2" />
            </div>
            <LoadingSkeleton variant="button" className="w-24" />
          </div>
          <LoadingSkeleton variant="text" className="w-2/3" />
        </div>
      ))}
    </div>
  );
}

interface BeneficiaryInfoSkeletonProps {
  withPackages?: boolean;
}

export function BeneficiaryInfoSkeleton({ withPackages = true }: BeneficiaryInfoSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-1/2" />
          <LoadingSkeleton variant="text" className="w-1/3" />
        </div>
      </div>

      {withPackages && (
        <>
          <div className="border-t border-gray-200 pt-6">
            <LoadingSkeleton variant="text" className="w-1/4 mb-4" />
            <PackageCardSkeleton count={2} />
          </div>
        </>
      )}
    </div>
  );
}

export default LoadingSkeleton;
