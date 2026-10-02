<script setup>
import { Head } from '@inertiajs/vue3';

const props = defineProps({
    enrollments: Object,
});
</script>

<template>
    <Head title="My Learning Portal" />

    <div class="min-h-screen bg-gray-50">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900">My Learning Portal</h1>
                <p class="mt-1 text-gray-500">Continue your learning journey</p>
            </div>

            <div v-if="enrollments.data.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No enrolled courses</h3>
                <p class="mt-1 text-sm text-gray-500">Browse the catalog to enroll in courses.</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div v-for="enrollment in enrollments.data" :key="enrollment.id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-lg font-medium text-gray-900 truncate">{{ enrollment.course.title }}</h3>
                                <p v-if="enrollment.course.description" class="mt-1 text-sm text-gray-500 line-clamp-2">{{ enrollment.course.description }}</p>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="flex items-center justify-between text-sm mb-1">
                                <span class="text-gray-500">Progress</span>
                                <span class="font-medium text-gray-900">{{ enrollment.progress }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    :style="{ width: enrollment.progress + '%' }"
                                />
                            </div>
                        </div>

                        <div class="mt-4">
                            <a
                                :href="route('learner.course.learn', enrollment.course)"
                                class="inline-flex items-center w-full justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                {{ enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning' }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>