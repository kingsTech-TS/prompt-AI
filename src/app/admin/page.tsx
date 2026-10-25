"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminApi, authApi } from "@/lib/api";
import { UserResponse } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Mail, Trash2, Edit2, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editSubscription, setEditSubscription] = useState<"free" | "pro">("free");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTarget, setEmailTarget] = useState<"all" | "free" | "pro">("all");

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: () => adminApi.getUsers(),
    enabled: user?.role === "admin",
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; role?: "user" | "admin"; subscription?: "free" | "pro" }) =>
      adminApi.updateUser(data.userId, { role: data.role, subscription: data.subscription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast({ title: "User updated successfully!" });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      toast({ title: "User deleted successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (data: { subject: string; body: string; target: "all" | "free" | "pro" }) =>
      adminApi.sendBulkEmail(data),
    onSuccess: () => {
      toast({ title: "Bulk email sent successfully!" });
      setEmailSubject("");
      setEmailBody("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (!isUserLoading && user?.role !== "admin") {
    router.push("/");
    return null;
  }

  const handleEditOpen = (u: UserResponse) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditSubscription(u.subscription);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      userId: editingUser.id,
      role: editRole,
      subscription: editSubscription,
    });
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) {
      toast({
        title: "Missing fields",
        description: "Please fill in all email fields.",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate({
      subject: emailSubject,
      body: emailBody,
      target: emailTarget,
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--theme-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-1)]" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex min-w-0 flex-1 flex-col overflow-y-auto pt-14 lg:pt-0">
          <div className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:py-12">
            <div className="mx-auto w-full max-w-6xl space-y-8">
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                  <Shield className="h-5 w-5 text-brand-fg" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Admin dashboard</h1>
                  <p className="text-sm text-fg-muted">Manage users, subscriptions, and bulk emails.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Table */}
                <div className="lg:col-span-2">
                  <div className="rounded-3xl border border-line bg-surface shadow-soft overflow-hidden p-6">
                    <h2 className="text-base font-semibold text-fg mb-6">User Management</h2>
                    {isUsersLoading ? (
                      <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent-1)]" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[var(--theme-border)]">
                              <TableHead className="text-[var(--theme-text-secondary)]">User</TableHead>
                              <TableHead className="text-[var(--theme-text-secondary)]">Role</TableHead>
                              <TableHead className="text-[var(--theme-text-secondary)]">Subscription</TableHead>
                              <TableHead className="text-[var(--theme-text-secondary)]">Usage</TableHead>
                              <TableHead className="text-[var(--theme-text-secondary)] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users?.map((u) => (
                              <TableRow key={u.id} className="border-[var(--theme-border)] hover:bg-[var(--theme-background-tertiary)]">
                                <TableCell>
                                  <div className="font-semibold text-[var(--theme-text)]">{u.username}</div>
                                  <div className="text-xs text-[var(--theme-text-tertiary)]">{u.email}</div>
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-[var(--theme-background-tertiary)] text-[var(--theme-text-secondary)]'}`}>
                                    {u.role}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${u.subscription === 'pro' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-[var(--theme-background-tertiary)] text-[var(--theme-text-secondary)]'}`}>
                                    {u.subscription.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-[var(--theme-text)]">{u.prompts_used} / {u.max_prompts}</div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditOpen(u)} className="h-8 w-8 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-1)]">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-[var(--theme-text-secondary)] hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Bulk Email */}
                <div>
                  <div className="rounded-3xl border border-line bg-surface shadow-soft p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-[var(--theme-background-tertiary)] flex items-center justify-center border border-[var(--theme-border)] text-[var(--theme-accent-1)] shadow-sm">
                        <Mail className="h-5 w-5" />
                      </div>
                      <h2 className="text-base font-semibold text-fg">Bulk Email</h2>
                    </div>

                    <form onSubmit={handleSendEmail} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--theme-text-secondary)]">Target Audience</label>
                        <Select value={emailTarget} onValueChange={(val: any) => setEmailTarget(val)}>
                          <SelectTrigger className="w-full bg-canvas/60">
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="free">Free Users</SelectItem>
                            <SelectItem value="pro">Pro Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--theme-text-secondary)]">Subject</label>
                        <Input 
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Email subject..."
                          className="bg-canvas/60"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--theme-text-secondary)]">Body</label>
                        <Textarea 
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your message here..."
                          rows={6}
                          className="bg-canvas/60 resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={sendEmailMutation.isPending}
                        className="w-full"
                      >
                        {sendEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Broadcast"}
                      </Button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[var(--theme-background-secondary)] border-[var(--theme-border)] text-[var(--theme-text)]">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
            <DialogDescription className="text-[var(--theme-text-secondary)]">
              Modify role and subscription limits. Max prompts will auto-update on backend if you switch subscription to Pro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--theme-text-secondary)]">Role</label>
              <Select value={editRole} onValueChange={(val: any) => setEditRole(val)}>
                <SelectTrigger className="w-full bg-canvas/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--theme-text-secondary)]">Subscription</label>
              <Select value={editSubscription} onValueChange={(val: any) => setEditSubscription(val)}>
                <SelectTrigger className="w-full bg-canvas/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleEditSave} 
              disabled={updateUserMutation.isPending}
              className="w-full mt-4"
            >
              {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
