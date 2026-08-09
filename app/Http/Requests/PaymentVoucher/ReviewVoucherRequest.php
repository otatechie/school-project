<?php

namespace App\Http\Requests\PaymentVoucher;

use Illuminate\Foundation\Http\FormRequest;

class ReviewVoucherRequest extends FormRequest
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
            'action' => ['required', 'in:approve,reject'],
            'comments' => ['nullable', 'string', 'max:1000'],
            'rejection_reason' => ['required_if:action,reject', 'string', 'max:1000'],
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
            'action.required' => 'An action is required.',
            'action.in' => 'Invalid action. Must be approve or reject.',
            'rejection_reason.required_if' => 'A rejection reason is required when rejecting a voucher.',
        ];
    }
}
