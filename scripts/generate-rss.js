const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSS() {
  console.log('Generating RSS feed...');

  try {
    // Read updates data
    const updatesPath = path.join(__dirname, '..', 'data', 'updates.json');
    const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));

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
    console.log(`📊 Total items: ${updates.length}`);

  } catch (error) {
    console.error('❌ Error generating RSS:', error.message);
    process.exit(1);
  }
}

generateRSS();
