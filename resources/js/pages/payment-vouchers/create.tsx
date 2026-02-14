import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Vouchers',
        href: paymentVouchers.index().url,
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function Create() {
    const [formData, setFormData] = useState({
        voucher_date: new Date().toISOString().split('T')[0],
        payee_name: '',
        payee_account_number: '',
        payee_bank: '',
        payee_phone: '',
        description: '',
        amount: '',
        payment_method: 'cheque',
        cheque_number: '',
        payment_reference: '',
        budget_line: '',
        budget_code: '',
        department_id: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const errors: Record<string, string> = {};
    const successMessage = '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 800);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Payment Voucher" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={paymentVouchers.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Payment Vouchers</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Create Payment Voucher
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Create a new payment voucher for processing
                        </p>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Voucher Information</CardTitle>
                        <CardDescription>
                            Enter the details for this payment voucher. All
                            required fields are marked with an asterisk (*).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {successMessage && (
                            <div
                                className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                                role="status"
                            >
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Required Fields Section */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="voucher_date">
                                        Voucher Date{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="voucher_date"
                                        type="date"
                                        value={formData.voucher_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                voucher_date: e.target.value,
                                            })
                                        }
                                        required
                                        autoFocus
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Select the date for this payment voucher
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Department{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                department_id: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Finance</SelectItem>
                                            <SelectItem value="2">
                                                Procurement
                                            </SelectItem>
                                            <SelectItem value="3">Admin</SelectItem>
                                            <SelectItem value="4">IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            {/* Payee Information Section */}
                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Payee Information
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Details of the person or organization receiving
                                    payment
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payee_name">
                                        Payee Name{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="payee_name"
                                        type="text"
                                        value={formData.payee_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payee_name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter payee name"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.payee_name} />
                                    <p className="text-sm text-muted-foreground">
                                        Full name of the person or organization
                                        receiving payment
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payee_phone">
                                        Payee Phone
                                    </Label>
                                    <Input
                                        id="payee_phone"
                                        type="tel"
                                        value={formData.payee_phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payee_phone: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., +233 XX XXX XXXX"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payee_bank">Bank Name</Label>
                                    <Input
                                        id="payee_bank"
                                        type="text"
                                        value={formData.payee_bank}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payee_bank: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., GCB Bank"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payee_account_number">
                                        Account Number
                                    </Label>
                                    <Input
                                        id="payee_account_number"
                                        type="text"
                                        value={formData.payee_account_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payee_account_number: e.target.value,
                                            })
                                        }
                                        placeholder="Enter account number"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Payment Details Section */}
                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Payment Details
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Amount and payment method information
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount (GHS){' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.amount} />
                                    <p className="text-sm text-muted-foreground">
                                        Enter the payment amount in Ghana Cedis
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">
                                        Payment Method{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                payment_method: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cheque">
                                                Cheque
                                            </SelectItem>
                                            <SelectItem value="bank_transfer">
                                                Bank Transfer
                                            </SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.payment_method === 'cheque' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="cheque_number">
                                            Cheque Number
                                        </Label>
                                        <Input
                                            id="cheque_number"
                                            type="text"
                                            value={formData.cheque_number}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    cheque_number: e.target.value,
                                                })
                                            }
                                            placeholder="Enter cheque number"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="payment_reference">
                                        Payment Reference
                                    </Label>
                                    <Input
                                        id="payment_reference"
                                        type="text"
                                        value={formData.payment_reference}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                payment_reference: e.target.value,
                                            })
                                        }
                                        placeholder="Optional reference number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Describe the purpose of this payment..."
                                    rows={4}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Provide a clear description of what this
                                    payment is for
                                </p>
                            </div>

                            <Separator />

                            {/* Budget Information Section */}
                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Budget Information
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Budget line and code for tracking
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="budget_line">
                                        Budget Line{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="budget_line"
                                        type="text"
                                        value={formData.budget_line}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                budget_line: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Office Supplies"
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Budget line item for this payment
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget_code">
                                        Budget Code
                                    </Label>
                                    <Input
                                        id="budget_code"
                                        type="text"
                                        value={formData.budget_code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                budget_code: e.target.value,
                                            })
                                        }
                                        placeholder="Optional budget code"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isSubmitting}
                                >
                                    <Link href={paymentVouchers.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Payment Voucher'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
