import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import LearnerLayout from '@/Layouts/design_v1/LearnerLayout';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Edit({ user, stats = {} }) {
    // Select layout based on role
    const isStaffOrCoord = user?.role === 'staff' || user?.role === 'coordinator';
    const Layout = isStaffOrCoord ? StaffLayout : LearnerLayout;

    // Avatar initials
    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()
        : 'U';

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Role configuration
    const roleConfig = {
        coordinator: {
            label: 'Subject Coordinator',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        },
        staff: {
            label: 'Faculty Instructor',
            badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        },
        learner: {
            label: 'Enrolled Learner',
            badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        },
    };

    const currentRole = roleConfig[user?.role] || roleConfig.learner;

    // Profile Info Form
    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        processing: profileProcessing,
        errors: profileErrors,
        recentlySuccessful: profileSuccess,
    } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'), {
            preserveScroll: true,
        });
    };

    // Password Update Form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        putPassword(route('profile.password'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    return (
        <Layout>
            <Head title="Account Settings & Profile" />

            <div className="space-y-6">
                {/* Back Link */}
                <div>
                    <Link
                        href={isStaffOrCoord ? route('dashboard') : route('portal')}
                        className="inline-flex items-center text-xs font-bold text-[#10B981] hover:text-emerald-700 uppercase tracking-wider transition-colors"
                    >
                        {isStaffOrCoord ? '← Back to Studio Dashboard' : '← Back to My Portal'}
                    </Link>
                </div>

                {/* Page Title & Subtitle */}
                <div className="border-b-2 border-[#E5E7EB] pb-5">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-display">
                        Account Settings &amp; Profile
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Manage your personal credentials, contact details, and account security.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Card 1: About Me & Personal Info */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-5 sm:p-6 space-y-6">
                            {/* Card Header with Identity Block */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#E5E7EB]">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-14 h-14 rounded-md bg-[#111827] text-white flex items-center justify-center font-display font-black text-xl shrink-0 select-none">
                                        {initials}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                                {user?.name}
                                            </h2>
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${currentRole.badgeBg}`}
                                            >
                                                {currentRole.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Member since {formatDate(user?.created_at)} · User ID #{user?.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Flash Success Notification for Profile */}
                            {profileSuccess && (
                                <div className="p-3 bg-emerald-50 border-2 border-[#10B981] rounded text-xs font-bold text-[#065F46] flex items-center gap-2">
                                    <span className="w-4 h-4 bg-[#10B981] text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    <span>Profile details updated successfully.</span>
                                </div>
                            )}

                            {/* Profile Info Form */}
                            <form onSubmit={submitProfile} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold text-[#111827] mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="e.g. John Doe"
                                    />
                                    {profileErrors.name && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{profileErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-[#111827] mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={profileData.email}
                                        onChange={(e) => setProfileData('email', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="user@example.com"
                                    />
                                    {profileErrors.email && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{profileErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="phone" className="block text-xs font-bold text-[#111827]">
                                            Phone Number (Optional)
                                        </label>
                                        {user?.role !== 'learner' && (
                                            <span className="text-[10px] text-gray-500 font-semibold">
                                                WhatsApp Sync Enabled
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData('phone', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="+60 12-345 6789"
                                    />
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        {user?.role === 'learner'
                                            ? 'Optional contact phone number for official CoPED program verification and certificate records.'
                                            : 'Used for official course cohort announcements and direct faculty WhatsApp sync.'}
                                    </p>
                                    {profileErrors.phone && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{profileErrors.phone}</p>
                                    )}
                                </div>

                                <div className="pt-2 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileProcessing}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-md min-h-[44px] transition-transform active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <span>{profileProcessing ? 'Saving...' : 'Save Changes'}</span>
                                        <span>→</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Card 2: Security & Password Update */}
                        <div id="password" className="bg-white border-2 border-[#E5E7EB] rounded-lg p-5 sm:p-6 space-y-6 scroll-mt-20">
                            <div className="pb-4 border-b-2 border-[#E5E7EB]">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">🔒</span>
                                    <h2 className="font-display font-extrabold text-xl text-[#111827]">
                                        Change Password
                                    </h2>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>
                            </div>

                            {/* Flash Success Notification for Password */}
                            {passwordSuccess && (
                                <div className="p-3 bg-emerald-50 border-2 border-[#10B981] rounded text-xs font-bold text-[#065F46] flex items-center gap-2">
                                    <span className="w-4 h-4 bg-[#10B981] text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    <span>Password updated successfully.</span>
                                </div>
                            )}

                            {/* Password Form */}
                            <form onSubmit={submitPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="current_password" className="block text-xs font-bold text-[#111827] mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        required
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="••••••••"
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{passwordErrors.current_password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password_new" className="block text-xs font-bold text-[#111827] mb-1">
                                        New Password
                                    </label>
                                    <input
                                        id="password_new"
                                        type="password"
                                        required
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="Minimum 8 characters"
                                    />
                                    {passwordErrors.password && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{passwordErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-xs font-bold text-[#111827] mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                        className="w-full text-xs font-medium border-2 border-[#E5E7EB] rounded-md px-3.5 py-2.5 min-h-[44px] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#111827] bg-[#F9FAFB] focus:bg-white transition-colors"
                                        placeholder="Re-type new password"
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="mt-1 text-xs font-bold text-red-600">{passwordErrors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="pt-2 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordProcessing}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-md min-h-[44px] transition-transform active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <span>{passwordProcessing ? 'Updating...' : 'Update Password'}</span>
                                        <span>✓</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Academic & Security Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Card 3: Learning / Teaching Summary */}
                        <div className="bg-white border-2 border-[#E5E7EB] rounded-lg p-5 sm:p-6 space-y-4">
                            <h3 className="font-display font-extrabold text-base text-[#111827] uppercase tracking-wider pb-3 border-b-2 border-[#E5E7EB]">
                                {isStaffOrCoord ? 'Teaching & Studio Overview' : 'My Learning Summary'}
                            </h3>

                            {!isStaffOrCoord ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">📚</span>
                                            <span className="text-xs font-bold text-gray-700">Enrolled Courses</span>
                                        </div>
                                        <span className="font-display font-black text-base text-[#111827]">
                                            {stats?.courses_enrolled ?? 0}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">✓</span>
                                            <span className="text-xs font-bold text-gray-700">Completed Courses</span>
                                        </div>
                                        <span className="font-display font-black text-base text-emerald-600">
                                            {stats?.courses_completed ?? 0}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">🎓</span>
                                            <span className="text-xs font-bold text-emerald-900">Verified Certificates</span>
                                        </div>
                                        <span className="font-display font-black text-base text-emerald-800">
                                            {stats?.certificates_earned ?? 0}
                                        </span>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <Link
                                            href={route('portal')}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-black text-white font-bold text-xs py-2.5 px-3 rounded-md min-h-[44px] transition-colors"
                                        >
                                            <span>Go to My Learning Portal</span>
                                            <span>→</span>
                                        </Link>
                                        <Link
                                            href={route('learner.catalog')}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F4F6] text-[#111827] border-2 border-[#E5E7EB] hover:border-[#111827] font-bold text-xs py-2.5 px-3 rounded-md min-h-[44px] transition-colors"
                                        >
                                            <span>Explore Course Catalog</span>
                                            <span>↗</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">📁</span>
                                            <span className="text-xs font-bold text-gray-700">Curricula Managed</span>
                                        </div>
                                        <span className="font-display font-black text-base text-[#111827]">
                                            {stats?.courses_managed ?? 0}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">👥</span>
                                            <span className="text-xs font-bold text-gray-700">Enrolled Students</span>
                                        </div>
                                        <span className="font-display font-black text-base text-blue-600">
                                            {stats?.total_students ?? 0}
                                        </span>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <Link
                                            href={route('staff.courses.index')}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-black text-white font-bold text-xs py-2.5 px-3 rounded-md min-h-[44px] transition-colors"
                                        >
                                            <span>Manage All Courses</span>
                                            <span>→</span>
                                        </Link>
                                        <Link
                                            href={route('dashboard')}
                                            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F4F6] text-[#111827] border-2 border-[#E5E7EB] hover:border-[#111827] font-bold text-xs py-2.5 px-3 rounded-md min-h-[44px] transition-colors"
                                        >
                                            <span>View Studio Dashboard</span>
                                            <span>↗</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card 4: Security Advisory Notice */}
                        <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] p-4 rounded-lg space-y-2 text-xs text-[#111827]">
                            <div className="flex items-center gap-2 font-black text-[#92400E]">
                                <span className="text-base">ⓘ</span>
                                <span>Security Advisory</span>
                            </div>
                            <p className="leading-relaxed">
                                CoPED PULSE instructors and system coordinators will never request your password via email or WhatsApp. Always keep your credentials safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
