<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch Courses
        $aiCourse = Course::where('title', 'Intro to Ai')->first();
        $maritimeCourse = Course::where('title', 'like', '%Maritim%')->first();
        $cpFundamentals = Course::where('title', 'Child Protection Fundamentals')->first();
        $pssCourse = Course::where('title', 'Psychosocial Support for Children')->first();
        $cmCourse = Course::where('title', 'Case Management in Child Protection')->first();

        // 1. learn@gmail.com (Primary Learner A)
        $learnUser = User::where('email', 'learn@gmail.com')->first();
        if ($learnUser) {
            if ($aiCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $learnUser->id, 'course_id' => $aiCourse->id],
                    [
                        'progress' => 33.33,
                        'enrolled_at' => Carbon::parse('2026-10-10 09:00:00'),
                        'completed_at' => null,
                    ]
                );
                // Mark chapter 1 as completed for granular progress demonstration
                $firstModule = $aiCourse->modules()->where('order', 1)->first();
                if ($firstModule) {
                    $learnUser->completedModules()->syncWithoutDetaching([$firstModule->id]);
                }
            }

            if ($maritimeCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $learnUser->id, 'course_id' => $maritimeCourse->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-10-12 10:00:00'),
                        'completed_at' => null,
                    ]
                );
            }

            if ($cpFundamentals) {
                Enrollment::updateOrCreate(
                    ['user_id' => $learnUser->id, 'course_id' => $cpFundamentals->id],
                    [
                        'progress' => 66.67,
                        'enrolled_at' => Carbon::parse('2026-10-05 08:30:00'),
                        'completed_at' => null,
                    ]
                );
            }
        }

        // 2. abbasabudzarr@gmail.com
        $abbasUser = User::where('email', 'abbasabudzarr@gmail.com')->first();
        if ($abbasUser) {
            if ($aiCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $abbasUser->id, 'course_id' => $aiCourse->id],
                    [
                        'progress' => 100.00,
                        'enrolled_at' => Carbon::parse('2026-10-08 14:00:00'),
                        'completed_at' => Carbon::parse('2026-10-09 13:27:29'),
                    ]
                );
                // Sync all modules as completed
                $aiModuleIds = $aiCourse->modules()->pluck('id')->toArray();
                if (!empty($aiModuleIds)) {
                    $abbasUser->completedModules()->syncWithoutDetaching($aiModuleIds);
                }
            }

            if ($maritimeCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $abbasUser->id, 'course_id' => $maritimeCourse->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-10-13 11:15:00'),
                        'completed_at' => null,
                    ]
                );
            }

            if ($cpFundamentals) {
                Enrollment::updateOrCreate(
                    ['user_id' => $abbasUser->id, 'course_id' => $cpFundamentals->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-10-04 09:00:00'),
                        'completed_at' => null,
                    ]
                );
            }
        }

        // 3. ameer@gmail.com
        $ameerUser = User::where('email', 'ameer@gmail.com')->first();
        if ($ameerUser) {
            if ($aiCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $ameerUser->id, 'course_id' => $aiCourse->id],
                    [
                        'progress' => 100.00,
                        'enrolled_at' => Carbon::parse('2026-10-10 10:00:00'),
                        'completed_at' => Carbon::parse('2026-10-11 12:56:58'),
                    ]
                );
            }
            if ($maritimeCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $ameerUser->id, 'course_id' => $maritimeCourse->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-10-14 16:20:00'),
                        'completed_at' => null,
                    ]
                );
            }
        }

        // 4. arman@gmail.com
        $armanUser = User::where('email', 'arman@gmail.com')->first();
        if ($armanUser && $aiCourse) {
            Enrollment::updateOrCreate(
                ['user_id' => $armanUser->id, 'course_id' => $aiCourse->id],
                [
                    'progress' => 0.00,
                    'enrolled_at' => Carbon::parse('2026-10-14 12:00:00'),
                    'completed_at' => null,
                ]
            );
        }

        // 5. learner@coped.org (Standard Test Learner)
        $defaultLearner = User::where('email', 'learner@coped.org')->first();
        if ($defaultLearner) {
            if ($cpFundamentals) {
                Enrollment::updateOrCreate(
                    ['user_id' => $defaultLearner->id, 'course_id' => $cpFundamentals->id],
                    [
                        'progress' => 20.51,
                        'enrolled_at' => Carbon::parse('2026-09-20 10:00:00'),
                        'completed_at' => null,
                    ]
                );
            }
            if ($pssCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $defaultLearner->id, 'course_id' => $pssCourse->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-09-22 14:00:00'),
                        'completed_at' => null,
                    ]
                );
            }
            if ($cmCourse) {
                Enrollment::updateOrCreate(
                    ['user_id' => $defaultLearner->id, 'course_id' => $cmCourse->id],
                    [
                        'progress' => 0.00,
                        'enrolled_at' => Carbon::parse('2026-09-23 11:00:00'),
                        'completed_at' => null,
                    ]
                );
            }
        }
    }
}