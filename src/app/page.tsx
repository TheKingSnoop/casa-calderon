import { siteConfig } from "@/lib/site";

// Placeholder home page for M1. Replaced by the collective page in M3.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        {siteConfig.description}
      </p>
      <p className="text-sm uppercase tracking-widest text-zinc-500">
        Coming soon
      </p>
    </main>
  );
}
