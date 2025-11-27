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

    updates.forEach(update => {
      const title = escapeXml(update.title);
      const link = escapeXml(update.html_url);
      const pubDate = new Date(update.date).toUTCString();
      const guid = update.id;

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

    rss += `
  </channel>
</rss>`;

    const outputPath = path.join(__dirname, '..', 'public', 'rss.xml');
    fs.writeFileSync(outputPath, rss, 'utf8');

    console.log(`✅ RSS feed generated`);
  } catch (error) {
    console.error('❌ Error generating RSS:', error.message);
    throw error;
  }
}

async function generateUpdateFromDiff() {
  console.log('Generating update from repos.csv diff...');

  try {
    const rootDir = path.join(__dirname, '..');

    // Determine what to compare
    // In GitHub Actions PR: compare base branch with HEAD
    // In GitHub Actions push: compare HEAD~1 with HEAD
    // Locally: compare HEAD~1 with HEAD
    const baseBranch = process.env.GITHUB_BASE_REF;
    let diffCommand;

    if (baseBranch) {
      // In a PR
      console.log(`Comparing against base branch: origin/${baseBranch}`);
      diffCommand = `git diff origin/${baseBranch}...HEAD -- repos.csv`;
    } else {
      // Direct push or local
      console.log('Comparing HEAD~1...HEAD');
      diffCommand = `git diff HEAD~1 HEAD -- repos.csv`;
    }

    const diff = execSync(diffCommand, {
      encoding: 'utf8',
      cwd: rootDir
    });

    if (!diff.trim()) {
      console.log('No changes detected in repos.csv');
      return;
    }

    // Parse added and removed lines
    const addedLines = diff
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.substring(1).trim())
      .filter(line => line && !line.startsWith('Repository,'));

    const removedLines = diff
      .split('\n')
      .filter(line => line.startsWith('-') && !line.startsWith('---'))
      .map(line => line.substring(1).trim())
      .filter(line => line && !line.startsWith('Repository,'));

    // Extract repository info
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

    // Filter out repos that appear in both added and removed
    const addedRepoNames = new Set(addedRepos.map(r => r.repository));
    const removedRepoNames = new Set(removedRepos.map(r => r.repository));

    const duplicateRepos = new Set(
      [...addedRepoNames].filter(name => removedRepoNames.has(name))
    );

    const finalAddedRepos = addedRepos.filter(r => !duplicateRepos.has(r.repository));
    const finalRemovedRepos = removedRepos.filter(r => !duplicateRepos.has(r.repository));

    if (finalAddedRepos.length === 0 && finalRemovedRepos.length === 0) {
      console.log('No new repos added or removed (only modifications detected)');
      return;
    }

    // Get current commit info
    const commitHash = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      cwd: rootDir
    }).trim();

    const commitMessage = execSync('git log -1 --pretty=%s', {
      encoding: 'utf8',
      cwd: rootDir
    }).trim();

    const commitAuthor = execSync('git log -1 --pretty=%an', {
      encoding: 'utf8',
      cwd: rootDir
    }).trim();

    const commitEmail = execSync('git log -1 --pretty=%ae', {
      encoding: 'utf8',
      cwd: rootDir
    }).trim();

    const commitTimestamp = execSync('git log -1 --pretty=%at', {
      encoding: 'utf8',
      cwd: rootDir
    }).trim();

    // Create new update entry
    const newUpdate = {
      id: commitHash,
      type: 'repo-update',
      title: commitMessage,
      message: commitMessage,
      date: new Date(parseInt(commitTimestamp) * 1000).toISOString(),
      html_url: `https://github.com/timqian/open-source-jobs/commit/${commitHash}`,
      author: {
        login: commitAuthor,
        email: commitEmail,
        avatar_url: null,
        html_url: null
      },
      changes: {
        added: finalAddedRepos,
        removed: finalRemovedRepos
      }
    };

    // Read existing updates
    const updatesPath = path.join(__dirname, '..', 'data', 'updates.json');
    let existingUpdates = [];

    if (fs.existsSync(updatesPath)) {
      try {
        existingUpdates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
      } catch (e) {
        console.log('Could not parse existing updates.json, starting fresh');
      }
    }

    // Check if this commit already exists
    const existingIndex = existingUpdates.findIndex(u => u.id === commitHash);
    if (existingIndex !== -1) {
      // Update existing entry
      existingUpdates[existingIndex] = newUpdate;
      console.log(`Updated existing entry for commit ${commitHash.substring(0, 7)}`);
    } else {
      // Add new entry at the beginning
      existingUpdates.unshift(newUpdate);
      console.log(`Added new entry for commit ${commitHash.substring(0, 7)}`);
    }

    // Keep only last 100 updates
    existingUpdates = existingUpdates.slice(0, 100);

    // Save updates
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(updatesPath, JSON.stringify(existingUpdates, null, 2), 'utf8');

    console.log(`✅ Updates saved to ${updatesPath}`);
    console.log(`📊 Added: ${finalAddedRepos.length}, Removed: ${finalRemovedRepos.length}`);

    // Generate RSS feed
    console.log('\n📡 Generating RSS feed...');
    generateRSS(existingUpdates);

  } catch (error) {
    console.error('❌ Error generating update:', error.message);
    process.exit(1);
  }
}

generateUpdateFromDiff();
