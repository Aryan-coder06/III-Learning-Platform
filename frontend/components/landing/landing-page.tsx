import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { PreviewSection } from "@/components/landing/preview-section";
import { StatsStrip } from "@/components/landing/stats-strip";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WhySection } from "@/components/landing/why-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { SiteFooter } from "@/components/shared/site-footer";

export function LandingPage() {
  return (
    <div className="page-noise min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsStrip />
        <PreviewSection />
        <FeaturesSection />
        <WhySection />
        <WorkflowSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
