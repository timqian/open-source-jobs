import { getJobs } from "@/lib/csv";
import { JobList } from "@/components/job-list";
import { PostJobModal } from "@/components/post-job-modal";
import { Nav } from "@/components/nav";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const jobs = await getJobs();
  const jobCount = jobs.length;
  const uniqueCompanies = new Set(jobs.map(job => job.companyName)).size;
  const topLanguages = jobs
    .filter(job => job.language)
    .reduce((acc, job) => {
      acc[job.language] = (acc[job.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const topThreeLanguages = Object.entries(topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang);

  const description = `Discover ${jobCount} open source job opportunities from ${uniqueCompanies} companies building with ${topThreeLanguages.join(", ")} and more.`;

  return {
    title: "Open Source Jobs",
    description,
    openGraph: {
      title: "Open Source Jobs",
      description,
      url: "https://open-source-jobs.com",
      siteName: "Open Source Jobs",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Open Source Jobs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Source Jobs",
      description,
      images: ["/og-image.svg"],
    },
  };
}

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
      <Nav />

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
