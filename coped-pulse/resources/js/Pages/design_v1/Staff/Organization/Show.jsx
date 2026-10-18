import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/design_v1/StaffLayout';

export default function Show({ organization = null, courses = [], members = [] }) {
    const published = courses.filter((c) => c.status === 'published').length;

    return (
        <StaffLayout>
            <Head title={organization ? organization.name : 'Organization'} />

            <div className="max-w-4xl mx-auto space-y-8">
                {!organization ? (
                    <div className="text-center py-20 bg-[#F9FAFB] rounded-md border-2 border-[#E5E7EB] border-dashed">
                        <p className="text-xl font-bold text-[#111827] font-display">No partner organization</p>
                        <p className="mt-2 text-gray-600 text-sm">You are platform staff - partner profiles appear here for organization members.</p>
                        <Link
                            href={route('dashboard')}
                            className="mt-6 inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Main page
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
                            <span className="shrink-0 w-16 h-16 rounded-md bg-[#10B981] text-white font-black text-2xl flex items-center justify-center font-display">
                                {organization.name?.charAt(0)}
                            </span>
                            <div className="min-w-0 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight truncate font-display">
                                    {organization.name}
                                </h1>
                                <p className="mt-1 text-sm font-semibold text-gray-500">/{organization.slug}</p>
                            </div>
                            <div className="sm:ml-auto flex gap-6 shrink-0 text-center">
                                <div>
                                    <p className="text-2xl font-black text-[#111827]">{courses.length}</p>
                                    <p className="text-xs font-bold text-gray-500">Courses</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-[#10B981]">{published}</p>
                                    <p className="text-xs font-bold text-gray-500">Published</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-[#111827]">{members.length}</p>
                                    <p className="text-xs font-bold text-gray-500">Members</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6">
                            <h2 className="font-extrabold text-[#111827] text-lg font-display mb-4">Company Courses</h2>
                            {courses.length > 0 ? (
                                <ul className="divide-y-2 divide-[#E5E7EB]">
                                    {courses.map((c) => (
                                        <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                                            <Link href={route('staff.courses.edit', c.id)} className="text-sm font-bold text-[#111827] hover:text-[#10B981] truncate">
                                                {c.title}
                                            </Link>
                                            <span className="flex items-center gap-2 shrink-0">
                                                <span className="text-[11px] font-bold text-gray-500">
                                                    {c.modules_count} modules · {c.enrollments_count} learners
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                                    c.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No courses published by your company yet.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-md border-2 border-[#E5E7EB] p-6">
                            <h2 className="font-extrabold text-[#111827] text-lg font-display mb-4">Team Members</h2>
                            {members.length > 0 ? (
                                <ul className="divide-y-2 divide-[#E5E7EB]">
                                    {members.map((m) => (
                                        <li key={m.id} className="py-3 flex items-center gap-3">
                                            <span className="w-9 h-9 rounded-md bg-[#10B981] text-white font-bold text-sm flex items-center justify-center shrink-0">
                                                {m.name?.charAt(0)}
                                            </span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-bold text-[#111827] truncate">{m.name}</span>
                                                <span className="block text-xs text-gray-500 truncate">{m.email}</span>
                                            </span>
                                            <span className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F3F4F6] text-[#111827]">
                                                {m.role.toUpperCase()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No team members yet.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </StaffLayout>
    );
}
