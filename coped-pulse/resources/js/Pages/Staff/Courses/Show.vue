<script setup>
import { Head } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    course: Object,
});
</script>

<template>
    <Head :title="course.title" />

    <div class="min-h-screen bg-gray-50">
        <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <Link
                        :href="route('staff.courses.index')"
                        class="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Courses
                    </Link>
                    <h1 class="mt-2 text-3xl font-bold text-gray-900">{{ course.title }}</h1>
                </div>
                <div class="flex space-x-3">
                    <Link
                        :href="route('staff.courses.edit', course)"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Edit
                    </Link>
                </div>
            </div>

            <div class="bg-white shadow-sm rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
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
                </div>

                <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Description</h3>
                    <p v-if="course.description" class="text-gray-600 whitespace-pre-wrap">{{ course.description }}</p>
                    <p v-else class="text-gray-400 italic">No description provided.</p>
                </div>

                <div class="px-6 py-4 border-t border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Modules</h3>
                    <div v-if="course.modules && course.modules.length > 0">
                        <div v-for="module in course.modules" :key="module.id" class="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h4 class="font-medium text-gray-900">{{ module.title }}</h4>
                            <p v-if="module.description" class="text-sm text-gray-500 mt-1">{{ module.description }}</p>
                            <div class="mt-2">
                                <span class="text-xs text-gray-400">{{ module.lessons?.length || 0 }} lessons</span>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-gray-400 italic">No modules yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>