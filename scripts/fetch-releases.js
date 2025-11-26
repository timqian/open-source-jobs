const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

async function fetchRepoUpdates() {
  console.log('Fetching repos.csv change history...');

  try {
    // Only show updates from this commit onwards (inclusive)
    const START_COMMIT = 'a23a2f9288f11d627061a7c13d29d21f1ed6b776';

    // Get git log for repos.csv file only, starting from START_COMMIT
    const gitLog = execSync(
      `git log --follow --pretty=format:"%H|%an|%ae|%at|%s" ${START_COMMIT}^..HEAD -- repos.csv`,
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    );

    if (!gitLog.trim()) {
      console.log('No git history found for repos.csv');
      return [];
    }

    const commits = gitLog.trim().split('\n');
    console.log(`Found ${commits.length} commits that modified repos.csv`);

    const updateData = [];

    for (const commitLine of commits) {
      const [hash, author, email, timestamp, ...messageParts] = commitLine.split('|');
      const message = messageParts.join('|');

      try {
        // Get the diff for this commit
        const diff = execSync(
          `git show ${hash} -- repos.csv`,
          { encoding: 'utf8', cwd: path.join(__dirname, '..') }
        );

        // Parse added lines (lines starting with +, but not +++)
        const addedLines = diff
          .split('\n')
          .filter(line => line.startsWith('+') && !line.startsWith('+++'))
          .map(line => line.substring(1).trim())
          .filter(line => line && !line.startsWith('Repository,'));

        // Parse removed lines (lines starting with -, but not ---)
        const removedLines = diff
          .split('\n')
          .filter(line => line.startsWith('-') && !line.startsWith('---'))
          .map(line => line.substring(1).trim())
          .filter(line => line && !line.startsWith('Repository,'));

        // Extract repository info from added lines
        const addedRepos = addedLines.map(line => {
          try {
            const columns = parseCSVLine(line);
            return {
              repository: columns[0] || '',
              companyName: columns[1] || '',
              companyUrl: columns[2] || '',
              careerUrl: columns[3] || '',
              tags: columns[4] || '',
              language: columns[5] || '',
              description: columns[6] || ''
            };
          } catch (e) {
            return null;
          }
        }).filter(repo => repo && repo.repository);

        // Extract repository info from removed lines
        const removedRepos = removedLines.map(line => {
          try {
            const columns = parseCSVLine(line);
            return {
              repository: columns[0] || '',
              companyName: columns[1] || '',
              companyUrl: columns[2] || '',
              careerUrl: columns[3] || '',
              tags: columns[4] || '',
              language: columns[5] || '',
              description: columns[6] || ''
            };
          } catch (e) {
            return null;
          }
        }).filter(repo => repo && repo.repository);

        if (addedRepos.length > 0 || removedRepos.length > 0) {
          updateData.push({
            id: hash,
            type: 'repo-update',
            title: message,
            message: message,
            date: new Date(parseInt(timestamp) * 1000).toISOString(),
            html_url: `https://github.com/timqian/open-source-jobs/commit/${hash}`,
            author: {
              login: author,
              email: email,
              avatar_url: null,
              html_url: null
            },
            changes: {
              added: addedRepos,
              removed: removedRepos
            }
          });
        }
      } catch (error) {
        console.warn(`Warning: Could not process commit ${hash.substring(0, 7)}`);
      }
    }

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'updates.json');

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(updateData, null, 2), 'utf8');

    console.log(`✅ Update data saved to ${outputPath}`);
    console.log(`📊 Total repo updates: ${updateData.length}`);

    // Show first 5 updates as preview
    if (updateData.length > 0) {
      console.log('\n📦 Most recent updates:');
      updateData.slice(0, 5).forEach(update => {
        const addedCount = update.changes.added.length;
        const removedCount = update.changes.removed.length;
        const changesSummary = [];
        if (addedCount > 0) changesSummary.push(`+${addedCount} repos`);
        if (removedCount > 0) changesSummary.push(`-${removedCount} repos`);
        console.log(`  - ${update.title.substring(0, 50)}${update.title.length > 50 ? '...' : ''}`);
        console.log(`    ${changesSummary.join(', ')} (${new Date(update.date).toLocaleDateString()})`);
      });
    }

    // Generate RSS feed
    console.log('\n📡 Generating RSS feed...');
    generateRSS(updateData);

  } catch (error) {
    console.error('❌ Error fetching updates:', error.message);
    process.exit(1);
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSS(updates) {
  try {
    const siteUrl = 'https://open-source-jobs.com';
    const rssUrl = `${siteUrl}/rss.xml`;

    // Start RSS feed
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Open Source Jobs - Updates</title>
    <link>${siteUrl}</link>
    <description>Latest job opportunities from open source projects</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml" />
`;

    // Add items
    updates.forEach(update => {
      const title = escapeXml(update.title);
      const link = escapeXml(update.html_url);
      const pubDate = new Date(update.date).toUTCString();
      const guid = update.id;

      // Build description from repo changes
      let description = '';

      if (update.changes) {
        if (update.changes.added.length > 0) {
          description += `<h3>Added ${update.changes.added.length} ${update.changes.added.length === 1 ? 'repository' : 'repositories'}:</h3><ul>`;

          update.changes.added.forEach(repo => {
            const repoUrl = `https://github.com/${repo.repository}`;
            description += `<li>`;
            description += `<strong><a href="${escapeXml(repoUrl)}">${escapeXml(repo.repository)}</a></strong>`;
            if (repo.companyName) {
              description += ` by ${escapeXml(repo.companyName)}`;
            }
            if (repo.description) {
              description += `<br/>${escapeXml(repo.description)}`;
            }
            if (repo.careerUrl) {
              description += `<br/><a href="${escapeXml(repo.careerUrl)}">Apply for job</a>`;
            }
            description += `</li>`;
          });

          description += '</ul>';
        }

        if (update.changes.removed.length > 0) {
          description += `<p>Removed ${update.changes.removed.length} ${update.changes.removed.length === 1 ? 'repository' : 'repositories'}</p>`;
        }
      }

      rss += `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
    });

    // Close RSS feed
    rss += `
  </channel>
</rss>`;

    // Write to public directory
    const outputPath = path.join(__dirname, '..', 'public', 'rss.xml');
    fs.writeFileSync(outputPath, rss, 'utf8');

    console.log(`✅ RSS feed generated at ${outputPath}`);
    console.log(`📊 Total RSS items: ${updates.length}`);

  } catch (error) {
    console.error('❌ Error generating RSS:', error.message);
    throw error;
  }
}

fetchRepoUpdates();
