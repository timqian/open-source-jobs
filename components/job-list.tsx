import { Job } from "@/lib/csv";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface JobListProps {
    jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Repository</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Job Page</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.map((job) => (
                        <TableRow key={job.repository}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={`https://github.com/${job.repository}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold hover:underline text-base"
                                        >
                                            {job.repository}
                                        </a>
                                        <img
                                            src={`https://img.shields.io/github/stars/${job.repository}.svg?style=social&label=%20`}
                                            alt={`${job.repository} stars`}
                                            className="h-5"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {job.language && (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {job.language}
                                            </span>
                                        )}
                                        {job.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
