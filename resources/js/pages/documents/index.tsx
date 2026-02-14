import { Head } from '@inertiajs/react';
import {
    FileText,
    Search,
    Download,
    Eye,
    Trash2,
    Upload,
    Image,
    FileSpreadsheet,
    FileType,
    Filter,
    CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Document Management',
        href: '/documents',
    },
];

// Mock data for UI design
const mockDocuments = [
    {
        id: '1',
        voucher_number: 'PV-2024-001',
        document_type: 'Invoice',
        file_name: 'invoice_2024_001.pdf',
        file_type: 'pdf',
        file_size: 245760, // bytes
        uploaded_by: 'John Doe',
        uploaded_at: '2024-01-27T10:30:00',
        department: 'Finance',
        voucher_status: 'approved', // approved, pending, draft
    },
    {
        id: '2',
        voucher_number: 'PV-2024-002',
        document_type: 'Receipt',
        file_name: 'receipt_abc_company.jpg',
        file_type: 'jpg',
        file_size: 153600,
        uploaded_by: 'Jane Smith',
        uploaded_at: '2024-01-27T09:15:00',
        department: 'Procurement',
        voucher_status: 'approved',
    },
    {
        id: '3',
        voucher_number: 'PV-2024-003',
        document_type: 'Contract',
        file_name: 'service_contract_2024.pdf',
        file_type: 'pdf',
        file_size: 512000,
        uploaded_by: 'Michael Brown',
        uploaded_at: '2024-01-26T16:45:00',
        department: 'Legal',
        voucher_status: 'pending',
    },
    {
        id: '4',
        voucher_number: 'PV-2024-001',
        document_type: 'Delivery Note',
        file_name: 'delivery_note_001.pdf',
        file_type: 'pdf',
        file_size: 98304,
        uploaded_by: 'John Doe',
        uploaded_at: '2024-01-27T10:35:00',
        department: 'Finance',
        voucher_status: 'approved',
    },
    {
        id: '5',
        voucher_number: 'PV-2024-004',
        document_type: 'Quotation',
        file_name: 'quotation_xyz_ltd.xlsx',
        file_type: 'xlsx',
        file_size: 307200,
        uploaded_by: 'Sarah Johnson',
        uploaded_at: '2024-01-26T14:20:00',
        department: 'Procurement',
        voucher_status: 'draft',
    },
    {
        id: '6',
        voucher_number: 'PV-2024-002',
        document_type: 'Bank Statement',
        file_name: 'bank_statement_jan.pdf',
        file_type: 'pdf',
        file_size: 409600,
        uploaded_by: 'Jane Smith',
        uploaded_at: '2024-01-27T09:20:00',
        department: 'Procurement',
        voucher_status: 'approved',
    },
];

const documentTypes = [
    'Document Type',
    'Invoice',
    'Receipt',
    'Contract',
    'Quotation',
    'Delivery Note',
    'Bank Statement',
    'Other',
];

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) return Image;
    if (['xlsx', 'xls', 'csv'].includes(fileType)) return FileSpreadsheet;
    return FileType;
};

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');
    const [documentTypeFilter, setDocumentTypeFilter] = useState('Document Type');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<typeof mockDocuments[0] | null>(null);
    const [isAdmin] = useState(false); // Mock admin status - UI only

    const filteredDocuments = mockDocuments.filter((doc) => {
        const matchesSearch =
            doc.voucher_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
            documentTypeFilter === 'Document Type' ||
            doc.document_type === documentTypeFilter;

        return matchesSearch && matchesType;
    });

    const totalDocuments = mockDocuments.length;
    const invoiceCount = mockDocuments.filter(
        (doc) => doc.document_type === 'Invoice'
    ).length;
    const receiptCount = mockDocuments.filter(
        (doc) => doc.document_type === 'Receipt'
    ).length;
    const contractCount = mockDocuments.filter(
        (doc) => doc.document_type === 'Contract'
    ).length;
    const deliveryNoteCount = mockDocuments.filter(
        (doc) => doc.document_type === 'Delivery Note'
    ).length;
    const quotationCount = mockDocuments.filter(
        (doc) => doc.document_type === 'Quotation'
    ).length;
    const otherCount = mockDocuments.filter(
        (doc) =>
            ![
                'Invoice',
                'Receipt',
                'Contract',
                'Delivery Note',
                'Quotation',
                'Bank Statement',
            ].includes(doc.document_type)
    ).length;

    const handleDeleteClick = (document: typeof mockDocuments[0]) => {
        setDocumentToDelete(document);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        // UI only - no actual deletion
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Document Management
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            View, search, and manage documents attached to payment
                            vouchers.
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Documents
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {totalDocuments}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Invoices
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {invoiceCount}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Receipts
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {receiptCount}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Contracts
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {contractCount}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Delivery Notes
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {deliveryNoteCount}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Others
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {quotationCount + otherCount}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Documents</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredDocuments.length} document
                                    {filteredDocuments.length !== 1 ? 's' : ''} found
                                    {searchQuery &&
                                        ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                            {isAdmin && (
                                <Button>
                                    <Upload className="mr-2 h-4 w-4" />
                                    <span>Upload Document</span>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by voucher number, file name, department, or uploader..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <div className="sm:w-48">
                                    <Select
                                        value={documentTypeFilter}
                                        onValueChange={setDocumentTypeFilter}
                                    >
                                        <SelectTrigger>
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Document Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Table */}
                        {filteredDocuments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No documents found'
                                        : 'No documents found'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No documents match "${searchQuery}". Try a different search term.`
                                        : 'Get started by uploading a document.'}
                                </p>
                                {!searchQuery && isAdmin && (
                                    <Button>
                                        <Upload className="mr-2 h-4 w-4" />
                                        <span>Upload Document</span>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full" role="table">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Document
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Voucher No
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Department
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Uploaded By
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDocuments.map((document) => {
                                                const FileIcon = getFileIcon(
                                                    document.file_type
                                                );
                                                return (
                                                    <tr
                                                        key={document.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-black dark:text-white">
                                                                        {
                                                                            document.file_name
                                                                        }
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {
                                                                                document.file_type.toUpperCase()
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            •
                                                                        </span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {formatFileSize(
                                                                                document.file_size
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                {
                                                                    document.voucher_number
                                                                }
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge variant="outline">
                                                                {
                                                                    document.document_type
                                                                }
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    document.department
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {document.voucher_status ===
                                                            'approved' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-green-500 text-green-700 dark:text-green-400"
                                                                >
                                                                    <CheckCircle2 className="mr-0.5 h-3 w-3" />
                                                                    Linked
                                                                </Badge>
                                                            ) : document.voucher_status ===
                                                              'pending' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-amber-500 text-amber-700 dark:text-amber-400"
                                                                >
                                                                    Pending
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-gray-400 text-gray-600 dark:text-gray-400"
                                                                >
                                                                    Draft
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {
                                                                        document.uploaded_by
                                                                    }
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {formatDateTime(
                                                                        document.uploaded_at
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="View document"
                                                                    aria-label={`View ${document.file_name}`}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    <span className="sr-only">
                                                                        View
                                                                    </span>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Download document"
                                                                    aria-label={`Download ${document.file_name}`}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    <span className="sr-only">
                                                                        Download
                                                                    </span>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            document
                                                                        )
                                                                    }
                                                                    title="Delete document"
                                                                    aria-label={`Delete ${document.file_name}`}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">
                                                                        Delete
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                                            {filteredDocuments.length}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredDocuments.length}
                                        </span>{' '}
                                        documents
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
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete this document?
                        </DialogTitle>
                        <DialogDescription>
                            Once the document is deleted, it will be permanently
                            removed from the system. This action cannot be undone.
                        </DialogDescription>

                        {documentToDelete && (
                            <div className="rounded-md bg-muted p-4">
                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                    Document Details
                                </p>
                                <p className="text-sm text-black dark:text-white">
                                    {documentToDelete.file_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {documentToDelete.voucher_number} •{' '}
                                    {documentToDelete.document_type}
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setDocumentToDelete(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Delete Document
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
