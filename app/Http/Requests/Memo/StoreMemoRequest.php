<?php

namespace App\Http\Requests\Memo;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'memo_date' => ['required', 'date'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'to_name' => ['required', 'string', 'max:255'],
            'to_designation' => ['nullable', 'string', 'max:255'],
            'from_name' => ['required', 'string', 'max:255'],
            'from_designation' => ['nullable', 'string', 'max:255'],
            'department_id' => ['required', 'exists:departments,id'],
            'voucher_id' => ['nullable', 'exists:payment_vouchers,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'memo_date.required' => 'The memo date is required.',
            'subject.required' => 'The memo subject is required.',
            'body.required' => 'The memo body is required.',
            'to_name.required' => 'The recipient name is required.',
            'from_name.required' => 'The sender name is required.',
            'department_id.required' => 'Please select a department.',
            'department_id.exists' => 'The selected department is invalid.',
        ];
    }
}
