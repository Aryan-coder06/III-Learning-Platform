import Link from "next/link";

export function CtaSection() {
  return (
    <section className="bg-accent text-white">
      <div className="section-shell grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 pb-4 sm:p-12 lg:p-16 xl:p-24">
          <h2 className="font-[var(--font-display)] text-5xl font-bold uppercase leading-[0.85] tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            Ready to Sync Your Study Workflow?
          </h2>
        </div>

        <div className="flex flex-col justify-center p-8 pt-4 sm:p-12 lg:p-16 xl:p-24">
          <p className="mb-8 max-w-xl text-lg leading-tight text-white/88 sm:mb-12 sm:text-xl md:text-2xl lg:text-3xl">
            Start with the mocked product flow now and keep this shell ready for the
            realtime backend, room APIs, uploads, and AI-assisted collaboration later.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center bg-black px-10 text-base font-medium uppercase tracking-[0.18em] text-white hover:bg-white hover:text-black sm:h-16 sm:text-lg md:h-20 md:text-xl"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-14 items-center justify-center border-[3px] border-white bg-transparent px-10 text-base font-medium uppercase tracking-[0.18em] text-white hover:bg-white hover:text-accent sm:h-16 sm:text-lg md:h-20 md:text-xl"
            >
              Preview Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
