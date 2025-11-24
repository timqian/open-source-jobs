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
        <div className="w-full space-y-4">
            <div className="flex gap-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[180px]">
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Repository</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Description</TableHead>
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
                                <TableCell>{job.description}</TableCell>
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
        </div>
    );
}
