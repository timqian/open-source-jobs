"use client";

import { Job } from "@/lib/csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const languages = useMemo(() => {
    const langs = new Set(jobs.map((job) => job.language).filter(Boolean));
    return Array.from(langs).sort();
  }, [jobs]);

  const tags = useMemo(() => {
    const t = new Set(jobs.flatMap((job) => job.tags));
    return Array.from(t).sort();
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    if (selectedLanguage && selectedLanguage !== "all") {
      result = result.filter((job) => job.language === selectedLanguage);
    }

    if (selectedTag && selectedTag !== "all") {
      result = result.filter((job) => job.tags.includes(selectedTag));
    }

    result.sort((a, b) => {
      const repoA = a.repository.split("/")[1] || a.repository;
      const repoB = b.repository.split("/")[1] || b.repository;
      return repoA.localeCompare(repoB);
    });

    return result;
  }, [jobs, selectedLanguage, selectedTag]);


  return (
    <div className="w-full space-y-6">
      {/* Filters Section */}
      <div className="">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div> */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              All Repositories
            </h2>
            <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {filteredAndSortedJobs.length}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Repository</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Job Page</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedJobs.map((job) => {
            const [org, repo] = job.repository.split("/");
            return (
              <TableRow key={job.repository}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://github.com/${job.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base hover:underline"
                    >
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {org}/
                      </span>
                      <span className="font-semibold">{repo}</span>
                    </a>
                    <img
                      src={`https://img.shields.io/github/stars/${job.repository}.svg?style=social&label=%20`}
                      alt={`${job.repository} stars`}
                      className="h-5"
                    />
                  </div>
                </TableCell>
                <TableCell>{job.description}</TableCell>
                <TableCell>
                  {job.language && (
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30">
                      {job.language}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={job.jobPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Apply
                  </a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-8 text-center">
        <a
          href="https://github.com/timqian/open-source-jobs/blob/main/repos.csv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Edit on GitHub
        </a>
      </div>
    </div>
  );
}
