"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, LoaderCircle, FileText, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadUserFileApi, getUserApi, type UserFile } from "@/lib/api/user";
import { useAuthStore } from "@/lib/auth/auth-store";

interface DocumentsViewProps {
  className?: string;
}

export function DocumentsView({ className }: DocumentsViewProps) {
  const user = useAuthStore((state) => state.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUserDocuments = useCallback(async () => {
    if (!user?.mongoId) return;

    setLoading(true);
    try {
      const userData = await getUserApi(user.mongoId);
      if (userData && userData.files) {
        setFiles(userData.files);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [user?.mongoId]);

  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    if (!user?.mongoId) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await uploadUserFileApi(user.mongoId, selectedFile);
      setSuccess("File uploaded successfully.");
      setSelectedFile(null);
      // Refresh the file list
      fetchUserDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="p-4 flex flex-col gap-4">
        <WorkspaceSectionHeading
          title="Personal Documents"
          description="Upload personal files for quick access and sharing."
        />

        <div className="flex flex-col gap-3 sm:flex-row items-center border border-border/70 p-3 rounded-[1.35rem] bg-secondary/20">
          <Input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
          />
          <Button variant="dark" onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

        <div className="space-y-3 mt-2">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length > 0 ? (
            files.map((file, index) => (
              <div
                key={file.url || file.file_path || index}
                className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4 md:grid-cols-[1fr_auto]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground line-clamp-1">{file.name || file.filename || "Untitled File"}</p>
                    <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
                      {file.format || file.mime_type || "FILE"} • {(file.bytes ? (file.bytes / 1024).toFixed(1) : (file.size ? (file.size / 1024).toFixed(1) : 0))} KB
                    </p>
                    <div className="mt-2 flex gap-3">
                      <a
                        href={file.url || file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                      <a
                        href={file.url || file.file_path}
                        download={file.name || file.filename}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground self-center">
                  {formatDate(file.uploadedAt || file.upload_time || file.date)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 border border-dashed border-border/70 rounded-[1.35rem] bg-secondary/10">
              <p className="text-muted-foreground">No documents uploaded yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
