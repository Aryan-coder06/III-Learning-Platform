import { Plus } from "lucide-react";

import { testimonials } from "@/lib/mock/landing";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-b-[4px] border-foreground bg-background py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-20 text-center">
          <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-8xl">
            Early Feedback
          </h2>
          <p className="mx-auto mt-5 max-w-4xl text-lg leading-relaxed text-foreground/60 md:text-2xl">
            Tasteful placeholder proof points for demo day, styled with the same
            strong Swiss grid and hover treatment as the rest of the page.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border-[4px] border-foreground bg-foreground lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group swiss-card-hover flex min-h-[340px] flex-col justify-between bg-background p-10 transition-colors duration-300 hover:bg-accent hover:text-white"
            >
              <div className="mb-10 flex items-start justify-between">
                <span className="text-xl font-black opacity-30 transition-opacity group-hover:opacity-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Plus className="h-8 w-8 text-accent transition-colors group-hover:text-white" />
              </div>

              <div>
                <p className="swiss-copy-fade text-xl leading-relaxed text-foreground/70 transition-colors duration-300">
                  “{testimonial.quote}”
                </p>
                <div className="mt-10">
                  <p className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
                    {testimonial.name}
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-accent transition-colors duration-300 group-hover:text-white/80">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
