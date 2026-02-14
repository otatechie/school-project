import { Head } from '@inertiajs/react';
import {
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Database,
    Eye,
    AlertCircle,
    Download,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'GIFMIS Submission',
        href: '/gifmis',
    },
];

// Mock data for UI design
const readyForExport = [
    {
        id: '1',
        voucher_number: 'PV-2024-001',
        department: 'Finance',
        amount: 45000.0,
        approval_date: '2024-01-27',
        status: 'ready',
    },
    {
        id: '2',
        voucher_number: 'PV-2024-002',
        department: 'Procurement',
        amount: 125000.0,
        approval_date: '2024-01-27',
        status: 'ready',
    },
    {
        id: '3',
        voucher_number: 'PV-2024-003',
        department: 'Admin',
        amount: 32000.0,
        approval_date: '2024-01-26',
        status: 'ready',
    },
    {
        id: '4',
        voucher_number: 'PV-2024-004',
        department: 'HR',
        amount: 18000.0,
        approval_date: '2024-01-26',
        status: 'ready',
    },
    {
        id: '5',
        voucher_number: 'PV-2024-005',
        department: 'Finance',
        amount: 95000.0,
        approval_date: '2024-01-25',
        status: 'ready',
    },
    {
        id: '6',
        voucher_number: 'PV-2024-006',
        department: 'Procurement',
        amount: 67000.0,
        approval_date: '2024-01-25',
        status: 'ready',
    },
];

const submissionHistory = [
    {
        id: '1',
        voucher_number: 'PV-2024-010',
        gifmis_ref: 'GIF-2024-001234',
        export_date: '2024-01-27T14:30:00',
        status: 'confirmed',
        exported_by: 'John Doe',
        confirmed_by: 'John Doe',
        confirmed_at: '2024-01-27T15:00:00',
    },
    {
        id: '2',
        voucher_number: 'PV-2024-009',
        gifmis_ref: 'GIF-2024-001233',
        export_date: '2024-01-27T10:15:00',
        status: 'confirmed',
        exported_by: 'Jane Smith',
        confirmed_by: 'Jane Smith',
        confirmed_at: '2024-01-27T10:45:00',
    },
    {
        id: '3',
        voucher_number: 'PV-2024-008',
        gifmis_ref: null,
        export_date: '2024-01-26T16:45:00',
        status: 'exported',
        exported_by: 'Michael Brown',
        confirmed_by: null,
        confirmed_at: null,
    },
    {
        id: '4',
        voucher_number: 'PV-2024-007',
        gifmis_ref: 'GIF-2024-001231',
        export_date: '2024-01-26T14:20:00',
        status: 'confirmed',
        exported_by: 'System (Auto)',
        confirmed_by: 'System (Auto)',
        confirmed_at: '2024-01-26T14:50:00',
    },
    
];
const failedExports = [
    {
        id: '1',
        voucher_number: 'PV-2024-015',
        error_message: 'Export file generation failed: Invalid voucher data',
        attempt_date: '2024-01-27T08:00:00',
    },
    {
        id: '2',
        voucher_number: 'PV-2024-014',
        error_message: 'Export failed: Missing required documents',
        attempt_date: '2024-01-26T12:30:00',
    },
    {
        id: '3',
        voucher_number: 'PV-2024-013',
        error_message: 'Export failed: Missing required field: Budget code',
        attempt_date: '2024-01-25T15:45:00',
    },
];

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

type TabType = 'ready' | 'history' | 'failed';

export default function Index() {
    const [activeTab, setActiveTab] = useState<TabType>('ready');
    const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [gifmisRef, setGifmisRef] = useState('');
    const [submissionLogDialogOpen, setSubmissionLogDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<typeof submissionHistory[0] | null>(
        null
    );
    const [isExporting, setIsExporting] = useState(false);
    const [retryDialogOpen, setRetryDialogOpen] = useState(false);
    const [voucherToRetry, setVoucherToRetry] = useState<string | null>(null);
    const [exportMode, setExportMode] = useState<'manual' | 'scheduled'>('manual');
    const [isAdmin] = useState(true); // Mock admin status - UI only
    const [integrationEnabled] = useState(true); // Mock integration status - UI only

    const readyCount = readyForExport.length;
    const exportedToday = submissionHistory.filter((submission) => {
        const exportDate = new Date(submission.export_date);
        const today = new Date();
        return exportDate.toDateString() === today.toDateString();
    }).length;
    const totalConfirmed = submissionHistory.filter(
        (submission) => submission.status === 'confirmed'
    ).length;
    const failedCount = failedExports.length;

    const handleSelectAll = () => {
        if (selectedVouchers.length === readyForExport.length) {
            setSelectedVouchers([]);
        } else {
            setSelectedVouchers(readyForExport.map((v) => v.id));
        }
    };

    const handleSelectVoucher = (id: string) => {
        if (selectedVouchers.includes(id)) {
            setSelectedVouchers(selectedVouchers.filter((v) => v !== id));
        } else {
            setSelectedVouchers([...selectedVouchers, id]);
        }
    };

    const handleExportClick = (voucherId?: string) => {
        if (voucherId) {
            setSelectedVouchers([voucherId]);
        }
        setExportDialogOpen(true);
    };

    const handleExportConfirm = () => {
        setIsExporting(true);
        setExportDialogOpen(false);
        // UI only - simulate export file generation
        setTimeout(() => {
            setIsExporting(false);
            setConfirmDialogOpen(true);
        }, 2000);
    };

    const handleConfirmSubmission = () => {
        if (!gifmisRef.trim()) {
            return;
        }
        // UI only - no actual confirmation
        setConfirmDialogOpen(false);
        setGifmisRef('');
        setSelectedVouchers([]);
    };

    const handleViewLog = (log: typeof submissionHistory[0]) => {
        setSelectedLog(log);
        setSubmissionLogDialogOpen(true);
    };

    const handleRetry = (voucherNumber: string) => {
        setVoucherToRetry(voucherNumber);
        setRetryDialogOpen(true);
    };

    const handleRetryConfirm = () => {
        setIsExporting(true);
        setRetryDialogOpen(false);
        // UI only - no actual retry
        setTimeout(() => {
            setIsExporting(false);
            setVoucherToRetry(null);
        }, 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIFMIS Submission Manager" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            GIFMIS Submission Manager
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Export approved vouchers for GIFMIS submission and track confirmation status.
                        </p>
                    </div>

                    {/* Instruction Banner */}
                    <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle className="text-sm font-semibold">
                            Export Process
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                            Upload the export file to the GIFMIS portal, then
                            enter the reference number here to confirm.
                        </AlertDescription>
                    </Alert>

                    {/* Integration Status Indicator */}
                    <div className="flex items-center gap-2">
                        {integrationEnabled ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    GIFMIS Integration Enabled
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                    GIFMIS Integration Disabled — Contact Administrator
                                </span>
                            </>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Ready For Export
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {readyCount}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Exported Today
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {exportedToday}
                                        </p>
                                    </div>
                                    <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Confirmed
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {totalConfirmed}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Failed Exports
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {failedCount}
                                        </p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>
                                            {activeTab === 'ready' && 'Ready For Export'}
                                            {activeTab === 'history' && 'Submission History'}
                                            {activeTab === 'failed' && 'Failed Exports'}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {activeTab === 'ready' &&
                                                `${readyForExport.length} voucher${readyForExport.length !== 1 ? 's' : ''} ready for export. Select vouchers and click "Export Selected" to generate file for GIFMIS upload.`}
                                            {activeTab === 'history' &&
                                                `View all ${submissionHistory.length} voucher${submissionHistory.length !== 1 ? 's' : ''} export and confirmation history. Click "View Details" to see submission information.`}
                                            {activeTab === 'failed' &&
                                                `${failedExports.length} voucher${failedExports.length !== 1 ? 's' : ''} failed to export. Review error messages and retry when ready.`}
                                        </CardDescription>
                                    </div>
                                    {/* Export Mode Toggle (Admin Only) */}
                                    {isAdmin && activeTab === 'ready' && (
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground uppercase">
                                                    Export Mode:
                                                </span>
                                                <Badge variant="outline" className="text-sm">
                                                    Admin Only
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="flex cursor-pointer items-center gap-1.5">
                                                    <input
                                                        type="radio"
                                                        name="exportMode"
                                                        value="manual"
                                                        checked={exportMode === 'manual'}
                                                        onChange={(e) =>
                                                            setExportMode(
                                                                e.target.value as
                                                                    | 'manual'
                                                                    | 'scheduled'
                                                            )
                                                        }
                                                        className="h-3.5 w-3.5 cursor-pointer border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-black dark:text-white">
                                                        Manual
                                                    </span>
                                                </label>
                                                <label className="flex cursor-pointer items-center gap-1.5">
                                                    <input
                                                        type="radio"
                                                        name="exportMode"
                                                        value="scheduled"
                                                        checked={exportMode === 'scheduled'}
                                                        onChange={(e) =>
                                                            setExportMode(
                                                                e.target.value as
                                                                    | 'manual'
                                                                    | 'scheduled'
                                                            )
                                                        }
                                                        className="h-3.5 w-3.5 cursor-pointer border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-black dark:text-white">
                                                        Scheduled
                                                    </span>
                                                </label>
                                            </div>
                                            {exportMode === 'scheduled' && (
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-black dark:text-white">
                                                        Next Export: 12:00 PM
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Scheduled Export Enabled
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Tab Navigation */}
                        <div className="mb-6 border-b border-border">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab('ready')}
                                    aria-label="View vouchers ready for export"
                                    aria-selected={activeTab === 'ready'}
                                    className={cn(
                                        'cursor-pointer px-4 py-2 text-sm font-medium transition-colors',
                                        'border-b-2 border-transparent',
                                        'hover:text-black dark:hover:text-white',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                        activeTab === 'ready'
                                            ? 'border-primary text-black dark:text-white'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    Ready For Export
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    aria-label="View submission history"
                                    aria-selected={activeTab === 'history'}
                                    className={cn(
                                        'cursor-pointer px-4 py-2 text-sm font-medium transition-colors',
                                        'border-b-2 border-transparent',
                                        'hover:text-black dark:hover:text-white',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                        activeTab === 'history'
                                            ? 'border-primary text-black dark:text-white'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    Submission History
                                </button>
                                <button
                                    onClick={() => setActiveTab('failed')}
                                    aria-label="View failed exports"
                                    aria-selected={activeTab === 'failed'}
                                    className={cn(
                                        'cursor-pointer px-4 py-2 text-sm font-medium transition-colors',
                                        'border-b-2 border-transparent',
                                        'hover:text-black dark:hover:text-white',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                        activeTab === 'failed'
                                            ? 'border-primary text-black dark:text-white'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    Failed Exports
                                </button>
                            </div>
                        </div>

                        {/* Bulk Actions Bar (Ready Tab Only - Manual Mode) */}
                        {activeTab === 'ready' &&
                            exportMode === 'manual' &&
                            selectedVouchers.length > 0 && (
                                <div
                                    className="mb-4 flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-3"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <div>
                                        <span className="text-sm font-medium text-black dark:text-white">
                                            {selectedVouchers.length} voucher
                                            {selectedVouchers.length !== 1
                                                ? 's'
                                                : ''}{' '}
                                            selected
                                        </span>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Click "Export Selected" to generate file for GIFMIS
                                        </p>
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleExportClick()}
                                        aria-label={`Export ${selectedVouchers.length} selected voucher${selectedVouchers.length !== 1 ? 's' : ''} for GIFMIS`}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Export Selected ({selectedVouchers.length})
                                    </Button>
                                </div>
                            )}

                        {/* Scheduled Mode Info (Ready Tab Only) */}
                        {activeTab === 'ready' &&
                            exportMode === 'scheduled' &&
                            readyForExport.length > 0 && (
                                <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                                    <div className="flex items-start gap-3">
                                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                Next Export: 12:00 PM
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Scheduled Export Enabled - {readyForExport.length}{' '}
                                                voucher
                                                {readyForExport.length !== 1 ? 's' : ''} will
                                                be exported automatically
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* TAB 1: Ready For Export */}
                        {activeTab === 'ready' && (
                            <>
                                {readyForExport.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <CheckCircle2 className="mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                            All vouchers exported
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            All approved vouchers have been
                                            exported. Check the "Submission History" tab to view
                                            previous exports and confirmations.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                        <table className="w-full" role="table">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="px-4 py-3 text-left">
                                                        <label className="sr-only">
                                                            Select all vouchers
                                                        </label>
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedVouchers.length ===
                                                                readyForExport.length
                                                            }
                                                            onChange={
                                                                handleSelectAll
                                                            }
                                                            aria-label="Select all vouchers"
                                                            className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Voucher No
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Department
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Approval Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {readyForExport.map((voucher) => (
                                                    <tr
                                                        key={voucher.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <label className="sr-only">
                                                                Select voucher{' '}
                                                                {voucher.voucher_number}
                                                            </label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedVouchers.includes(
                                                                    voucher.id
                                                                )}
                                                                onChange={() =>
                                                                    handleSelectVoucher(
                                                                        voucher.id
                                                                    )
                                                                }
                                                                aria-label={`Select voucher ${voucher.voucher_number}`}
                                                                className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                {
                                                                    voucher.voucher_number
                                                                }
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    voucher.department
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm font-semibold text-black dark:text-white">
                                                                GHS{' '}
                                                                {voucher.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(
                                                                    voucher.approval_date
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-blue-500 text-blue-600 dark:text-blue-400"
                                                            >
                                                                Ready
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title={`View details for voucher ${voucher.voucher_number}`}
                                                                    aria-label={`View details for voucher ${voucher.voucher_number}`}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    <span className="sr-only">
                                                                        View voucher
                                                                    </span>
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleExportClick(
                                                                            voucher.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isExporting
                                                                    }
                                                                    aria-label={`Export voucher ${voucher.voucher_number} for GIFMIS`}
                                                                    title={
                                                                        isExporting
                                                                            ? 'Exporting in progress...'
                                                                            : `Export voucher ${voucher.voucher_number} for GIFMIS`
                                                                    }
                                                                    className="gap-2"
                                                                >
                                                                    {isExporting ? (
                                                                        <>
                                                                            <RefreshCw
                                                                                className="h-4 w-4 animate-spin"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span className="hidden sm:inline">
                                                                                Exporting...
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Download
                                                                                className="h-4 w-4"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span className="hidden sm:inline">
                                                                                Export
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>

                                        {/* Pagination */}
                                        <Separator className="my-6" />
                                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    1
                                                </span>{' '}
                                                to{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {readyForExport.length}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {readyForExport.length}
                                                </span>{' '}
                                                vouchers
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                >
                                                    Previous
                                                </Button>
                                                <Button variant="default" size="sm">
                                                    1
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    2
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    3
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* TAB 2: Submission History */}
                        {activeTab === 'history' && (
                            <>
                                {submissionHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Database className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                            No submission history
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            No vouchers have been exported yet. Once you export vouchers
                                            from the "Ready For Export" tab, they
                                            will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                        <table className="w-full" role="table">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Voucher No
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        GIFMIS Ref
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Export Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Exported By
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissionHistory.map((submission) => (
                                                    <tr
                                                        key={submission.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                {
                                                                    submission.voucher_number
                                                                }
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {submission.gifmis_ref ? (
                                                                <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                    {submission.gifmis_ref}
                                                                </code>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">
                                                                    Not confirmed
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDateTime(
                                                                    submission.export_date
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge
                                                                variant={
                                                                    submission.status ===
                                                                    'confirmed'
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className={cn(
                                                                    'gap-1.5',
                                                                    submission.status ===
                                                                        'confirmed' &&
                                                                        'border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
                                                                    submission.status ===
                                                                        'exported' &&
                                                                        'border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                                                )}
                                                            >
                                                                {submission.status ===
                                                                'confirmed' ? (
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                ) : (
                                                                    <Download className="h-3 w-3" />
                                                                )}
                                                                {submission.status ===
                                                                'confirmed'
                                                                    ? 'Confirmed'
                                                                    : 'Exported'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {submission.exported_by}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center justify-end">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleViewLog(
                                                                            submission
                                                                        )
                                                                    }
                                                                    aria-label={`View submission details for voucher ${submission.voucher_number}`}
                                                                    title={`View detailed submission information for voucher ${submission.voucher_number}`}
                                                                    className="gap-2"
                                                                >
                                                                    <Eye
                                                                        className="h-4 w-4"
                                                                        aria-hidden="true"
                                                                    />
                                                                    <span className="hidden sm:inline">
                                                                        View Details
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>

                                        {/* Pagination */}
                                        <Separator className="my-6" />
                                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    1
                                                </span>{' '}
                                                to{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {submissionHistory.length}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {submissionHistory.length}
                                                </span>{' '}
                                                records
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                >
                                                    Previous
                                                </Button>
                                                <Button variant="default" size="sm">
                                                    1
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    2
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    3
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* TAB 3: Failed Exports */}
                        {activeTab === 'failed' && (
                            <>
                                {failedExports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <CheckCircle2 className="mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                            No failed exports
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            All export attempts have been
                                            successful. If any exports fail in the
                                            future, they will appear here for
                                            review and retry.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                        <table className="w-full" role="table">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Voucher No
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Error Message
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                        Attempt Date
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {failedExports.map((failed) => (
                                                    <tr
                                                        key={failed.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                {
                                                                    failed.voucher_number
                                                                }
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                                                <span className="text-sm text-muted-foreground">
                                                                    {
                                                                        failed.error_message
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDateTime(
                                                                    failed.attempt_date
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center justify-end">
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRetry(
                                                                            failed.voucher_number
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isExporting
                                                                    }
                                                                    aria-label={`Retry export for voucher ${failed.voucher_number}`}
                                                                    title={
                                                                        isExporting
                                                                            ? 'Retrying export...'
                                                                            : `Retry export for voucher ${failed.voucher_number}`
                                                                    }
                                                                    className="gap-2"
                                                                >
                                                                    {isExporting ? (
                                                                        <>
                                                                            <RefreshCw
                                                                                className="h-4 w-4 animate-spin"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span className="hidden sm:inline">
                                                                                Retrying...
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <RefreshCw
                                                                                className="h-4 w-4"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span className="hidden sm:inline">
                                                                                Retry Export
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>

                                        {/* Pagination */}
                                        <Separator className="my-6" />
                                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    1
                                                </span>{' '}
                                                to{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {failedExports.length}
                                                </span>{' '}
                                                of{' '}
                                                <span className="font-medium text-black dark:text-white">
                                                    {failedExports.length}
                                                </span>{' '}
                                                records
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                >
                                                    Previous
                                                </Button>
                                                <Button variant="default" size="sm">
                                                    1
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    2
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    3
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Export Confirmation Dialog */}
                <Dialog
                    open={exportDialogOpen}
                    onOpenChange={setExportDialogOpen}
                >
                    <DialogContent>
                        <DialogTitle>
                            Export for GIFMIS Submission
                        </DialogTitle>
                        <DialogDescription>
                            <p className="mb-2">
                                This will generate an export file for the selected vouchers. 
                                You will need to upload this file to the GIFMIS portal manually.
                            </p>
                            {selectedVouchers.length > 1 ? (
                                <p className="font-semibold text-black dark:text-white">
                                    {selectedVouchers.length} vouchers will be exported.
                                </p>
                            ) : (
                                <p className="font-semibold text-black dark:text-white">
                                    1 voucher will be exported.
                                </p>
                            )}
                        </DialogDescription>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => setExportDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="default"
                                onClick={handleExportConfirm}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export File
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* GIFMIS Reference Confirmation Dialog */}
                <Dialog
                    open={confirmDialogOpen}
                    onOpenChange={setConfirmDialogOpen}
                >
                    <DialogContent>
                        <DialogTitle>
                            File Generated Successfully
                        </DialogTitle>
                        <DialogDescription>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                        Next Steps:
                                    </p>
                                    <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                                        <li>Upload this file to GIFMIS Portal</li>
                                        <li>Enter the GIFMIS Reference Number below</li>
                                        <li>Confirm submission to complete the process</li>
                                    </ol>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="gifmis-ref" className="text-sm font-semibold text-black dark:text-white">
                                        GIFMIS Reference Number
                                    </label>
                                    <Input
                                        id="gifmis-ref"
                                        type="text"
                                        value={gifmisRef}
                                        onChange={(e) => setGifmisRef(e.target.value)}
                                        placeholder="Enter GIFMIS reference (e.g., GIF-2024-001234)"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Enter the reference number provided by GIFMIS after successful upload.
                                    </p>
                                </div>
                            </div>
                        </DialogDescription>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setConfirmDialogOpen(false);
                                        setGifmisRef('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="default"
                                onClick={handleConfirmSubmission}
                                disabled={!gifmisRef.trim()}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Submission
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Submission Details View Dialog */}
                <Dialog
                    open={submissionLogDialogOpen}
                    onOpenChange={setSubmissionLogDialogOpen}
                >
                    <DialogContent className="max-w-2xl">
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                            Export and confirmation information for this voucher
                        </DialogDescription>

                        {selectedLog && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                        Voucher Number
                                    </p>
                                    <code className="block rounded-md bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                                        {selectedLog.voucher_number}
                                    </code>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                        GIFMIS Reference
                                    </p>
                                    {selectedLog.gifmis_ref ? (
                                        <code className="block rounded-md bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                                            {selectedLog.gifmis_ref}
                                        </code>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Not yet confirmed
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                        Export Date
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(selectedLog.export_date)}
                                    </p>
                                </div>

                                {selectedLog.confirmed_at && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-black dark:text-white">
                                            Confirmed Date
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(selectedLog.confirmed_at)}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-black dark:text-white">
                                        Exported By
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedLog.exported_by}
                                    </p>
                                </div>

                                {selectedLog.confirmed_by && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-black dark:text-white">
                                            Confirmed By
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedLog.confirmed_by}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Retry Export Confirmation Dialog */}
                <Dialog
                    open={retryDialogOpen}
                    onOpenChange={setRetryDialogOpen}
                >
                    <DialogContent>
                        <DialogTitle>
                            Retry Export?
                        </DialogTitle>
                        <DialogDescription>
                            <p className="mb-2">
                                This will attempt to export the voucher again. If
                                the previous error persists, please review the
                                voucher details before retrying.
                            </p>
                            {voucherToRetry && (
                                <p className="font-semibold text-black dark:text-white">
                                    Voucher: {voucherToRetry}
                                </p>
                            )}
                        </DialogDescription>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => setRetryDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="default"
                                onClick={handleRetryConfirm}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry Export
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
