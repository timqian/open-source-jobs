const fs = require('fs');
const path = require('path');

// -----------------------------
// File Paths
// -----------------------------
const csvPath = path.join(__dirname, '..', 'repos.csv');
const readmePath = path.join(__dirname, '..', 'README.md');

// -----------------------------
// CSV Reader (safer parsing)
// -----------------------------
function parseCSV(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const headers = splitCSVLine(lines[0]);

    const getIndex = (name) => headers.indexOf(name);

    const repoIndex = getIndex('Repository');
    const companyNameIndex = getIndex('Company Name');
    const companyUrlIndex = getIndex('Company URL');
    const descIndex = getIndex('Description');
    const careerUrlIndex = getIndex('Career URL');

    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i]);

        const repo = cols[repoIndex] || '';
        const companyName = cols[companyNameIndex] || 'Unknown';
        const companyUrl = cols[companyUrlIndex] || '#';
        const desc = cols[descIndex] || '';
        const careerUrl = cols[careerUrlIndex] || '';

        if (!repo) continue;

        rows.push({
            repo: repo.trim(),
            companyName: companyName.trim(),
            companyUrl: companyUrl.trim(),
            desc: desc.trim(),
            careerUrl: careerUrl.trim()
        });
    }

    return rows;
}

// -----------------------------
// CSV line splitter (robust)
// -----------------------------
function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// -----------------------------
// Normalize GitHub repo URL
// -----------------------------
function normalizeRepo(repo) {
    if (!repo) return '';
    return repo.includes('github.com')
        ? repo
        : `https://github.com/${repo}`;
}

// -----------------------------
// Generate Markdown Table
// -----------------------------
function generateMarkdown(rows) {
    rows.sort((a, b) =>
        (a.companyName || '').localeCompare(b.companyName || '')
    );

    let table = `\n## Job List\n\n`;
    table += `> **Auto-generated list** | [Better view](https://open-source-jobs.com) | [Edit CSV](repos.csv) | [Add repo](https://github.com/timqian/open-source-jobs/issues/new?template=new-repository.yml)\n\n`;

    table += `| Company | Repository | Job Page |\n`;
    table += `|---------|------------|----------|\n`;

    for (const row of rows) {
        const company = `[${escapeMd(row.companyName)}](${row.companyUrl || '#'})`;

        const repoUrl = normalizeRepo(row.repo);
        const repoLink = `[${row.repo}](${repoUrl})`;

        const starBadge = `![Stars](https://img.shields.io/github/stars/${row.repo}?style=social&label=%20)`;

        const repoCell = `${repoLink} ${starBadge}<br>${escapeMd(row.desc)}`;

        const jobCell = row.careerUrl
            ? `[Apply](${row.careerUrl})`
            : '';

        table += `| ${company} | ${repoCell} | ${jobCell} |\n`;
    }

    return table;
}

// -----------------------------
// Markdown safety
// -----------------------------
function escapeMd(text) {
    if (!text) return '';
    return text.replace(/\|/g, '\\|');
}

// -----------------------------
// Smart README replacement
// -----------------------------
function updateReadme(readme, newTable) {
    const marker = '## Job List';

    const index = readme.indexOf(marker);

    if (index === -1) {
        return readme.trim() + '\n' + newTable;
    }

    const before = readme.substring(0, index).trim();

    return before + '\n' + newTable;
}

// -----------------------------
// Main Execution
// -----------------------------
function main() {
    try {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const rows = parseCSV(csvContent);

        const markdownTable = generateMarkdown(rows);

        let readmeContent = fs.readFileSync(readmePath, 'utf8');
        readmeContent = updateReadme(readmeContent, markdownTable);

        fs.writeFileSync(readmePath, readmeContent, 'utf8');

        console.log('README.md updated successfully!');
        console.log(`Total jobs processed: ${rows.length}`);
    } catch (err) {
        console.error('Error updating README:', err);
        process.exit(1);
    }
}

main();
