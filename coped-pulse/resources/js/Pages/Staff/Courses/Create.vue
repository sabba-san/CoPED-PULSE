<script setup>
import { Head } from '@inertiajs/vue3';
import { Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    title: '',
    description: '',
    status: 'draft',
});

const submit = () => {
    form.post(route('staff.courses.store'));
};
</script>

<template>
    <Head title="Create Course" />

    <div class="min-h-screen bg-gray-50">
        <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="mb-6">
                <Link
                    :href="route('staff.courses.index')"
                    class="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back to Courses
                </Link>
                <h1 class="mt-2 text-3xl font-bold text-gray-900">Create Course</h1>
            </div>

            <form @submit.prevent="submit" class="bg-white shadow-sm rounded-lg p-6 space-y-6">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        v-model="form.title"
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span v-if="form.errors.title" class="text-red-500 text-sm">{{ form.errors.title }}</span>
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        v-model="form.description"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span v-if="form.errors.description" class="text-red-500 text-sm">{{ form.errors.description }}</span>
                </div>

                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        id="status"
                        name="status"
                        v-model="form.status"
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                    <span v-if="form.errors.status" class="text-red-500 text-sm">{{ form.errors.status }}</span>
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <Link
                        :href="route('staff.courses.index')"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <span v-if="form.processing">Creating...</span>
                        <span v-else>Create Course</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>