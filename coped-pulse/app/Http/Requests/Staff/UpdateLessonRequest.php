<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
            'content_type' => ['sometimes', 'required', 'in:link,file'],
            'content_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'file' => ['sometimes', 'nullable', 'file', 'mimes:mp4,mov,webm,m4v,pdf,doc,docx,ppt,pptx', 'max:15360'],
            'transcript' => ['sometimes', 'nullable', 'string', 'max:50000'],
        ];
    }
}
