<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'module_id' => ['nullable', Rule::exists('modules', 'id')->where('course_id', $course->id)],
            'question' => ['required', 'string', 'max:2000'],
            'option_a' => ['required', 'string', 'max:500'],
            'option_b' => ['required', 'string', 'max:500'],
            'option_c' => ['required', 'string', 'max:500'],
            'option_d' => ['required', 'string', 'max:500'],
            'correct_option' => ['required', 'in:a,b,c,d'],
        ];
    }
}
