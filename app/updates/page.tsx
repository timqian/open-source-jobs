import { Nav } from "@/components/nav";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Updates - Open Source Jobs",
  description: "Recent job updates and new repositories added to Open Source Jobs",
  openGraph: {
    title: "Updates - Open Source Jobs",
    description: "Recent job updates and new repositories added to Open Source Jobs",
    url: "https://open-source-jobs.com/updates",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Updates - Open Source Jobs",
    description: "Recent job updates and new repositories added to Open Source Jobs",
  },
};

interface RepoChange {
  repository: string;
  companyName: string;
  companyUrl: string;
  careerUrl: string;
  tags: string;
  language: string;
  description: string;
}

interface Update {
  id: string;
  type: "commit" | "release" | "repo-update";
  title: string;
  message: string;
  date: string;
  html_url: string;
  author: {
    login: string;
    email?: string;
    avatar_url: string | null;
    html_url: string | null;
  };
  tag_name?: string;
  changes?: {
    added: RepoChange[];
    removed: RepoChange[];
  };
}

async function getUpdates(): Promise<Update[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "updates.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading updates:", error);
    return [];
  }
}

export default async function UpdatesPage() {
  const updates = await getUpdates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <Nav />

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-400 dark:to-zinc-100 bg-clip-text text-transparent mb-4">
            Updates
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Recent job updates
          </p>
        </div>

        {/* Updates List */}
        <main className="pb-20">
          {updates.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No updates available yet.
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6"
                >
                  {/* Metadata - Weakened */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-4">
                    <time>
                      {new Date(update.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span>{update.author.login}</span>
                    {update.changes && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          {update.changes.added.length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                              +{update.changes.added.length}
                            </span>
                          )}
                          {update.changes.removed.length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                              -{update.changes.removed.length}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    <a
                      href={update.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
                    >
                      View commit →
                    </a>
                  </div>

                  {/* Repository Changes - Highlighted */}
                  {update.changes && (
                    <div className="space-y-6">
                      {/* Added repos */}
                      {update.changes.added.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Added {update.changes.added.length} {update.changes.added.length === 1 ? 'repository' : 'repositories'}
                          </div>
                          <div className="grid gap-4">
                            {update.changes.added.map((repo, idx) => (
                              <div
                                key={idx}
                                className="border border-green-200 dark:border-green-900/50 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20"
                              >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <a
                                        href={`https://github.com/${repo.repository}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-base text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                                      >
                                        {repo.repository}
                                      </a>
                                      <img
                                        src={`https://img.shields.io/github/stars/${repo.repository}?style=social&label=%20`}
                                        alt="Stars"
                                        className="h-5"
                                      />
                                    </div>
                                    {repo.description && (
                                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                        {repo.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                      {repo.companyName && (
                                        <a
                                          href={repo.companyUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                          </svg>
                                          {repo.companyName}
                                        </a>
                                      )}
                                      {repo.language && (
                                        <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                          {repo.language}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {repo.careerUrl && (
                                    <a
                                      href={repo.careerUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
                                    >
                                      Apply
                                    </a>
                                  )}
                                </div>
                                {repo.tags && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {repo.tags.split(',').slice(0, 8).map((tag, tagIdx) => (
                                      <span
                                        key={tagIdx}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed repos */}
                      {update.changes.removed.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Removed {update.changes.removed.length} {update.changes.removed.length === 1 ? 'repository' : 'repositories'}
                          </div>
                          <div className="space-y-2">
                            {update.changes.removed.slice(0, 5).map((repo, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-zinc-500 dark:text-zinc-400 pl-4 border-l-2 border-red-300 dark:border-red-800 opacity-75"
                              >
                                <span className="line-through">{repo.repository}</span>
                                {repo.companyName && (
                                  <span className="text-zinc-400 dark:text-zinc-500">
                                    {" "}({repo.companyName})
                                  </span>
                                )}
                              </div>
                            ))}
                            {update.changes.removed.length > 5 && (
                              <div className="text-xs text-zinc-400 dark:text-zinc-500 pl-4">
                                ... and {update.changes.removed.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
