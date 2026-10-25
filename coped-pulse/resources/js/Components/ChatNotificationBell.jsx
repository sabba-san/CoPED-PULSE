import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function ChatNotificationBell({ isStaff = false }) {
    const { unreadChatSummary } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastDismissed, setToastDismissed] = useState(false);
    const dropdownRef = useRef(null);

    const totalUnread = unreadChatSummary?.total_unread || 0;
    const latestItems = unreadChatSummary?.latest_items || [];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show floating toast for the latest incoming unread message
    useEffect(() => {
        if (latestItems.length > 0 && !toastDismissed) {
            setToastMessage(latestItems[0]);
        }
    }, [latestItems, toastDismissed]);

    const getChatLink = (courseId) => {
        return isStaff
            ? route('staff.courses.edit', courseId) + '?tab=chat'
            : route('learner.course.learn', courseId) + '?tab=chat';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-md border-2 border-gray-200 bg-white text-gray-700 hover:text-black hover:border-black transition-colors focus:outline-none"
                aria-label={`Chat Notifications (${totalUnread} unread)`}
                title={`Chat Notifications (${totalUnread} unread)`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#10B981] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white leading-none">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Flat Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 max-w-sm bg-white border-2 border-[#111827] rounded-md z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 bg-[#111827] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm uppercase tracking-wide">Course Chat Messages</span>
                            {totalUnread > 0 && (
                                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded">
                                    {totalUnread} New
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white text-xs font-bold px-1"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="max-h-80 overflow-y-auto divide-y-2 divide-gray-100">
                        {latestItems.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500 font-medium">
                                <span className="block text-2xl mb-1">🎉</span>
                                No unread messages. You are all caught up!
                            </div>
                        ) : (
                            latestItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={getChatLink(item.course_id)}
                                    onClick={() => setIsOpen(false)}
                                    className="block p-3 hover:bg-[#F3F4F6] transition-colors text-left"
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-extrabold text-[#111827] truncate max-w-[180px]">
                                            {item.course_title}
                                        </span>
                                        {isStaff && item.is_whatsapp && (
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-300">
                                                WhatsApp
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs font-bold text-gray-800 mb-0.5">
                                        {item.sender_name}
                                        {item.sender_role === 'staff' && (
                                            <span className="ml-1 text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                                Instructor
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 line-clamp-2">
                                        {item.body.replace('[WhatsApp] ', '')}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {latestItems.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t-2 border-gray-100 text-center">
                            <span className="text-[11px] text-gray-500 font-semibold">
                                Click any message to open the course chat
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Responsive Floating Toast Banner for New Messages */}
            {toastMessage && !toastDismissed && totalUnread > 0 && (
                <div className="fixed inset-x-3 top-16 sm:top-auto sm:bottom-5 sm:left-auto sm:right-6 sm:w-96 max-w-sm z-50 bg-white border-2 border-[#111827] rounded-md p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full inline-block animate-pulse"></span>
                                <span className="text-xs font-extrabold text-[#111827] uppercase tracking-wider truncate">
                                    New Message in {toastMessage.course_title}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-800">
                                {toastMessage.sender_name}:
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                {toastMessage.body.replace('[WhatsApp] ', '')}
                            </p>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={getChatLink(toastMessage.course_id)}
                                    onClick={() => setToastDismissed(true)}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#111827] rounded hover:bg-black transition-colors"
                                >
                                    Open Chat →
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setToastDismissed(true)}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToastDismissed(true)}
                            className="text-gray-400 hover:text-black text-xs font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
