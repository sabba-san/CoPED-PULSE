<?php

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\User;
use App\Models\Enrollment;

echo "========================================================================================\n";
echo "DATABASE MEDIA VERIFICATION AUDIT\n";
echo "========================================================================================\n\n";

$modulesCount = Module::count();
echo "TOTAL MODULES COUNT: {$modulesCount} (Expected: 20)\n";
if ($modulesCount !== 20) {
    echo "ERROR: Module count mismatch!\n";
} else {
    echo "SUCCESS: Module count matches exactly 20 (zero duplicate modules).\n";
}

$abbas = User::where('email', 'abbasabudzarr@gmail.com')->first();
$aiCourse = Course::where('title', 'Intro to Ai')->first();
$enr = Enrollment::where('user_id', $abbas->id)->where('course_id', $aiCourse->id)->first();
echo "\nABBAS ENROLLMENT ON INTRO TO AI:\n";
echo "  Progress: {$enr->progress}%\n";
echo "  Completed At: " . ($enr->completed_at ? $enr->completed_at->toDateTimeString() : 'NULL') . "\n";
echo "  Status: " . ($enr->progress >= 100 ? "SUCCESS (100% RETAINED)" : "WARNING") . "\n\n";

echo "----------------------------------------------------------------------------------------\n";
printf("%-4s | %-32s | %-38s | %-6s | %s\n", "CID", "COURSE TITLE", "MODULE TITLE", "TYPE", "MEDIA / CONTENT URL");
echo "----------------------------------------------------------------------------------------\n";

$courses = Course::with(['modules.lessons'])->orderBy('id')->get();
$aiVideoIds = ['ad79nYk2keg', 'PDMcpthR88U', 'aircAruvnKk'];
$violations = 0;

foreach ($courses as $c) {
    $isAiCourse = str_contains(strtolower($c->title), 'ai');
    foreach ($c->modules as $m) {
        printf("%-4d | %-32.32s | %-38.38s | %-6s | %s\n", $c->id, $c->title, $m->title, $m->content_type, $m->media_url);
        
        if (!$isAiCourse) {
            foreach ($aiVideoIds as $aiId) {
                if (str_contains($m->media_url ?? '', $aiId)) {
                    echo "  >>> VIOLATION: Non-AI Course contains AI Video ID {$aiId}!\n";
                    $violations++;
                }
            }
        }
        
        foreach ($m->lessons as $l) {
            printf("     | %-32.32s |   -> Lesson: %-30.30s | %-6s | %s\n", "", $l->title, $l->content_type, $l->content_url);
            if (!$isAiCourse) {
                foreach ($aiVideoIds as $aiId) {
                    if (str_contains($l->content_url ?? '', $aiId)) {
                        echo "  >>> VIOLATION: Non-AI Lesson contains AI Video ID {$aiId}!\n";
                        $violations++;
                    }
                }
            }
        }
    }
    echo "----------------------------------------------------------------------------------------\n";
}

echo "\nAUDIT SUMMARY:\n";
echo "Total Violations Found: {$violations}\n";
if ($violations === 0) {
    echo "PERFECT: Zero AI video URLs exist on non-AI courses!\n";
} else {
    echo "FAILURE: {$violations} AI video URLs found on non-AI courses!\n";
}
