<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'content_type' => ['sometimes', 'required', 'in:link,file,embed'],
            'media_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'file' => ['sometimes', 'nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:15360'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:1440'],
            'transcript' => ['sometimes', 'nullable', 'string', 'max:50000'],
        ];
    }
}
