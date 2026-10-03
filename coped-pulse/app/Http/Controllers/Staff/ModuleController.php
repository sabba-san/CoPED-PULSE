<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|url|max:2048',
        ]);

        $maxOrder = $course->modules()->max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        $course->modules()->create($validated);

        return back()->with('success', 'Module added successfully.');
    }

    public function update(Request $request, Course $course, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|url|max:2048',
        ]);

        $module->update($validated);

        return back()->with('success', 'Module updated successfully.');
    }

    public function destroy(Course $course, Module $module)
    {
        $module->delete();

        // Reorder remaining modules
        $modules = $course->modules()->orderBy('order')->get();
        foreach ($modules as $index => $mod) {
            $mod->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Module deleted successfully.');
    }
}
