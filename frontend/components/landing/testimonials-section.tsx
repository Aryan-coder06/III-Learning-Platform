import { Quote } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/lib/mock/landing";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-b-2 border-foreground/90 py-16 md:py-20">
      <div className="section-shell space-y-10">
        <SectionHeading
          kicker="Social proof"
          title="Early feedback from student collaboration teams"
          description="The content is placeholder-safe, but the presentation is polished for a hackathon demo and product narrative."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card">
              <CardContent className="space-y-6 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Quote className="h-5 w-5" />
                </div>
                <p className="text-lg leading-8 text-muted-foreground">
                  “{testimonial.quote}”
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
