import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface Job {
    repository: string;
    description: string;
    jobPage: string;
    tags: string[];
    language: string;
}

export async function getJobs(): Promise<Job[]> {
    const filePath = path.join(process.cwd(), 'repos.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
            // Map CSV headers to interface keys
            const headerMap: Record<string, string> = {
                'Repository': 'repository',
                'Description': 'description',
                'Job Page': 'jobPage',
                'Tags': 'tags',
                'Language': 'language'
            };
            return headerMap[header] || header;
        }
    });

    return data.map((job: any) => ({
        ...job,
        tags: job.tags ? job.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        language: job.language || ''
    })) as Job[];
}
