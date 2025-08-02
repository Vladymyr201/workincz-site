'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  className?: string;
  showApple?: boolean;
  showFacebook?: boolean;
  showGithub?: boolean;
  showGoogle?: boolean;
  vertical?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SocialAuthButtons({
  onSuccess,
  className = '',
  showApple = true,
  showFacebook = true,
  showGithub = true,
  showGoogle = true,
  vertical = false,
  size = 'default'
}: SocialAuthButtonsProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, signInWithGithub, loading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  
  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    setLoadingProvider('google');
    try {
      const result = await signInWithGoogle();
      if (result.success && onSuccess) {
        onSuccess();
      }
    } finally {
      setLoadingProvider(null);
    }
  };
  
  const handleFacebookSignIn = async () => {
    if (loading) return;
    
    setLoadingProvider('facebook');
    try {
      const result = await signInWithFacebook();
      if (result.success && onSuccess) {
        onSuccess();
      }
    } finally {
      setLoadingProvider(null);
    }
  };
  
  const handleAppleSignIn = async () => {
    if (loading) return;
    
    setLoadingProvider('apple');
    try {
      const result = await signInWithApple();
      if (result.success && onSuccess) {
        onSuccess();
      }
    } finally {
      setLoadingProvider(null);
    }
  };
  
  const handleGithubSignIn = async () => {
    if (loading) return;
    
    setLoadingProvider('github');
    try {
      const result = await signInWithGithub();
      if (result.success && onSuccess) {
        onSuccess();
      }
    } finally {
      setLoadingProvider(null);
    }
  };
  
  return (
    <div className={`${vertical ? 'flex flex-col space-y-3' : 'flex flex-wrap gap-3'} ${className}`}>
      {showGoogle && (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={`${vertical ? 'w-full' : ''} flex items-center`}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {size !== 'icon' && 'Google'}
        </Button>
      )}
      
      {showFacebook && (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={`${vertical ? 'w-full' : ''} flex items-center`}
          onClick={handleFacebookSignIn}
          disabled={loading}
        >
          {loadingProvider === 'facebook' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
          )}
          {size !== 'icon' && 'Facebook'}
        </Button>
      )}
      
      {showApple && (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={`${vertical ? 'w-full' : ''} flex items-center`}
          onClick={handleAppleSignIn}
          disabled={loading}
        >
          {loadingProvider === 'apple' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M17.569 12.6254C17.597 15.4237 20.2179 16.3088 20.247 16.3203C20.2248 16.3873 19.8282 17.7243 18.8563 19.1105C18.0254 20.3134 17.1696 21.5089 15.8152 21.5351C14.4614 21.5601 14.0429 20.7676 12.4724 20.7676C10.9019 20.7676 10.4267 21.5351 9.15912 21.5601C7.85912 21.5851 6.85912 20.2301 6.01671 19.0351C4.30681 16.5905 3.0307 11.9105 4.78322 8.75182C5.65389 7.17786 7.26661 6.15286 9.02965 6.12786C10.3334 6.10286 11.5586 6.99182 12.3586 6.99182C13.1586 6.99182 14.6586 5.91682 16.2357 6.10182C16.9357 6.12786 18.8357 6.37786 20.0357 8.15182C19.9193 8.21682 17.5461 9.58682 17.569 12.6254ZM15.0357 4.40182C15.7357 3.55182 16.2107 2.37682 16.0607 1.18286C15.0607 1.23286 13.8107 1.87786 13.0857 2.72786C12.4357 3.47786 11.8607 4.67786 12.0357 5.85182C13.1607 5.94182 14.3357 5.25182 15.0357 4.40182Z"
                fill="black"
              />
            </svg>
          )}
          {size !== 'icon' && 'Apple'}
        </Button>
      )}
      
      {showGithub && (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={`${vertical ? 'w-full' : ''} flex items-center`}
          onClick={handleGithubSignIn}
          disabled={loading}
        >
          {loadingProvider === 'github' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                fill="black"
              />
            </svg>
          )}
          {size !== 'icon' && 'GitHub'}
        </Button>
      )}
    </div>
  );
}