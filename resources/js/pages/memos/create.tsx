import {Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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
import FlashMessages from '@/components/flash-messages';
import AppLayout from '@/layouts/app-layout';
import memos from '@/routes/memos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Memos', href: memos.index().url },
    { title: 'Create', href: '#' },
];

type Department = { id: string; name: string; code: string };
type Voucher = { id: string; voucher_number: string; payee_name: string };

export default function Create({
    aiEnabled,
    departments,
    vouchers,
}: {
    departments: Department[];
    vouchers: Voucher[];
    aiEnabled: boolean;
}) {
    const { data, setData, post, processing, errors } = useForm({
        memo_date: new Date().toISOString().split('T')[0],
        subject: '',
        body: '',
        to_name: '',
        to_designation: '',
        from_name: '',
        from_designation: '',
        department_id: '',
        voucher_id: '',
    });

    const [drafting, setDrafting] = useState(false);
    const [draftNotice, setDraftNotice] = useState('');

    const draftWithAi = async () => {
        if (!data.voucher_id) {
            setDraftNotice(
                'Select the paid voucher this memo relates to first.',
            );

            return;
        }

        setDrafting(true);
        setDraftNotice('');

        try {
            const response = await fetch(
                memos.aiDraft({ voucher: data.voucher_id }).url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );
            const result = await response.json();

            if (result.available) {
                setData('subject', result.draft.subject);
                setData('body', result.draft.body);
                setDraftNotice(
                    'Draft inserted. Review and edit before saving.',
                );
            } else {
                setDraftNotice(result.message);
            }
        } catch {
            setDraftNotice(
                'Could not reach the drafting service. Write the memo manually.',
            );
        } finally {
            setDrafting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(memos.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Memo" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={memos.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Memos</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Create Memo
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Create a new internal memorandum
                        </p>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Memo Information</CardTitle>
                        <CardDescription>
                            Enter the details for this memo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="memo_date">
                                        Memo date{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="memo_date"
                                        type="date"
                                        value={data.memo_date}
                                        onChange={(e) =>
                                            setData('memo_date', e.target.value)
                                        }
                                        required
                                        autoFocus
                                        disabled={processing}
                                    />
                                    <InputError message={errors.memo_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Department{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) =>
                                            setData('department_id', value)
                                        }
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem
                                                    key={d.id}
                                                    value={d.id}
                                                >
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.department_id}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Recipient
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Person or department receiving the memo
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="to_name">
                                        To (name){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="to_name"
                                        type="text"
                                        value={data.to_name}
                                        onChange={(e) =>
                                            setData('to_name', e.target.value)
                                        }
                                        placeholder="Recipient name"
                                        required
                                        disabled={processing}
                                    />
                                    <InputError message={errors.to_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to_designation">
                                        To (designation)
                                    </Label>
                                    <Input
                                        id="to_designation"
                                        type="text"
                                        value={data.to_designation}
                                        onChange={(e) =>
                                            setData(
                                                'to_designation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Director"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Sender
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Person or office issuing the memo
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="from_name">
                                        From (name){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="from_name"
                                        type="text"
                                        value={data.from_name}
                                        onChange={(e) =>
                                            setData('from_name', e.target.value)
                                        }
                                        placeholder="Sender name"
                                        required
                                        disabled={processing}
                                    />
                                    <InputError message={errors.from_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="from_designation">
                                        From (designation)
                                    </Label>
                                    <Input
                                        id="from_designation"
                                        type="text"
                                        value={data.from_designation}
                                        onChange={(e) =>
                                            setData(
                                                'from_designation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Director"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                {aiEnabled && (
                                    <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm text-muted-foreground">
                                                Draft this memo from the
                                                selected paid voucher.
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                disabled={drafting}
                                                onClick={draftWithAi}
                                            >
                                                {drafting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Drafting
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4" />
                                                        Draft with AI
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        {draftNotice && (
                                            <p
                                                className="mt-2 text-sm text-muted-foreground"
                                                role="status"
                                            >
                                                {draftNotice}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <Label htmlFor="subject">
                                    Subject{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) =>
                                        setData('subject', e.target.value)
                                    }
                                    placeholder="Memo subject"
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.subject} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body">
                                    Body{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="body"
                                    value={data.body}
                                    onChange={(e) =>
                                        setData('body', e.target.value)
                                    }
                                    placeholder="Enter the memo content..."
                                    rows={6}
                                    required
                                    disabled={processing}
                                />
                                <InputError message={errors.body} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="voucher_id">
                                    Linked Voucher
                                </Label>
                                <Select
                                    value={data.voucher_id}
                                    onValueChange={(value) =>
                                        setData('voucher_id', value)
                                    }
                                >
                                    <SelectTrigger id="voucher_id">
                                        <SelectValue placeholder="Optional - link to a paid voucher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vouchers.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.voucher_number} —{' '}
                                                {v.payee_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.voucher_id} />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={processing}
                                >
                                    <Link href={memos.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save as draft'
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
