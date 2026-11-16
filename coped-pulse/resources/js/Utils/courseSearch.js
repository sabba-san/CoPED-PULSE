/**
 * Tokenized multi-field course search matching title, description, cert title,
 * academic year, category, instructor, modules, and UUM CoPED branding.
 */
export function matchesCourseSearch(course, rawQuery) {
    const trimmed = (rawQuery || '').trim().toLowerCase();
    if (!trimmed) return true;

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const haystack = [
        course?.title,
        course?.description,
        course?.cert_title,
        course?.academic_year,
        course?.category_logo,
        course?.instructor?.name,
        'uum coped universiti utara malaysia',
        ...(Array.isArray(course?.modules)
            ? course.modules.flatMap((m) => [m?.title, m?.description])
            : []),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
}
