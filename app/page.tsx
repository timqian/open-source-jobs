import { getJobs } from "@/lib/csv";
import { JobList } from "@/components/job-list";
import { BackgroundGrid } from "@/components/background-grid";

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className="relative min-h-screen font-sans text-zinc-900 dark:text-zinc-100">
      <BackgroundGrid />
      <main className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Open Source Jobs</h1>
          <a
            href="https://github.com/timqian/open-source-jobs/blob/main/repos.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Edit
          </a>
        </div>

        <div className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          <p>
            A list of companies that hire for open source roles.
          </p>
        </div>

        <JobList jobs={jobs} />
      </main>
    </div>
  );
}
