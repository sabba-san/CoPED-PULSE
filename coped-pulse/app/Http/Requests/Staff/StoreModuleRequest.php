<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content_type' => ['required', 'in:link,file'],
            'media_url' => ['nullable', 'string', 'max:2048'],
            'file' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:15360'],
            'duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'transcript' => ['nullable', 'string', 'max:50000'],
        ];
    }
}
