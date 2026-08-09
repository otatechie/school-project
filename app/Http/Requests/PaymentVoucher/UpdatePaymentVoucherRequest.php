<?php

namespace App\Http\Requests\PaymentVoucher;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentVoucherRequest extends FormRequest
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
            'voucher_date' => ['required', 'date'],
            'payee_name' => ['required', 'string', 'max:255'],
            'payee_account_number' => ['nullable', 'string', 'max:255'],
            'payee_bank' => ['nullable', 'string', 'max:255'],
            'payee_phone' => ['nullable', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cheque,bank_transfer,cash'],
            'cheque_number' => ['required_if:payment_method,cheque', 'nullable', 'string', 'max:255'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'budget_line' => ['required', 'string', 'max:255'],
            'budget_code' => ['nullable', 'string', 'max:255'],
            'department_id' => ['required', 'exists:departments,id'],
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
            'voucher_date.required' => 'The voucher date is required.',
            'payee_name.required' => 'The payee name is required.',
            'description.required' => 'A description is required.',
            'amount.required' => 'The payment amount is required.',
            'amount.min' => 'The payment amount must be greater than zero.',
            'payment_method.in' => 'Please select a valid payment method.',
            'cheque_number.required_if' => 'A cheque number is required for cheque payments.',
            'budget_line.required' => 'The budget line is required.',
            'department_id.required' => 'Please select a department.',
            'department_id.exists' => 'The selected department is invalid.',
        ];
    }
}
