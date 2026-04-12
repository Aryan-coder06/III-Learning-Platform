import { WorkspaceShell } from "@/components/shared/workspace-shell";
import { SkillShareView } from "@/components/skill-share/skill-share-view";

export default function SkillSharePage() {
  return (
    <WorkspaceShell
      title="Skill Share"
      description="Post topics you want to teach or learn. RSVP for upcoming group sessions."
    >
      <SkillShareView />
    </WorkspaceShell>
  );
}
