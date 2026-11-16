import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';
import ChatNotificationBell from '@/Components/ChatNotificationBell';
import UserProfileDropdown from '@/Components/UserProfileDropdown';
import {
    BookOpenIcon,
    HomeIcon,
    BellIcon,
    UserIcon,
    XMarkIcon,
} from '@/Components/flat/icons';

export default function LearnerLayout({ children, wide = false }) {
    const { url, props } = usePage();
    const flash = props?.flash;
    const { unreadChatSummary } = props;
    const totalUnread = unreadChatSummary?.total_unread || 0;
    const [mobileAlertsOpen, setMobileAlertsOpen] = useState(false);
    const containerClass = wide
        ? 'w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10'
        : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

    const navLinks = [
        { name: 'Browse Catalog', href: route('learner.catalog'), active: url.startsWith('/learner/catalog') },
        { name: 'My Portal', href: route('portal'), active: url.startsWith('/portal') },
    ];

    const mobileTitle = url.startsWith('/learner/catalog')
        ? 'Explore Catalog'
        : url.startsWith('/profile')
        ? 'My Profile'
        : url.includes('/learn')
        ? 'Course Theater'
        : 'My Learning';

    const isPortalActive = url.startsWith('/portal');
    const isCatalogActive = url.startsWith('/learner/catalog');
    const isAlertsActive = mobileAlertsOpen || url.includes('tab=chat');
    const isProfileActive = url.startsWith('/profile');

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans w-full max-w-[100vw] overflow-x-hidden">
            {/* Top Navigation: Native-style compact App Bar on mobile, institutional bar on desktop */}
            <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] md:border-b-2 pt-[env(safe-area-inset-top)] print:hidden w-full max-w-full">
                <div className={containerClass}>
                    <div className="flex justify-between h-14 sm:h-16 items-center w-full max-w-full gap-2">
                        <div className="flex items-center space-x-3 sm:space-x-8 min-w-0">
                            <Link href={route('portal')} className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 min-w-0" aria-label="CoPED PULSE Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-7 sm:h-8 w-auto rounded-md" />
                                <span className="md:hidden text-base font-display font-extrabold tracking-tight text-[#111827] truncate">
                                    {mobileTitle}
                                </span>
                                <span className="hidden md:inline text-xl font-display font-black tracking-tight text-[#111827]">
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

                        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                            <ChatNotificationBell isStaff={false} />
                            <UserProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Global Flash Messages (hidden when printing) */}
            {flash?.success && (
                <div className={`${containerClass} pt-4 sm:pt-6 print:hidden`}>
                    <div className="bg-emerald-50 border-2 border-[#10B981] text-[#065F46] rounded-md px-4 sm:px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">✓</span>
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className={`${containerClass} pt-4 sm:pt-6 print:hidden`}>
                    <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#111827] rounded-md px-4 sm:px-5 py-3 text-sm font-bold flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#F59E0B] text-[#111827] rounded-full flex items-center justify-center text-xs font-black shrink-0">!</span>
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className={`${containerClass} py-4 sm:py-8 pb-24 md:pb-8 print:p-0 print:m-0 print:max-w-none`}>
                {children}
            </main>

            {/* Sticky Mobile Bottom Navigation Bar: Material 3 Pill-Indicator 4-Tab Bar */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-white border-t border-[#E5E7EB] pb-[env(safe-area-inset-bottom)] select-none print:hidden"
            >
                <div className="grid grid-cols-4 w-full max-w-full px-1">
                    <Link
                        href={route('portal')}
                        className="min-h-[60px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-transform duration-150 active:scale-95 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <span
                            className={`inline-flex items-center justify-center rounded-full px-4 py-1 mb-0.5 transition-colors duration-150 ${
                                isPortalActive
                                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                                    : 'text-[#64748B]'
                            }`}
                        >
                            <HomeIcon className="w-5 h-5" />
                        </span>
                        <span
                            className={`text-[11px] leading-none truncate w-full text-center ${
                                isPortalActive ? 'font-extrabold text-[#111827]' : 'font-semibold text-[#64748B]'
                            }`}
                        >
                            Home
                        </span>
                    </Link>

                    <Link
                        href={route('learner.catalog')}
                        className="min-h-[60px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-transform duration-150 active:scale-95 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <span
                            className={`inline-flex items-center justify-center rounded-full px-4 py-1 mb-0.5 transition-colors duration-150 ${
                                isCatalogActive
                                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                                    : 'text-[#64748B]'
                            }`}
                        >
                            <BookOpenIcon className="w-5 h-5" />
                        </span>
                        <span
                            className={`text-[11px] leading-none truncate w-full text-center ${
                                isCatalogActive ? 'font-extrabold text-[#111827]' : 'font-semibold text-[#64748B]'
                            }`}
                        >
                            Catalog
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileAlertsOpen(true)}
                        className="min-h-[60px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-transform duration-150 active:scale-95 relative min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Open Alerts Drawer"
                    >
                        <span
                            className={`relative inline-flex items-center justify-center rounded-full px-4 py-1 mb-0.5 transition-colors duration-150 ${
                                isAlertsActive
                                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                                    : 'text-[#64748B]'
                            }`}
                        >
                            <BellIcon className="w-5 h-5" />
                            {totalUnread > 0 && (
                                <span className="absolute top-0.5 right-2.5 bg-[#10B981] text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full inline-flex items-center justify-center leading-none">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </span>
                            )}
                        </span>
                        <span
                            className={`text-[11px] leading-none truncate w-full text-center ${
                                isAlertsActive ? 'font-extrabold text-[#111827]' : 'font-semibold text-[#64748B]'
                            }`}
                        >
                            Alerts
                        </span>
                    </button>

                    <Link
                        href={route('profile.edit')}
                        className="min-h-[60px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-transform duration-150 active:scale-95 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <span
                            className={`inline-flex items-center justify-center rounded-full px-4 py-1 mb-0.5 transition-colors duration-150 ${
                                isProfileActive
                                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                                    : 'text-[#64748B]'
                            }`}
                        >
                            <UserIcon className="w-5 h-5" />
                        </span>
                        <span
                            className={`text-[11px] leading-none truncate w-full text-center ${
                                isProfileActive ? 'font-extrabold text-[#111827]' : 'font-semibold text-[#64748B]'
                            }`}
                        >
                            Profile
                        </span>
                    </Link>
                </div>
            </nav>

            {/* Mobile Alerts Bottom Sheet: Native Drawer Styling */}
            {mobileAlertsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-alerts-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setMobileAlertsOpen(false);
                    }}
                >
                    <div className="bg-white border-t-2 sm:border-2 border-[#111827] rounded-t-2xl sm:rounded-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden text-left animate-sheet-up pb-[env(safe-area-inset-bottom)]">
                        {/* Drag Handle Pill (Mobile) */}
                        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-white shrink-0">
                            <div className="h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
                        </div>

                        {/* Header */}
                        <div className="px-4 py-3 bg-white border-b border-[#E5E7EB] text-[#111827] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span id="mobile-alerts-title" className="font-display font-extrabold text-base tracking-tight">
                                    Course Alerts
                                </span>
                                {totalUnread > 0 && (
                                    <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {totalUnread} New
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileAlertsOpen(false)}
                                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#111827] transition-colors"
                                aria-label="Close Alerts Dialog"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto divide-y divide-gray-100 flex-1 p-3 space-y-1">
                            {unreadChatSummary?.latest_items && unreadChatSummary.latest_items.length > 0 ? (
                                unreadChatSummary.latest_items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('learner.course.learn', item.course_id) + '?tab=chat'}
                                        onClick={() => setMobileAlertsOpen(false)}
                                        className="block p-3.5 hover:bg-[#F3F4F6] rounded-xl transition-colors text-left"
                                    >
                                        <div className="flex items-center justify-between text-xs mb-1 gap-2">
                                            <span className="font-extrabold text-[#111827] truncate">
                                                {item.course_title}
                                            </span>
                                            <span className="text-[11px] text-[#2563EB] font-bold shrink-0">
                                                Open →
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-gray-800 mb-0.5">
                                            {item.sender_name}
                                            {item.sender_role === 'staff' && (
                                                <span className="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
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
                                    <div className="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#64748B] flex items-center justify-center mx-auto mb-3">
                                        <BellIcon className="w-6 h-6" />
                                    </div>
                                    <p className="font-display font-bold text-[#111827] text-base mb-1">No unread alerts</p>
                                    <p className="text-xs text-gray-500 mb-5">You are all caught up with your instructors and class chats.</p>
                                    <div className="flex flex-col gap-2.5">
                                        <Link
                                            href={route('portal')}
                                            onClick={() => setMobileAlertsOpen(false)}
                                            className="w-full min-h-11 inline-flex items-center justify-center bg-[#111827] hover:bg-black text-white font-bold text-xs px-4 rounded-xl transition-colors"
                                        >
                                            View My Enrolled Courses
                                        </Link>
                                        <Link
                                            href={route('learner.catalog')}
                                            onClick={() => setMobileAlertsOpen(false)}
                                            className="w-full min-h-11 inline-flex items-center justify-center border border-[#CBD5E1] text-[#111827] hover:bg-[#F3F4F6] font-bold text-xs px-4 rounded-xl transition-colors"
                                        >
                                            Browse Course Catalog
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

