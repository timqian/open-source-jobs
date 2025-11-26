const fs = require('fs');
const path = require('path');

// 读取 repos.csv
const csvPath = path.join(__dirname, 'repos.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// 解析 CSV（简单解析，处理引号内的逗号）
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

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

// 解析所有行
const lines = csvContent.split('\n').map(line => line.replace(/\r$/, ''));
const headers = parseCSVLine(lines[0]);

// 找到需要的列的索引
const repoIndex = headers.indexOf('Repository');
const companyNameIndex = headers.indexOf('Company Name');
const companyUrlIndex = headers.indexOf('Company URL');
const descIndex = headers.indexOf('Description');
const careerUrlIndex = headers.indexOf('Career URL');

// 收集所有数据行
const rows = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // 跳过空行

    const columns = parseCSVLine(line);
    const repo = columns[repoIndex] || '';
    const companyName = columns[companyNameIndex] || '';
    const companyUrl = columns[companyUrlIndex] || '';
    const desc = columns[descIndex] || '';
    const careerUrl = columns[careerUrlIndex] || '';

    rows.push({
        repo,
        companyName,
        companyUrl,
        desc,
        careerUrl
    });
}

// 按照公司名称字母顺序排序
rows.sort((a, b) => a.companyName.localeCompare(b.companyName));

// 生成 Markdown 表格
let markdownTable = '\n## Job List\n\n';
markdownTable += '> Note: This list is generated automatically. Please do not edit it manually. Visit https://open-source-jobs.com to filter/submit jobs.\n\n';
markdownTable += '| Company | Repository | Job Page |\n';
markdownTable += '|---------|------------|----------|\n';

// 生成表格行
for (const row of rows) {
    // Company 列：公司名称链接
    const companyLink = `[${row.companyName}](${row.companyUrl})`;

    // Repository 列：仓库链接 + star badge + 描述
    const repoUrl = row.repo.includes('http') ? row.repo : `https://github.com/${row.repo}`;
    const repoLink = `[${row.repo}](${repoUrl})`;
    const starBadge = `![Stars](https://img.shields.io/github/stars/${row.repo}?style=social&label=%20)`;

    // 使用 <br> 在同一单元格内换行
    const repoContent = `${repoLink} ${starBadge}<br>${row.desc}`;

    // Job Page 列
    const jobLink = row.careerUrl ? `[Apply](${row.careerUrl})` : '';

    markdownTable += `| ${companyLink} | ${repoContent} | ${jobLink} |\n`;
}

// 读取现有的 README
const readmePath = path.join(__dirname, 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// 移除旧的 Job List 部分（如果存在）
const jobListStart = readmeContent.indexOf('## Job List');
if (jobListStart !== -1) {
    readmeContent = readmeContent.substring(0, jobListStart).trim();
}

// 追加新的表格
readmeContent += markdownTable;

// 写入 README
fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log('✅ README.md updated with job list!');
console.log(`📊 Added ${lines.length - 1} jobs`);
