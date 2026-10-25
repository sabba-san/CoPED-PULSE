import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function UserProfileDropdown() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (!user) return null;

    const firstName = user.name ? user.name.split(' ')[0] : 'User';
    const initials = user.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'U';

    const roleConfig = {
        coordinator: {
            label: 'COORDINATOR',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        },
        staff: {
            label: 'INSTRUCTOR',
            badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        },
        learner: {
            label: 'LEARNER',
            badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        },
    };

    const currentRole = roleConfig[user.role] || roleConfig.learner;

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Trigger Button: Hi, {firstName} */}
            <button
                type="button"
                id="user-profile-menu-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border-2 transition-all min-h-[38px] sm:min-h-[44px] ${
                    isOpen
                        ? 'border-[#111827] bg-[#F3F4F6]'
                        : 'border-[#E5E7EB] hover:border-[#111827] bg-white text-[#111827]'
                }`}
            >
                {/* User Avatar Circle */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-extrabold text-[11px] sm:text-xs shrink-0 select-none">
                    {initials}
                </div>

                {/* Name & Role */}
                <div className="text-left flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#111827] truncate max-w-[90px] sm:max-w-[130px]">
                        Hi, {firstName}
                    </span>
                    <span
                        className={`hidden md:inline-block px-1.5 py-0.2 text-[9px] font-black uppercase rounded border ${currentRole.badgeBg}`}
                    >
                        {currentRole.label}
                    </span>
                </div>

                {/* Flat Chevron */}
                <span className="text-xs text-gray-500 font-bold ml-0.5 select-none transition-transform duration-150">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {/* Flat Dropdown Menu */}
            {isOpen && (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-profile-menu-button"
                    className="absolute right-0 top-full mt-2 w-72 bg-white border-2 border-[#111827] rounded-lg z-50 overflow-hidden text-left animate-fade-in"
                >
                    {/* Header Section: About Me Card */}
                    <div className="p-3.5 bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-[#111827] text-white flex items-center justify-center font-display font-black text-sm shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-display font-extrabold text-sm text-[#111827] truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate" title={user.email}>
                                    {user.email}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span
                                        className={`inline-block px-1.5 py-0.5 text-[9px] font-black uppercase rounded border ${currentRole.badgeBg}`}
                                    >
                                        {currentRole.label}
                                    </span>
                                    {user.phone && (
                                        <span className="text-[10px] text-gray-500 truncate">
                                            · {user.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="p-1.5 space-y-1">
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>👤</span>
                                <span>My Profile &amp; Account Settings</span>
                            </span>
                            <span className="text-gray-400 font-bold">→</span>
                        </Link>

                        <Link
                            href={route('profile.edit') + '#password'}
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>🔒</span>
                                <span>Change Password</span>
                            </span>
                            <span className="text-gray-400 font-bold">→</span>
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-[#E5E7EB]" />

                    {/* Logout Button */}
                    <div className="p-1.5">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>🚪</span>
                                <span>Log Out</span>
                            </span>
                            <span className="text-red-400 font-bold">→</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
