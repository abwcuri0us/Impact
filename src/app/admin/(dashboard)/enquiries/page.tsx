'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Phone, Mail, BookOpen, Clock,
  Search, Filter, Eye, EyeOff, Trash2, Loader2,
  CheckCircle, User, ExternalLink,
  ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  course: string | null;
  message: string | null;
  source: string;
  isRead: boolean;
  createdAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('all');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const PAGE_SIZE = 15;

  const fetchEnquiries = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: (page * PAGE_SIZE).toString(),
      });
      if (readFilter !== 'all') params.set('read', readFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/enquiries?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
        setTotal(data.total || 0);
      } else {
        toast.error('Failed to fetch enquiries');
      }
    } catch {
      toast.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  }, [page, readFilter, search]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    setPage(0);
  }, [readFilter, search]);

  const openDetail = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setDetailOpen(true);

    // Mark as read
    if (!enquiry.isRead) {
      try {
        await fetch('/api/enquiries', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: enquiry.id, isRead: true }),
        });
        // Update local state
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiry.id ? { ...e, isRead: true } : e))
        );
        setSelectedEnquiry((prev) => prev ? { ...prev, isRead: true } : null);
      } catch {
        // Silent fail
      }
    }
  };

  const handleMarkUnread = async (enquiry: Enquiry) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enquiry.id, isRead: false }),
      });
      if (res.ok) {
        toast.success('Marked as new');
        fetchEnquiries();
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/enquiries?id=${deleteTarget}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Enquiry deleted');
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchEnquiries();
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete enquiry');
    } finally {
      setSaving(false);
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'whatsapp') {
      return (
        <Badge className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-600 border-green-500/20">
          WhatsApp
        </Badge>
      );
    }
    return (
      <Badge className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
        Website
      </Badge>
    );
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const unreadCount = enquiries.filter((e) => !e.isRead).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            {total} enquiry{total !== 1 ? 's' : ''} total
            {unreadCount > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">
                {unreadCount} new/unread
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEnquiries} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Enquiries</SelectItem>
                <SelectItem value="false">New / Unread</SelectItem>
                <SelectItem value="true">Read / Contacted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries List */}
      {enquiries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No enquiries yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                When students submit enquiries through the website or WhatsApp, they will appear here with full details including name, contact, interested course, and message.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Student</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Contact</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Course</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date & Time</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {enquiries.map((enquiry, index) => (
                        <motion.tr
                          key={enquiry.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${
                            !enquiry.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => openDetail(enquiry)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!enquiry.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-brand-purple/10'}`}>
                                <User className={`w-4 h-4 ${!enquiry.isRead ? 'text-blue-600' : 'text-brand-purple'}`} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium truncate block">
                                  {enquiry.name}
                                  {!enquiry.isRead && (
                                    <span className="ml-1.5 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </span>
                                {enquiry.message && (
                                  <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                    {enquiry.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-foreground">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {enquiry.phone}
                              </div>
                              {enquiry.email && enquiry.email !== 'N/A' && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {enquiry.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-foreground">
                              {enquiry.course || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getSourceBadge(enquiry.source)}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDateTime(enquiry.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openDetail(enquiry)}
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {enquiry.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleMarkUnread(enquiry)}
                                  title="Mark as new"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  window.open(`https://wa.me/91${enquiry.phone.replace(/\D/g, '')}`, '_blank');
                                }}
                                title="Reply via WhatsApp"
                              >
                                <ExternalLink className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => {
                                  setDeleteTarget(enquiry.id);
                                  setDeleteOpen(true);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {enquiries.map((enquiry, index) => (
                <motion.div
                  key={enquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => openDetail(enquiry)}
                  className={`cursor-pointer ${!enquiry.isRead ? 'ring-1 ring-blue-500/30' : ''}`}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!enquiry.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-brand-purple/10'}`}>
                            <User className={`w-4 h-4 ${!enquiry.isRead ? 'text-blue-600' : 'text-brand-purple'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-sm truncate">{enquiry.name}</h3>
                              {!enquiry.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <Phone className="w-3 h-3" />
                              {enquiry.phone}
                            </div>
                          </div>
                        </div>
                        {getSourceBadge(enquiry.source)}
                      </div>

                      {enquiry.course && (
                        <div className="flex items-center gap-1.5 text-xs text-foreground mb-2 ml-11">
                          <BookOpen className="w-3 h-3 text-muted-foreground" />
                          {enquiry.course}
                        </div>
                      )}

                      {enquiry.message && (
                        <p className="text-xs text-muted-foreground ml-11 mb-2 line-clamp-2">
                          {enquiry.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground ml-11">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDateTime(enquiry.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); openDetail(enquiry); }}>
                            <Eye className="w-3 h-3" /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-green-600 gap-1"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/91${enquiry.phone.replace(/\D/g, '')}`, '_blank'); }}
                          >
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-sm font-medium">Page {page + 1} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Enquiry Details
              {selectedEnquiry && !selectedEnquiry.isRead && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                  New
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedEnquiry ? formatDateTime(selectedEnquiry.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4 py-2">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Name</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedEnquiry.name}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Phone</p>
                  <a href={`tel:${selectedEnquiry.phone}`} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border hover:bg-muted transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedEnquiry.phone}</span>
                  </a>
                </div>
              </div>

              {(selectedEnquiry.email && selectedEnquiry.email !== 'N/A') && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Email</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedEnquiry.email}</span>
                  </div>
                </div>
              )}

              {selectedEnquiry.course && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Interested Course</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedEnquiry.course}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Source</p>
                <div className="flex items-center gap-3">
                  {getSourceBadge(selectedEnquiry.source)}
                  <a
                    href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    Reply via WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-xs text-brand-purple hover:underline flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3 h-3" /> Call Now
                  </a>
                </div>
              </div>

              {selectedEnquiry.message && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Message</p>
                  <div className="px-3 py-2 bg-muted/50 rounded-lg border text-sm leading-relaxed">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
