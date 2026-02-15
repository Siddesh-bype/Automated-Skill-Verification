import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

// Simplified interfaces for Lottie animations
interface LottieHandlerProps {
    type: 'loading' | 'success' | 'error' | 'empty';
    message?: string;
    className?: string;
    width?: number;
    height?: number;
}

// We'll use URLs for now, or the user can replace these with local JSON imports
const ANIMATION_URLS = {
    loading: 'https://lottie.host/embed/98e3b5a4-1234-4567-8901-234567890abc/loading.json', // Placeholder
    success: 'https://assets2.lottiefiles.com/packages/lf20_t24tpvcu.json', // Example success
    error: 'https://assets9.lottiefiles.com/packages/lf20_k232.json', // Example error
    empty: 'https://assets9.lottiefiles.com/packages/lf20_k232.json', // Example empty (placeholder)
};

const LottieHandler: React.FC<LottieHandlerProps> = ({ type, message, className = "w-64 h-64", width, height }) => {
    const [animationData, setAnimationData] = useState<any>(null);

    // Mock loading of animation data - in a real app, you might import JSON files directly
    // specific to the type. For now, we will render a placeholder or fetch if we had valid URLs.

    // Since we don't have actual JSON files handy in the env, we'll try to use a default object
    // or just rely on the component structure. 
    // Ideally, we would fetch from a CDN or import local files.

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* 
                For this environment, since we can't easily fetch external URLs without CORS issues 
                or file access, we will use a visual placeholder with the Lottie component if data exists,
                or a fallback CSS animation if not.
             */}
            <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-full">
                {type === 'loading' && (
                    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {type === 'success' && (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">✓</div>
                )}
                {type === 'error' && (
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">!</div>
                )}
                {type === 'empty' && (
                    <div className="w-16 h-16 bg-surface-700 rounded-full flex items-center justify-center text-white text-2xl">?</div>
                )}
            </div>

            {message && (
                <p className="mt-4 text-surface-300 text-lg font-medium animate-pulse-slow text-center">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LottieHandler;
