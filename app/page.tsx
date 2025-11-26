import { getJobs } from "@/lib/csv";
import { JobList } from "@/components/job-list";
import { PostJobModal } from "@/components/post-job-modal";
import Image from "next/image";

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-13">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 text-lg font-semibold hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
                <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="w-8 h-8" unoptimized />
                {/* Open Source Jobs */}
              </a>

            </div>
            <a
              href="https://github.com/timqian/open-source-jobs"
            >
              <img
                src="https://img.shields.io/github/stars/timqian/open-source-jobs?style=social&label=Star"
                alt="GitHub stars"
                className="h-6"
              />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center mb-6 flex flex-col gap-4">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-400 dark:to-zinc-100 bg-clip-text text-transparent animate-fade-in">
            Open Source Jobs
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto animate-fade-in">
            List of Open Source projects offering jobs.
          </p>

          <div className="flex justify-center">
            <PostJobModal />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
        <JobList jobs={jobs} />
      </main>
    </div>
  );
}
