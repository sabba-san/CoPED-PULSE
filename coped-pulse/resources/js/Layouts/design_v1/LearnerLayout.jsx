import { Link, usePage } from '@inertiajs/react';
import logo from '@/images/logo.png';
import ChatNotificationBell from '@/Components/ChatNotificationBell';
import UserProfileDropdown from '@/Components/UserProfileDropdown';

export default function LearnerLayout({ children }) {
    const { url, props } = usePage();
    const flash = props?.flash;
    const { unreadChatSummary } = props;
    const totalUnread = unreadChatSummary?.total_unread || 0;

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
                        <div className="flex items-center space-x-4 sm:space-x-8">
                            <Link href={route('portal')} className="flex items-center space-x-2 sm:space-x-3" aria-label="CoPED PULSE Home">
                                <img src={logo} alt="CoPED PULSE Logo" className="h-7 sm:h-8 w-auto" />
                                <span className="text-lg sm:text-xl font-display font-extrabold text-[#111827] tracking-tight hidden sm:block">
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

            {/* Sticky Mobile Bottom Navigation Bar */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full max-w-full bg-white border-t-2 border-[#111827] print:hidden"
            >
                <div className="grid grid-cols-3 w-full max-w-full divide-x-2 divide-gray-200">
                    <Link
                        href={route('portal')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url.startsWith('/portal')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">🏠</span>
                        <span className="text-[11px] uppercase tracking-wide leading-none truncate w-full text-center">My Portal</span>
                    </Link>

                    <Link
                        href={route('learner.catalog')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors min-w-0 ${
                            url.startsWith('/learner/catalog')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <span className="text-base leading-none mb-1 shrink-0">📚</span>
                        <span className="text-[11px] uppercase tracking-wide leading-none truncate w-full text-center">Catalog</span>
                    </Link>

                    <Link
                        href={unreadChatSummary?.latest_items?.[0]?.course_id
                            ? route('learner.course.learn', unreadChatSummary.latest_items[0].course_id) + '?tab=chat'
                            : route('portal')}
                        className={`min-h-[56px] w-full flex flex-col items-center justify-center py-1.5 px-1 text-center transition-colors relative min-w-0 ${
                            url.includes('tab=chat')
                                ? 'bg-[#111827] text-white font-black'
                                : 'text-gray-700 hover:bg-[#F3F4F6] font-bold'
                        }`}
                    >
                        <div className="relative inline-block mb-1 shrink-0">
                            <span className="text-base leading-none">💬</span>
                            {totalUnread > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-[#10B981] text-white text-[9px] font-black px-1 rounded-full leading-none">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] uppercase tracking-wide leading-none truncate w-full text-center">
                            Alerts {totalUnread > 0 ? `(${totalUnread})` : ''}
                        </span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}

