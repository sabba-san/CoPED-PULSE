<script setup>
import { Head } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    courses: Object,
});
</script>

<template>
    <Head title="Courses" />

    <div class="min-h-screen bg-gray-50">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Courses</h1>
                    <p class="mt-1 text-gray-500">Manage your courses</p>
                </div>
                <Link
                    :href="route('staff.courses.create')"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Course
                </Link>
            </div>

            <div v-if="courses.data.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2M5 7h14v6H5V7z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
                <Link
                    :href="route('staff.courses.create')"
                    class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Create Course
                </Link>
            </div>

            <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div v-for="course in courses.data" :key="course.id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-lg font-medium text-gray-900 truncate">{{ course.title }}</h3>
                                <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ course.description }}</p>
                            </div>
                            <span
                                :class="[
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    course.status === 'published' ? 'bg-green-100 text-green-800' : '',
                                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : '',
                                    course.status === 'archived' ? 'bg-gray-100 text-gray-800' : '',
                                ]"
                            >
                                {{ course.status }}
                            </span>
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <Link
                                :href="route('staff.courses.edit', course)"
                                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Edit
                            </Link>
                            <Link
                                :href="route('staff.courses.show', course)"
                                class="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="courses.links.length > 3" class="mt-6">
                <nav class="flex items-center justify-center">
                    <span v-for="link in courses.links" :key="link.url" class="px-3 py-1">
                        <a
                            v-if="link.url"
                            :href="link.url"
                            class="px-3 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            {{ link.label }}
                        </a>
                        <span v-else class="px-3 py-1 rounded-md text-sm font-medium text-indigo-600">
                            {{ link.label }}
                        </span>
                    </span>
                </nav>
            </div>
        </div>
    </div>
</template>