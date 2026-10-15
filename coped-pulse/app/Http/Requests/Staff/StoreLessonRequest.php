<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'content_type' => ['required', 'in:link,file'],
            'content_url' => ['nullable', 'string', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:mp4,mov,webm,m4v,pdf,doc,docx,ppt,pptx', 'max:15360'],
            'transcript' => ['nullable', 'string', 'max:50000'],
        ];
    }
}
