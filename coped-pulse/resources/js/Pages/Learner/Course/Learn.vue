<script setup>
import { ref, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    course: Object,
    enrollment: Object,
});

const currentModuleIndex = ref(0);
const currentLessonIndex = ref(0);

const currentModule = computed(() => props.course.modules[currentModuleIndex.value] || null);
const currentLesson = computed(() => currentModule.value?.lessons[currentLessonIndex.value] || null);

const nextLesson = () => {
    if (currentModule.value && currentLessonIndex.value < currentModule.value.lessons.length - 1) {
        currentLessonIndex.value++;
    } else if (currentModuleIndex.value < props.course.modules.length - 1) {
        currentModuleIndex.value++;
        currentLessonIndex.value = 0;
    }
};

const prevLesson = () => {
    if (currentLessonIndex.value > 0) {
        currentLessonIndex.value--;
    } else if (currentModuleIndex.value > 0) {
        currentModuleIndex.value--;
        currentLessonIndex.value = props.course.modules[currentModuleIndex.value].lessons.length - 1;
    }
};

const selectLesson = (moduleIndex, lessonIndex) => {
    currentModuleIndex.value = moduleIndex;
    currentLessonIndex.value = lessonIndex;
};
</script>

<template>
    <Head :title="course.title" />

    <div class="min-h-screen bg-gray-50 flex">
        <!-- Sidebar -->
        <aside class="w-72 bg-white border-r border-gray-200 hidden lg:block flex flex-col">
            <div class="p-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">{{ course.title }}</h2>
                <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        class="bg-indigo-600 h-full transition-all duration-300"
                        :style="{ width: enrollment.progress + '%' }"
                    />
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ enrollment.progress }}% complete</p>
            </div>

            <nav class="flex-1 overflow-y-auto p-4">
                <div v-for="(module, mIndex) in course.modules" :key="module.id" class="mb-4">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {{ module.title }}
                    </h3>
                    <ul class="space-y-1 ml-2">
                        <li v-for="(lesson, lIndex) in module.lessons" :key="lesson.id">
                            <button
                                @click="selectLesson(mIndex, lIndex)"
                                :class="[
                                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                                    mIndex === currentModuleIndex && lIndex === currentLessonIndex
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50',
                                ]"
                            >
                                <span class="flex items-center">
                                    <svg v-if="lesson.content_type === 'video'" class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                    <svg v-else-if="lesson.content_type === 'pdf'" class="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.414A2 2 0 0015.586 6L11.414 2A2 2 0 0010 2H4z" />
                                    </svg>
                                    <svg v-else class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                    {{ lesson.title }}
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0">
            <div class="p-4 border-b border-gray-200 lg:p-6">
                <Link
                    :href="route('portal')"
                    class="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
                >
                    ← Back to Portal
                </Link>
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">{{ course.title }}</h1>
                        <p class="text-gray-500 mt-1">{{ currentModule?.title }} / {{ currentLesson?.title }}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button
                            @click="prevLesson"
                            :disabled="currentModuleIndex === 0 && currentLessonIndex === 0"
                            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            @click="nextLesson"
                            :disabled="currentModuleIndex === course.modules.length - 1 && currentLessonIndex === course.modules[currentModuleIndex].lessons.length - 1"
                            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 lg:p-6">
                <div v-if="currentLesson" class="max-w-3xl mx-auto">
                    <div class="mb-6">
                        <span
                            :class="[
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                currentLesson.content_type === 'video' ? 'bg-purple-100 text-purple-800' : '',
                                currentLesson.content_type === 'pdf' ? 'bg-red-100 text-red-800' : '',
                                currentLesson.content_type === 'text' ? 'bg-gray-100 text-gray-800' : '',
                            ]"
                        >
                            {{ currentLesson.content_type }}
                        </span>
                        <span v-if="currentLesson.duration" class="ml-2 text-sm text-gray-500">{{ currentLesson.duration }} min</span>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ currentLesson.title }}</h2>

                        <div v-if="currentLesson.content_type === 'video'">
                            <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                                <iframe
                                    v-if="currentLesson.content_url"
                                    :src="currentLesson.content_url"
                                    class="absolute inset-0 w-full h-full"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                />
                                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Video URL not provided
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentLesson.content_type === 'pdf'">
                            <div class="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
                                <iframe
                                    v-if="currentLesson.content_url"
                                    :src="currentLesson.content_url"
                                    class="absolute inset-0 w-full h-full"
                                    frameborder="0"
                                />
                                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                                    PDF URL not provided
                                </div>
                            </div>
                        </div>

                        <div v-else>
                            <div class="prose max-w-none text-gray-700" v-html="currentLesson.content || '<p class=\'text-gray-400\'>No content available</p>'" />
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-12">
                    <p class="text-gray-500">No lesson selected</p>
                </div>
            </div>
        </main>
    </div>
</template>