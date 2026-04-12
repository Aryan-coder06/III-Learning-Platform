"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/components/shared/workspace-section-heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, LoaderCircle } from "lucide-react";
import { recentFiles } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";
import { uploadUserFileApi } from "@/lib/api/user";
import { useAuthStore } from "@/lib/auth/auth-store";

interface DocumentsViewProps {
  className?: string;
}

export function DocumentsView({ className }: DocumentsViewProps) {
  const user = useAuthStore((state) => state.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
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
          {recentFiles.map((file) => (
            <div
              key={file.name}
              className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Uploaded by {file.uploader} in {file.room}
                </p>
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {file.date}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
