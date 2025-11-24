import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const GITHUB_API_BASE = 'https://api.github.com/repos';

interface RepoData {
    Repository: string;
    Description: string;
    'Job Page': string;
    Tags?: string;
    Language?: string;
}

async function fetchRepoData(repo: string): Promise<{ topics: string[]; language: string; description: string }> {
    try {
        const headers: HeadersInit = {
            'User-Agent': 'open-source-jobs-updater',
            'Accept': 'application/vnd.github.mercy-preview+json' // For topics
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(`${GITHUB_API_BASE}/${repo}`, { headers });

        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`Rate limit exceeded or forbidden for ${repo}. Status: ${response.status}`);
                // Return empty data to continue processing other repos or partial data
                return { topics: [], language: '', description: '' };
            }
            if (response.status === 404) {
                console.warn(`Repo not found: ${repo}`);
                return { topics: [], language: '', description: '' };
            }
            throw new Error(`Failed to fetch ${repo}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            topics: data.topics || [],
            language: data.language || '',
            description: data.description || ''
        };
    } catch (error) {
        console.error(`Error fetching ${repo}:`, error);
        return { topics: [], language: '', description: '' };
    }
}

async function main() {
    const csvPath = path.join(process.cwd(), 'repos.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const { data, meta } = Papa.parse<RepoData>(csvContent, {
        header: true,
        skipEmptyLines: true
    });

    const updatedData: RepoData[] = [];

    console.log(`Processing ${data.length} repositories...`);

    for (const [index, row] of data.entries()) {
        const repo = row.Repository;
        if (!repo) continue;

        console.log(`[${index + 1}/${data.length}] Fetching data for ${repo}...`);

        // Add a small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500));

        const { topics, language, description } = await fetchRepoData(repo);

        updatedData.push({
            ...row,
            Description: description || row.Description, // Keep original if fetch fails or is empty
            Tags: topics.join(', '),
            Language: language
        });
    }

    const newCsv = Papa.unparse(updatedData, {
        columns: ['Repository', 'Description', 'Job Page', 'Tags', 'Language']
    });

    fs.writeFileSync(csvPath, newCsv);
    console.log('Successfully updated repos.csv with Tags and Language.');
}

main().catch(console.error);
