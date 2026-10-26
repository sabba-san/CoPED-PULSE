import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';
import ChatNotificationBell from '@/Components/ChatNotificationBell';
import UserProfileDropdown from '@/Components/UserProfileDropdown';

export default function LearnerLayout({ children }) {
    const { url, props } = usePage();
    const flash = props?.flash;
    const { unreadChatSummary } = props;
    const totalUnread = unreadChatSummary?.total_unread || 0;
    const [mobileAlertsOpen, setMobileAlertsOpen] = useState(false);

    const navLinks = [
        { name: 'My Portal', href: route('portal'), active: url.startsWith('/portal') },
        { name: 'Browse Catalog', href: route('learner.catalog'), active: url.startsWith('/learner/catalog') },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans w-full max-w-[100vw] overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b-2 border-[#E5E7EB] print:hidden w-full max-w-full">
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16 items-center w-full max-w-full gap-2">
                        <div className="flex items-center space-x-3 sm:space-x-8">
                            <Link href={route('portal')} className="flex items-center space-x-2 sm:space-x-3 shrink-0" aria-label="CoPED PULSE Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-7 sm:h-8 w-auto" />
                                <span className="text-sm sm:text-xl font-display font-black tracking-tight text-[#111827]">
                                    CoPED PULSE
                                </span>
                            </Link>
                            
                            <div className="hidden md:flex space-x-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                            link.active
                                                ? 'bg-[#111827] text-white font-bold'
                                                : 'text-gray-700 hover:text-[#111827] hover:bg-[#F3F4F6] font-semibold'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <ChatNotificationBell isStaff={false} />
                            <UserProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Messages (hidden when printing) */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 print:hidden">
                    <div className="bg-emerald-50 border-2 border-[#10B981] text-[#065F46] rounded-md px-4 sm:px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">✓</span>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 print:hidden">
                    <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] rounded-md px-4 sm:px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#F59E0B] text-[#111827] rounded-full flex items-center justify-center text-xs font-black shrink-0">!</span>
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-6 lg:px-8 pb-20 md:pb-8 print:p-0 print:m-0 print:max-w-none">
                {children}
            </main>

            {/* Sticky Mobile Bottom Navigation Bar: 4-Column Flat App Bar */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-white border-t-2 border-[#111827] print:hidden"
            >
                <div className="grid grid-cols-4 w-full max-w-full divide-x-2 divide-gray-200">
                    <Link
                        href={route('portal')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.startsWith('/portal')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">🏠</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Portal</span>
                    </Link>

                    <Link
                        href={route('learner.catalog')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.startsWith('/learner/catalog')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">📚</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Catalog</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileAlertsOpen(true)}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors relative min-w-0 ${
                            mobileAlertsOpen || url.includes('tab=chat')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                        aria-label="Open Alerts Drawer"
                    >
                        <div className="relative inline-block mb-1 shrink-0">
                            <span className="text-base leading-none">💬</span>
                            {totalUnread > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-[#10B981] text-white text-[9px] font-black px-1 rounded-full leading-none">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">
                            Alerts{totalUnread > 0 ? ` (${totalUnread})` : ''}
                        </span>
                    </button>

                    <Link
                        href={route('profile.edit')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-colors min-w-0 ${
                            url.startsWith('/profile')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">👤</span>
                        <span className="text-[10px] uppercase tracking-wide leading-none truncate w-full text-center">Profile</span>
                    </Link>
                </div>
            </nav>

            {/* Mobile Alerts Modal / Sheet: Strict Flat Design (0 backdrop-blur, 0 shadows) */}
            {mobileAlertsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-alerts-title"
                >
                    <div className="bg-white border-2 border-[#111827] rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden text-left">
                        {/* Header */}
                        <div className="p-3.5 bg-[#111827] text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span id="mobile-alerts-title" className="font-extrabold text-sm uppercase tracking-wide">
                                    Course Chat Alerts
                                </span>
                                {totalUnread > 0 && (
                                    <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded">
                                        {totalUnread} New
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileAlertsOpen(false)}
                                className="text-gray-400 hover:text-white text-sm font-bold px-2 py-1 leading-none"
                                aria-label="Close Alerts Dialog"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto divide-y-2 divide-gray-100 flex-1 p-2">
                            {unreadChatSummary?.latest_items && unreadChatSummary.latest_items.length > 0 ? (
                                unreadChatSummary.latest_items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('learner.course.learn', item.course_id) + '?tab=chat'}
                                        onClick={() => setMobileAlertsOpen(false)}
                                        className="block p-3 hover:bg-[#F3F4F6] rounded transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="font-extrabold text-[#111827] truncate max-w-[200px]">
                                                {item.course_title}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                                                Open Chat →
                                            </span>
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
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-600">
                                    <span className="block text-3xl mb-2">🎉</span>
                                    <p className="font-bold text-[#111827] mb-1">No unread alerts</p>
                                    <p className="text-xs text-gray-500 mb-4">You are all caught up with your instructors and class chats.</p>
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href={route('portal')}
                                            onClick={() => setMobileAlertsOpen(false)}
                                            className="w-full bg-[#111827] hover:bg-black text-white font-bold text-xs py-2.5 px-4 rounded transition-colors text-center"
                                        >
                                            View My Enrolled Courses
                                        </Link>
                                        <Link
                                            href={route('learner.catalog')}
                                            onClick={() => setMobileAlertsOpen(false)}
                                            className="w-full border-2 border-[#111827] text-[#111827] hover:bg-[#F3F4F6] font-bold text-xs py-2 px-4 rounded transition-colors text-center"
                                        >
                                            Browse Course Catalog
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-between text-xs shrink-0">
                            <span className="text-[11px] text-gray-500 font-medium">
                                Direct Q&amp;A and group updates
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileAlertsOpen(false)}
                                className="px-3 py-1.5 font-bold text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 text-[#111827] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

