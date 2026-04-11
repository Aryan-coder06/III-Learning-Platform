import { workflowSteps } from "@/lib/mock/landing";

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-b-[4px] border-foreground bg-black text-white">
      <div className="section-shell py-24 md:py-32">
        <span className="mb-4 block text-xl font-black uppercase tracking-[0.28em] text-accent">
          03. Method
        </span>
        <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.85] tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem]">
          How StudySync Works
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-px border border-white/20 bg-white/15 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              className="group relative min-h-[360px] bg-black p-10 transition-transform duration-300 hover:-translate-y-2"
            >
              <span className="absolute left-10 top-10 font-[var(--font-display)] text-[5.6rem] font-bold tracking-[-0.08em] text-white/8 transition-colors duration-300 group-hover:text-white/14">
                {step.step.replace(/^0/, "")}
              </span>

              <div className="relative mt-32">
                <div className="mb-8 h-20 w-1.5 bg-accent transition-transform duration-300 group-hover:scale-y-110" />
                <h3 className="font-[var(--font-display)] text-3xl font-bold uppercase tracking-[-0.05em]">
                  {step.title}
                </h3>
                <p className="mt-6 max-w-xs text-xl leading-relaxed text-white/70">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
