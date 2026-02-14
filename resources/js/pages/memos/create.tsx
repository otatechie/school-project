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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import memos from '@/routes/memos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Memos', href: memos.index().url },
    { title: 'Create', href: '#' },
];

export default function Create() {
    const [formData, setFormData] = useState({
        memo_date: new Date().toISOString().split('T')[0],
        subject: '',
        body: '',
        to_name: '',
        to_designation: '',
        from_name: '',
        from_designation: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Reserved for validation errors when form is wired to backend.
    const errors: Record<string, string> = {};
    // Reserved for success message when form is wired to backend.
    const successMessage = '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // UI only: simulate submit; replace with real submit when backend is ready.
        setTimeout(() => setIsSubmitting(false), 800);
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
                            Enter the details for this memo. All required
                            fields are marked with an asterisk (*).
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
                            <div className="space-y-2">
                                <Label htmlFor="memo_date">
                                    Memo date{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="memo_date"
                                    type="date"
                                    value={formData.memo_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            memo_date: e.target.value,
                                        })
                                    }
                                    required
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                                <InputError message={errors.memo_date} />
                                <p className="text-sm text-muted-foreground">
                                    Date that appears on the memo (defaults to
                                    today)
                                </p>
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
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="to_name"
                                        type="text"
                                        value={formData.to_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                to_name: e.target.value,
                                            })
                                        }
                                        placeholder="Recipient name"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.to_name} />
                                    <p className="text-sm text-muted-foreground">
                                        Full name of the recipient
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to_designation">
                                        To (designation)
                                    </Label>
                                    <Input
                                        id="to_designation"
                                        type="text"
                                        value={formData.to_designation}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                to_designation: e.target.value,
                                            })
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
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="from_name"
                                        type="text"
                                        value={formData.from_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                from_name: e.target.value,
                                            })
                                        }
                                        placeholder="Sender name"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.from_name} />
                                    <p className="text-sm text-muted-foreground">
                                        Full name of the sender
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="from_designation">
                                        From (designation)
                                    </Label>
                                    <Input
                                        id="from_designation"
                                        type="text"
                                        value={formData.from_designation}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                from_designation: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Director"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Memo Content
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Subject and body of the memorandum
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">
                                    Subject{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            subject: e.target.value,
                                        })
                                    }
                                    placeholder="Memo subject"
                                    required
                                    disabled={isSubmitting}
                                />
                                <InputError message={errors.subject} />
                                <p className="text-sm text-muted-foreground">
                                    Brief summary of the memo topic
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body">
                                    Body{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="body"
                                    value={formData.body}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            body: e.target.value,
                                        })
                                    }
                                    placeholder="Enter the memo content..."
                                    rows={6}
                                    required
                                    disabled={isSubmitting}
                                />
                                <InputError message={errors.body} />
                                <p className="text-sm text-muted-foreground">
                                    Main content of the memorandum
                                </p>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isSubmitting}
                                >
                                    <Link href={memos.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
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
