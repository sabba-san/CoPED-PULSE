import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@/Components/flat/icons';

export default function CourseBackLink({
    href = route('portal'),
    label = 'Back to My Courses',
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-3.5 text-sm font-bold text-[#111827] transition-colors hover:border-[#111827] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
        >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F3F4F6] transition-colors group-hover:bg-white">
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
            </span>
            <span>{label}</span>
        </Link>
    );
}
