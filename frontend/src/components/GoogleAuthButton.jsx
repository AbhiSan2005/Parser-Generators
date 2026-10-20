import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { setSessionUser, logoutUser } from '../store/authSlice';
import { googleLoginApi } from '../api/authClient';

const GoogleAuthButton = ({ compact = false }) => {
    const dispatch = useDispatch();
    const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setErrorMsg('');
            const res = await googleLoginApi(credentialResponse.credential);
            if (res.success && res.data) {
                dispatch(setSessionUser(res.data));
            } else {
                setErrorMsg(res.message || 'Login failed');
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    if (isAuthenticated) {
        if (compact) {
            return (
                <div className="flex flex-col items-center gap-1">
                    {currentUser.avatar ? (
                        <img 
                            src={currentUser.avatar} 
                            alt={currentUser.username} 
                            className="w-9 h-9 rounded-full border border-mocha-mauve object-cover" 
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-mocha-mauve text-mocha-base flex items-center justify-center font-bold text-sm">
                            {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <button 
                        onClick={handleLogout} 
                        className="text-xs text-mocha-red hover:underline mt-1"
                        title="Sign Out"
                    >
                        Sign Out
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-mocha-surface0/60 border border-mocha-surface1 w-full">
                <div className="flex items-center gap-3 overflow-hidden">
                    {currentUser.avatar ? (
                        <img 
                            src={currentUser.avatar} 
                            alt={currentUser.username} 
                            className="w-9 h-9 rounded-full border border-mocha-mauve object-cover shrink-0" 
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-mocha-mauve text-mocha-base flex items-center justify-center font-bold text-sm shrink-0">
                            {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-mocha-text truncate">
                            {currentUser.username}
                        </span>
                        <span className="text-xs text-mocha-subtext0 truncate">
                            {currentUser.email || `ID: ${currentUser.user_id}`}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 text-xs font-semibold text-mocha-red bg-mocha-surface0 hover:bg-mocha-surface1 rounded-md transition-colors shrink-0 ml-2"
                    title="Sign Out"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    if (!clientId) {
        return (
            <div className={`text-xs text-mocha-subtext0 ${compact ? 'text-center p-1' : 'p-3 bg-mocha-surface0/40 rounded-lg border border-dashed border-mocha-surface1'}`}>
                {compact ? (
                    <span title="Google Client ID not configured" className="cursor-help">⚠️</span>
                ) : (
                    <div>
                        <span className="font-semibold text-mocha-yellow">Google Auth:</span>
                        <p className="mt-1">Add <code className="text-mocha-mauve text-[11px]">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-mocha-mauve text-[11px]">.env</code> to activate.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            {loading && <span className="text-xs text-mocha-blue animate-pulse">Signing in...</span>}
            {errorMsg && <span className="text-xs text-mocha-red text-center">{errorMsg}</span>}
            <div className="google-btn-wrapper overflow-hidden rounded-md flex justify-center w-full">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setErrorMsg('Google login was cancelled or encountered an error.')}
                    theme="filled_black"
                    shape="pill"
                    size={compact ? 'medium' : 'large'}
                    text="signin_with"
                    useOneTap={false}
                />
            </div>
        </div>
    );
};

export default GoogleAuthButton;
