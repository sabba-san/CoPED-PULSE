<?php

namespace App\Console\Commands;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\User;
use Illuminate\Console\Command;
use PDO;

class ImportSqliteData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coped:import-sqlite-data {--path=database/database.sqlite : Path to the SQLite database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import courses, modules, assessments, and enrollments from an existing SQLite database into the active database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $path = base_path($this->option('path'));

        if (! file_exists($path)) {
            $this->error("SQLite database file not found at: {$path}");
            return Command::FAILURE;
        }

        $this->info("Connecting to SQLite database at {$path}...");
        $sqlite = new PDO("sqlite:{$path}");
        $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 1. Sync Users
        $this->info('Syncing Users...');
        $stmtUsers = $sqlite->query('SELECT * FROM users');
        $userMap = []; // sqlite_id => pgsql_id
        while ($row = $stmtUsers->fetch(PDO::FETCH_ASSOC)) {
            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => $row['password'],
                    'role' => $row['role'] ?? 'learner',
                    'organization_id' => $row['organization_id'] ?? null,
                ]
            );
            $userMap[$row['id']] = $user->id;
        }
        $this->info('Synced ' . count($userMap) . ' users.');

        // 2. Sync Courses
        $this->info('Syncing Courses...');
        $stmtCourses = $sqlite->query('SELECT * FROM courses');
        $courseMap = []; // sqlite_id => pgsql_id
        while ($row = $stmtCourses->fetch(PDO::FETCH_ASSOC)) {
            $instructorId = isset($userMap[$row['instructor_id']]) ? $userMap[$row['instructor_id']] : 1;
            $course = Course::firstOrCreate(
                ['title' => $row['title']],
                [
                    'description' => $row['description'] ?? '',
                    'instructor_id' => $instructorId,
                    'status' => $row['status'] ?? 'published',
                ]
            );
            $courseMap[$row['id']] = $course->id;
        }
        $this->info('Synced ' . count($courseMap) . ' courses.');

        // 3. Sync Modules
        $this->info('Syncing Modules...');
        $stmtModules = $sqlite->query('SELECT * FROM modules');
        $moduleCount = 0;
        while ($row = $stmtModules->fetch(PDO::FETCH_ASSOC)) {
            if (! isset($courseMap[$row['course_id']])) {
                continue;
            }
            $targetCourseId = $courseMap[$row['course_id']];
            Module::firstOrCreate(
                [
                    'course_id' => $targetCourseId,
                    'title' => $row['title'],
                ],
                [
                    'description' => $row['description'] ?? '',
                    'content_type' => $row['content_type'] ?? 'link',
                    'media_url' => $row['media_url'] ?? '',
                    'order' => $row['order'] ?? 1,
                ]
            );
            $moduleCount++;
        }
        $this->info("Synced {$moduleCount} modules.");

        // 4. Sync Assessments
        $this->info('Syncing Assessments...');
        $stmtAssessments = $sqlite->query('SELECT * FROM assessments');
        $assessmentCount = 0;
        while ($row = $stmtAssessments->fetch(PDO::FETCH_ASSOC)) {
            if (! isset($courseMap[$row['course_id']])) {
                continue;
            }
            $targetCourseId = $courseMap[$row['course_id']];
            Assessment::firstOrCreate(
                [
                    'course_id' => $targetCourseId,
                    'question' => $row['question'],
                ],
                [
                    'option_a' => $row['option_a'] ?? '',
                    'option_b' => $row['option_b'] ?? '',
                    'option_c' => $row['option_c'] ?? '',
                    'option_d' => $row['option_d'] ?? '',
                    'correct_option' => $row['correct_option'] ?? 'a',
                ]
            );
            $assessmentCount++;
        }
        $this->info("Synced {$assessmentCount} assessments.");

        // 5. Sync Enrollments
        $this->info('Syncing Enrollments...');
        $stmtEnrollments = $sqlite->query('SELECT * FROM enrollments');
        $enrollmentCount = 0;
        while ($row = $stmtEnrollments->fetch(PDO::FETCH_ASSOC)) {
            if (! isset($userMap[$row['user_id']]) || ! isset($courseMap[$row['course_id']])) {
                continue;
            }
            Enrollment::updateOrCreate(
                [
                    'user_id' => $userMap[$row['user_id']],
                    'course_id' => $courseMap[$row['course_id']],
                ],
                [
                    'progress' => $row['progress'] ?? 0,
                    'enrolled_at' => $row['enrolled_at'] ?? now(),
                    'completed_at' => $row['completed_at'] ?? null,
                ]
            );
            $enrollmentCount++;
        }
        $this->info("Synced {$enrollmentCount} enrollments.");

        $this->info('SQLite database migration completed successfully.');
        return Command::SUCCESS;
    }
}
