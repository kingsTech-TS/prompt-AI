"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProtectedRoute from "@/components/protected-route";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { collectionsApi } from "@/lib/api";
import {
  CollectionResponse,
  CollectionCreate,
  SubCollectionResponse,
  SubCollectionCreate,
  TechItem,
  CollectionType,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
  Layers,
  Check,
  Tag,
  Briefcase,
  X,
  Code2,
} from "lucide-react";

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialog open states
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isSubCollectionOpen, setIsSubCollectionOpen] = useState(false);

  // Form states - Collections
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionType, setCollectionType] = useState<CollectionType>("frontend");
  const [techList, setTechList] = useState<TechItem[]>([]);
  const [newTechName, setNewTechName] = useState("");
  const [newTechCategory, setNewTechCategory] = useState("Framework");

  // Form states - Sub-Collections
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  // Fetch collections
  const { data: collections, isLoading: collectionsLoading } = useQuery<CollectionResponse[]>({
    queryKey: ["collections"],
    queryFn: () => collectionsApi.getAll(),
  });

  // Fetch sub-collections
  const { data: subCollections, isLoading: subCollectionsLoading } = useQuery<SubCollectionResponse[]>({
    queryKey: ["sub-collections"],
    queryFn: () => collectionsApi.getAllSub(),
  });

  // Mutation: Collection CRUD
  const saveCollectionMutation = useMutation({
    mutationFn: async (data: CollectionCreate) => {
      if (editingCollectionId) {
        return await collectionsApi.update(editingCollectionId, data);
      }
      return await collectionsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["sub-collections"] });
      toast({
        title: editingCollectionId ? "Collection updated" : "Collection created",
        description: "Your tech stack collection has been saved successfully.",
      });
      closeCollectionDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to save collection",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await collectionsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["sub-collections"] });
      toast({
        title: "Collection deleted",
        description: "The collection has been successfully deleted.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err.message || "Failed to delete collection",
        variant: "destructive",
      });
    },
  });

  // Mutation: Sub-Collection CRUD
  const saveSubMutation = useMutation({
    mutationFn: async (data: SubCollectionCreate) => {
      if (editingSubId) {
        return await collectionsApi.updateSub(editingSubId, data);
      }
      return await collectionsApi.createSub(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-collections"] });
      toast({
        title: editingSubId ? "Sub-collection updated" : "Sub-collection created",
        description: "Your sub-collection group has been saved successfully.",
      });
      closeSubDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to save sub-collection",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => {
      return await collectionsApi.deleteSub(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-collections"] });
      toast({
        title: "Sub-collection deleted",
        description: "The sub-collection has been successfully deleted.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err.message || "Failed to delete sub-collection",
        variant: "destructive",
      });
    },
  });

  // Dialog helpers
  const openNewCollectionDialog = () => {
    setEditingCollectionId(null);
    setCollectionName("");
    setCollectionType("frontend");
    setTechList([]);
    setNewTechName("");
    setIsCollectionOpen(true);
  };

  const openEditCollectionDialog = (c: CollectionResponse) => {
    setEditingCollectionId(c.id);
    setCollectionName(c.name);
    setCollectionType(c.type);
    setTechList([...c.technologies]);
    setNewTechName("");
    setIsCollectionOpen(true);
  };

  const closeCollectionDialog = () => {
    setIsCollectionOpen(false);
  };

  const openNewSubDialog = () => {
    setEditingSubId(null);
    setSubName("");
    setSelectedCollectionIds([]);
    setIsSubCollectionOpen(true);
  };

  const openEditSubDialog = (sc: SubCollectionResponse) => {
    setEditingSubId(sc.id);
    setSubName(sc.name);
    setSelectedCollectionIds([...sc.collection_ids]);
    setIsSubCollectionOpen(true);
  };

  const closeSubDialog = () => {
    setIsSubCollectionOpen(false);
  };

  // Add a tech item to local list
  const addTechItem = () => {
    if (!newTechName.trim()) return;
    const name = newTechName.trim();
    if (techList.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      toast({
        title: "Already added",
        description: `${name} is already in this stack collection.`,
        variant: "destructive",
      });
      return;
    }
    setTechList([...techList, { name, category: newTechCategory }]);
    setNewTechName("");
  };

  const removeTechItem = (idx: number) => {
    setTechList(techList.filter((_, i) => i !== idx));
  };

  // Handle forms submit
  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (techList.length === 0) {
      toast({ title: "Please add at least one technology tag", variant: "destructive" });
      return;
    }

    saveCollectionMutation.mutate({
      name: collectionName.trim(),
      type: collectionType,
      technologies: techList,
    });
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (selectedCollectionIds.length === 0) {
      toast({ title: "Select at least one stack collection", variant: "destructive" });
      return;
    }

    saveSubMutation.mutate({
      name: subName.trim(),
      collection_ids: selectedCollectionIds,
    });
  };

  const toggleCollectionSelection = (id: string) => {
    if (selectedCollectionIds.includes(id)) {
      setSelectedCollectionIds(selectedCollectionIds.filter((cid) => cid !== id));
    } else {
      setSelectedCollectionIds([...selectedCollectionIds, id]);
    }
  };

  const getTypeColor = (type: CollectionType) => {
    switch (type) {
      case "frontend":
        return "text-blue-400 border-blue-400/20 bg-blue-500/10";
      case "backend":
        return "text-purple-400 border-purple-400/20 bg-purple-500/10";
      case "data":
        return "text-emerald-400 border-emerald-400/20 bg-emerald-500/10";
      default:
        return "text-amber-400 border-amber-400/20 bg-amber-500/10";
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar />
        <main className="ambient flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8 lg:py-12">

            {/* Header */}
            <div className="animate-rise">
              <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                  <Code2 className="h-4 w-4 text-brand-fg" />
                </span>
                Tech stack collections
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-fg-muted">
                Manage your reusable technology stacks and combine them to generate precise, custom-tailored prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left Column: Stack Collections */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                    <FolderOpen className="h-4 w-4 text-brand" />
                    Collections
                  </h2>
                  <Button
                    onClick={openNewCollectionDialog}
                    size="sm" className="h-9 px-3"
                  >
                    <Plus className="h-4 w-4" />
                    New Stack
                  </Button>
                </div>

                {collectionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-32 animate-pulse rounded-2xl bg-elevated" />
                    ))}
                  </div>
                ) : collections && collections.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {collections.map((c) => (
                      <div
                        key={c.id}
                        className="card-interactive group relative overflow-hidden p-5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-fg">
                              {c.name}
                            </h3>
                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[11px] font-medium mt-1.5 capitalize ${getTypeColor(c.type)}`}>
                              {c.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              onClick={() => openEditCollectionDialog(c)}
                              className="p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-fg hover:bg-elevated transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteCollectionMutation.mutate(c.id)}
                              className="p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Tech tags list */}
                        <div className="flex flex-wrap gap-1.5">
                          {c.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="cursor-default rounded-lg border border-line bg-canvas/60 px-2 py-1 text-[11px] text-fg-muted"
                              title={`Category: ${t.category}`}
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                    <Briefcase className="h-10 w-10 text-[var(--theme-text-tertiary)] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)]">No stack collections yet</p>
                    <p className="text-xs text-[var(--theme-text-tertiary)] mt-1">Create one to custom-fit database structures and frameworks.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Sub-Collections */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                    <Layers className="h-4 w-4 text-brand" />
                    Sub-collections
                  </h2>
                  <Button
                    onClick={openNewSubDialog}
                    size="sm" variant="outline" className="h-9 px-3"
                  >
                    <Plus className="h-4 w-4" />
                    New Multi-Stack
                  </Button>
                </div>

                {subCollectionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-32 animate-pulse rounded-2xl bg-elevated" />
                    ))}
                  </div>
                ) : subCollections && subCollections.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {subCollections.map((sc) => (
                      <div
                        key={sc.id}
                        className="card-interactive group relative overflow-hidden p-5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-fg">
                              {sc.name}
                            </h3>
                            <span className="inline-block border px-2 py-0.5 rounded-full text-[11px] font-medium mt-1.5 capitalize text-brand border-brand/20 bg-brand/10">
                              Multi-stack group
                            </span>
                          </div>
                          <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              onClick={() => openEditSubDialog(sc)}
                              className="p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-fg hover:bg-elevated transition-all"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSubMutation.mutate(sc.id)}
                              className="p-1.5 rounded-lg text-[var(--theme-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Combined Stack Collections list */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {sc.collections && sc.collections.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)]"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                                {c.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                    <Layers className="h-10 w-10 text-[var(--theme-text-tertiary)] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[var(--theme-text-secondary)]">No sub-collections yet</p>
                    <p className="text-xs text-[var(--theme-text-tertiary)] mt-1">Combine multiple stacks (e.g. Frontend Stack + Backend Stack) into a single grouped set.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ── Dialog: Collection Create/Edit ────────────────────────────── */}
      <Dialog open={isCollectionOpen} onOpenChange={setIsCollectionOpen}>
        <DialogContent className="mx-4 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <FolderOpen className="h-5 w-5 text-[var(--theme-accent-1)]" />
              {editingCollectionId ? "Edit Tech Stack Collection" : "New Tech Stack Collection"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--theme-text-secondary)]">
              Specify the stack name, type, and add custom technology tags.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCollectionSubmit} className="space-y-5 mt-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stack Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-fg-muted">
                  Stack Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Next.js Core"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="bg-[var(--theme-background-tertiary)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                  required
                />
              </div>

              {/* Stack Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-fg-muted">
                  Stack Type
                </label>
                <select
                  value={collectionType}
                  onChange={(e) => setCollectionType(e.target.value as CollectionType)}
                  className="w-full h-10 px-3 bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl outline-none text-sm cursor-pointer"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="data">Data Analysis / Database</option>
                  <option value="custom">Custom Stack</option>
                </select>
              </div>
            </div>

            {/* Technologies list */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-fg-muted flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Stack Technologies
              </label>

              {/* Interactive add box */}
              <div className="flex gap-2 p-3 bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] rounded-2xl">
                <Input
                  type="text"
                  placeholder="Tech name (e.g. React, FastApi)"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechItem();
                    }
                  }}
                  className="h-9 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg flex-1 text-xs"
                />

                <select
                  value={newTechCategory}
                  onChange={(e) => setNewTechCategory(e.target.value)}
                  className="h-9 px-2 bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-lg outline-none text-xs cursor-pointer min-w-[100px]"
                >
                  <option value="Framework">Framework</option>
                  <option value="Library">Library</option>
                  <option value="Database">Database</option>
                  <option value="Language">Language</option>
                  <option value="Styling">Styling</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Other">Other</option>
                </select>

                <Button
                  type="button"
                  onClick={addTechItem}
                  className="h-9 px-3 bg-[var(--theme-accent-1)] hover:brightness-110 text-[var(--theme-accent-text)] rounded-lg text-xs"
                >
                  Add
                </Button>
              </div>

              {/* Tags grid display */}
              <div className="flex flex-wrap gap-1.5 p-3 min-h-[60px] bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] rounded-2xl max-h-[140px] overflow-y-auto">
                {techList.length > 0 ? (
                  techList.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-[var(--theme-background)] text-[var(--theme-text)] border border-[var(--theme-border)]"
                    >
                      <span>{t.name}</span>
                      <span className="text-[9px] text-[var(--theme-text-tertiary)]">({t.category})</span>
                      <button
                        type="button"
                        onClick={() => removeTechItem(idx)}
                        className="text-[var(--theme-text-tertiary)] hover:text-red-400 ml-0.5 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--theme-text-tertiary)] italic p-1">No technology tags added yet...</span>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeCollectionDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveCollectionMutation.isPending}
                className="px-5"
              >
                {saveCollectionMutation.isPending ? "Saving..." : "Save Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Sub-Collection Create/Edit ─────────────────────────── */}
      <Dialog open={isSubCollectionOpen} onOpenChange={setIsSubCollectionOpen}>
        <DialogContent className="mx-4 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Layers className="h-5 w-5 text-brand" />
              {editingSubId ? "Edit Multi-Stack Group" : "New Multi-Stack Group"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--theme-text-secondary)]">
              Name this combined stack configuration and choose which collections are included.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubSubmit} className="space-y-5 mt-4">

            {/* Sub-Collection Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-fg-muted">
                Multi-Stack Group Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Full Stack (React + FastAPI)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="bg-[var(--theme-background-tertiary)] border-[var(--theme-border)] text-[var(--theme-text)] rounded-xl"
                required
              />
            </div>

            {/* Selection list */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-fg-muted">
                Select Collections to Include
              </label>

              <div className="bg-[var(--theme-background-tertiary)] border border-[var(--theme-border)] rounded-2xl p-4 max-h-[180px] overflow-y-auto space-y-2">
                {collections && collections.length > 0 ? (
                  collections.map((c) => {
                    const isSelected = selectedCollectionIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCollectionSelection(c.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-canvas border-brand/50 text-fg"
                            : "bg-transparent border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-background)]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getTypeColor(c.type)}`}>
                            {c.type}
                          </span>
                          <span className="text-xs font-bold">{c.name}</span>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-brand" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-[var(--theme-text-tertiary)] italic py-2 text-center">
                    No stack collections available. Create a collection first!
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeSubDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveSubMutation.isPending}
                className="px-5"
              >
                {saveSubMutation.isPending ? "Saving..." : "Save Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
