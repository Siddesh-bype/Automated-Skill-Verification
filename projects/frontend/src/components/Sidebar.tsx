import React from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { clearSession } from '../utils/session';

interface SidebarProps {
    activeAddress: string | undefined;
    onLogout: () => void;
    certCount: number; // For stats
    onNavigate: (view: string) => void;
}

const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconLogOut = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const IconFileText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ activeAddress, onLogout, certCount, onNavigate }) => {
    const shortAddress = activeAddress
        ? `${activeAddress.substring(0, 6)}...${activeAddress.substring(activeAddress.length - 4)}`
        : 'Guest';

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-surface-900 border-r border-surface-800 flex flex-col z-40 transition-transform duration-300">
            {/* Header / Logo Area if needed, or just top spacing */}
            <div className="h-16 flex items-center px-6 border-b border-surface-800">
                <span className="font-bold text-lg text-surface-50 tracking-tight">Dashboard</span>
            </div>

            {/* User Logic */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white">
                        <IconUser />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{shortAddress}</p>
                        <p className="text-xs text-surface-400">Student</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-surface-800/50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-surface-400 uppercase font-semibold">Certificates</span>
                        <IconFileText />
                    </div>
                    <p className="text-2xl font-bold text-brand-300">{certCount}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <button onClick={() => onNavigate('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors text-left">
                    <span>Dashboard</span>
                </button>
                <button onClick={() => onNavigate('submit')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors text-left">
                    <span>Submit Evidence</span>
                </button>
                <button onClick={() => onNavigate('verify')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors text-left">
                    <span>Verify Credential</span>
                </button>
                <button onClick={() => onNavigate('employers')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors text-left">
                    <span>For Employers</span>
                </button>
                <button onClick={() => onNavigate('portfolio')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors text-left">
                    <span>My Portfolio</span>
                </button>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-surface-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                    <IconLogOut />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
