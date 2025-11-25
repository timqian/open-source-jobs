import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface RepoData {
    Repository: string;
    'Company Name'?: string;
    'Company URL'?: string;
    Description: string;
    'Job Page': string;
    Tags?: string;
    Language?: string;
}

interface CompanyInfo {
    name: string;
    url: string;
}

// Function to extract company name and URL from job page
function extractCompanyInfo(jobPageUrl: string): CompanyInfo {
  try {
    const url = new URL(jobPageUrl);
    const hostname = url.hostname.replace('www.', '').replace('corp.', '');

    // Map of known companies
    const companyMap: Record<string, CompanyInfo> = {
      'voidzero.dev': { name: 'VoidZero', url: 'https://voidzero.dev' },
      'elastic.co': { name: 'Elastic', url: 'https://www.elastic.co' },
      'grafana.com': { name: 'Grafana Labs', url: 'https://grafana.com' },
      'pingcap.com': { name: 'PingCAP', url: 'https://pingcap.com' },
      'mongodb.com': { name: 'MongoDB', url: 'https://www.mongodb.com' },
      'cockroachlabs.com': { name: 'Cockroach Labs', url: 'https://www.cockroachlabs.com' },
      'cloudbees.com': { name: 'CloudBees', url: 'https://www.cloudbees.com' },
      'odoo.com': { name: 'Odoo', url: 'https://www.odoo.com' },
      'comma.ai': { name: 'comma.ai', url: 'https://comma.ai' },
      'gradle.com': { name: 'Gradle Inc.', url: 'https://gradle.com' },
      'arango.ai': { name: 'ArangoDB', url: 'https://arango.ai' },
      'hasura.io': { name: 'Hasura', url: 'https://hasura.io' },
      'sysdig.com': { name: 'Sysdig', url: 'https://www.sysdig.com' },
      'parity.io': { name: 'Parity Technologies', url: 'https://www.parity.io' },
      'mapbox.com': { name: 'Mapbox', url: 'https://www.mapbox.com' },
      'prestashop.com': { name: 'PrestaShop', url: 'https://prestashop.com' },
      'sonarsource.com': { name: 'SonarSource', url: 'http://sonarsource.com' },
      'corelight.com': { name: 'Corelight', url: 'https://corelight.com' },
      'hazelcast.com': { name: 'Hazelcast', url: 'https://hazelcast.com' },
      'confluent.io': { name: 'Confluent', url: 'https://www.confluent.io' },
      'carto.com': { name: 'CARTO', url: 'https://carto.com' },
      'crate.io': { name: 'Crate.io', url: 'https://crate.io' },
      'npmjs.com': { name: 'npm', url: 'https://www.npmjs.com' },
      'sylabs.io': { name: 'Sylabs', url: 'https://sylabs.io' },
      'pimcore.com': { name: 'Pimcore', url: 'https://pimcore.com' },
      'yugabyte.com': { name: 'Yugabyte', url: 'https://www.yugabyte.com' },
      'kaltura.com': { name: 'Kaltura', url: 'https://corp.kaltura.com' },
      'unsplash.com': { name: 'Unsplash', url: 'https://unsplash.com' },
      'seldon.io': { name: 'Seldon', url: 'https://www.seldon.io' },
      'fossa.com': { name: 'FOSSA', url: 'https://fossa.com' },
      'oroinc.com': { name: 'Oro Inc.', url: 'https://oroinc.com' },
      'amazee.io': { name: 'amazee.io', url: 'https://www.amazee.io' },
      'irccloud.com': { name: 'IRCCloud', url: 'https://www.irccloud.com' },
      'ez.no': { name: 'Ibexa', url: 'https://ez.no' },
      'jetbrains.com': { name: 'JetBrains', url: 'https://www.jetbrains.com' },
      'arduino.cc': { name: 'Arduino', url: 'https://www.arduino.cc' },
      'codecombat.com': { name: 'CodeCombat', url: 'https://codecombat.com' },
      'sentry.io': { name: 'Sentry', url: 'https://sentry.io' },
      'slic3r.org': { name: 'Slic3r', url: 'https://slic3r.org' },
      'chaosgenius.io': { name: 'Chaos Genius', url: 'https://www.chaosgenius.io' },
      'metabase.com': { name: 'Metabase', url: 'https://www.metabase.com' },
      'mattermost.com': { name: 'Mattermost', url: 'https://mattermost.com' },
      'posthog.com': { name: 'PostHog', url: 'https://posthog.com' },
      'supabase.com': { name: 'Supabase', url: 'https://supabase.com' },
      'about.gitlab.com': { name: 'GitLab', url: 'https://about.gitlab.com' },
      'airbyte.com': { name: 'Airbyte', url: 'https://airbyte.com' },
      'temporal.io': { name: 'Temporal Technologies', url: 'https://temporal.io' },
      'strapi.io': { name: 'Strapi', url: 'https://strapi.io' },
      'n8n.io': { name: 'n8n', url: 'https://n8n.io' },
      'dagster.io': { name: 'Dagster Labs', url: 'https://dagster.io' },
      'mindsdb.com': { name: 'MindsDB', url: 'https://mindsdb.com' },
      'appwrite.careers': { name: 'Appwrite', url: 'https://www.appwrite.careers' },
      'getdbt.com': { name: 'dbt Labs', url: 'https://www.getdbt.com' },
      'directus.io': { name: 'Directus', url: 'https://directus.io' },
      'cal.com': { name: 'Cal.com', url: 'https://cal.com' },
      'plausible.io': { name: 'Plausible Analytics', url: 'https://plausible.io' },
      'prisma.io': { name: 'Prisma', url: 'https://www.prisma.io' },
      'rocket.chat': { name: 'Rocket.Chat', url: 'https://www.rocket.chat' },
      'wellfound.com': { name: 'Weaviate', url: 'https://wellfound.com/company/weaviate' },
      'join.com': { name: 'Qdrant', url: 'https://join.com/companies/qdrant' },
      'infisical.com': { name: 'Infisical', url: 'https://infisical.com' },
      'handbook.novu.co': { name: 'Novu', url: 'https://handbook.novu.co' },
      'vercel.com': { name: 'Vercel', url: 'https://vercel.com' },
      'hashicorp.com': { name: 'HashiCorp', url: 'https://www.hashicorp.com' },
      'vector.dev': { name: 'Vector', url: 'https://vector.dev' },
      'ycombinator.com': { name: 'Y Combinator', url: 'https://www.ycombinator.com' },
      'chatwoot.com': { name: 'Chatwoot', url: 'https://www.chatwoot.com' },
      'twenty.com': { name: 'Twenty', url: 'https://twenty.com' },
      'langfuse.com': { name: 'Langfuse', url: 'https://langfuse.com' },
      'workable.com': { name: 'Hugging Face', url: 'https://apply.workable.com/huggingface' },
      'lifeatspotify.com': { name: 'Spotify', url: 'https://www.lifeatspotify.com' },
      'plane.so': { name: 'Plane', url: 'https://plane.so' },
      'zilliz.com': { name: 'Zilliz', url: 'https://zilliz.com' },
      'greenhouse.io': { name: 'Prefect', url: 'https://job-boards.greenhouse.io/prefect' },
      'konghq.com': { name: 'Kong Inc.', url: 'https://konghq.com' },
      'traefik.io': { name: 'Traefik Labs', url: 'https://traefik.io' },
      'camunda.com': { name: 'Camunda', url: 'https://camunda.com' },
      'payloadcms.com': { name: 'Payload', url: 'https://payloadcms.com' },
      'cube.dev': { name: 'Cube', url: 'https://cube.dev' },
      'nocodb.com': { name: 'NocoDB', url: 'https://nocodb.com' },
      'formbricks.com': { name: 'Formbricks', url: 'https://formbricks.com' },
      'tooljet.com': { name: 'ToolJet', url: 'https://tooljet.com' },
      'budibase.com': { name: 'Budibase', url: 'https://budibase.com' },
      'preset.io': { name: 'Preset', url: 'https://preset.io' },
      'flagsmith.com': { name: 'Flagsmith', url: 'https://flagsmith.com' },
      'clickhouse.com': { name: 'ClickHouse', url: 'https://clickhouse.com' },
      'timescale.com': { name: 'Timescale', url: 'https://www.timescale.com' },
      'questdb.io': { name: 'QuestDB', url: 'https://questdb.io' },
      'influxdata.com': { name: 'InfluxData', url: 'https://www.influxdata.com' },
      'ververica.com': { name: 'Ververica', url: 'https://www.ververica.com' },
      'databricks.com': { name: 'Databricks', url: 'https://www.databricks.com' },
      'astronomer.io': { name: 'Astronomer', url: 'https://www.astronomer.io' },
      'cloud.google.com': { name: 'Google Cloud', url: 'https://cloud.google.com' },
      'fivetran.com': { name: 'Fivetran', url: 'https://www.fivetran.com' },
      'meltano.com': { name: 'Meltano', url: 'https://meltano.com' },
      'stitchdata.com': { name: 'Stitch', url: 'https://www.stitchdata.com' },
      'redpanda.com': { name: 'Redpanda', url: 'https://www.redpanda.com' },
      'streamnative.io': { name: 'StreamNative', url: 'https://streamnative.io' },
      'synadia.com': { name: 'Synadia', url: 'https://synadia.com' },
      'broadcom.com': { name: 'Broadcom', url: 'https://www.broadcom.com' },
      'canonical.com': { name: 'Canonical', url: 'https://canonical.com' },
      'redhat.com': { name: 'Red Hat', url: 'https://www.redhat.com' },
      'suse.com': { name: 'SUSE', url: 'https://www.suse.com' },
      'buoyant.io': { name: 'Buoyant', url: 'https://buoyant.io' },
      'solo.io': { name: 'Solo.io', url: 'https://www.solo.io' },
      'cncf.io': { name: 'CNCF', url: 'https://www.cncf.io' },
      'signoz.io': { name: 'SigNoz', url: 'https://signoz.io' },
      'uptrace.dev': { name: 'Uptrace', url: 'https://uptrace.dev' },
      'victoriametrics.com': { name: 'VictoriaMetrics', url: 'https://victoriametrics.com' },
      'uber.com': { name: 'Uber', url: 'https://www.uber.com' },
      'imply.io': { name: 'Imply', url: 'https://imply.io' },
      'startree.ai': { name: 'StarTree', url: 'https://startree.ai' },
      'starburst.io': { name: 'Starburst', url: 'https://www.starburst.io' },
      'prestodb.io': { name: 'PrestoDB', url: 'https://prestodb.io' },
      'mirrorship.cn': { name: 'Mirrorship', url: 'https://www.mirrorship.cn' },
      'selectdb.com': { name: 'SelectDB', url: 'https://selectdb.com' },
      'cloudera.com': { name: 'Cloudera', url: 'https://www.cloudera.com' },
      'datastax.com': { name: 'DataStax', url: 'https://www.datastax.com' },
      'scylladb.com': { name: 'ScyllaDB', url: 'https://www.scylladb.com' },
      'redis.com': { name: 'Redis', url: 'https://redis.com' },
      'linuxfoundation.org': { name: 'Linux Foundation', url: 'https://www.linuxfoundation.org' },
      'dragonflydb.io': { name: 'DragonflyDB', url: 'https://www.dragonflydb.io' },
      'aliyun.com': { name: 'Alibaba Cloud', url: 'https://www.aliyun.com' },
      'vitess.io': { name: 'Vitess', url: 'https://vitess.io' },
      'merico.dev': { name: 'Merico', url: 'https://www.merico.dev' },
      'alluxio.io': { name: 'Alluxio', url: 'https://www.alluxio.io' },
      'tabular.io': { name: 'Tabular', url: 'https://www.tabular.io' },
      'onehouse.ai': { name: 'Onehouse', url: 'https://www.onehouse.ai' },
      'duckdb.org': { name: 'DuckDB', url: 'https://duckdb.org' },
      'voltrondata.com': { name: 'Voltron Data', url: 'https://voltrondata.com' },
      'min.io': { name: 'MinIO', url: 'https://min.io' },
      'seaweedfs.com': { name: 'SeaweedFS', url: 'https://www.seaweedfs.com' },
      'juicedata.io': { name: 'Juicedata', url: 'https://juicedata.io' },
      'snyk.io': { name: 'Snyk', url: 'https://snyk.io' },
      'aquasec.com': { name: 'Aqua Security', url: 'https://www.aquasec.com' },
      'anchore.com': { name: 'Anchore', url: 'https://anchore.com' },
      'chainguard.dev': { name: 'Chainguard', url: 'https://www.chainguard.dev' },
      'styra.com': { name: 'Styra', url: 'https://www.styra.com' },
      'jetstack.io': { name: 'Jetstack', url: 'https://www.jetstack.io' },
      'isovalent.com': { name: 'Isovalent', url: 'https://www.isovalent.com' },
      'tetrate.io': { name: 'Tetrate', url: 'https://www.tetrate.io' },
      'diagrid.io': { name: 'Diagrid', url: 'https://www.diagrid.io' },
      'upbound.io': { name: 'Upbound', url: 'https://www.upbound.io' },
      'akuity.io': { name: 'Akuity', url: 'https://www.akuity.io' },
    };

    // Look up company info
    const companyInfo = companyMap[hostname];
    if (companyInfo) {
      return companyInfo;
    }

    // Default fallback: capitalize domain name
    const domainParts = hostname.split('.');
    const mainDomain = domainParts[domainParts.length - 2];
    const capitalizedName = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);

    return {
      name: capitalizedName,
      url: `https://${hostname}`
    };
  } catch (error) {
    return { name: '', url: '' };
  }
}

async function main() {
    const csvPath = path.join(process.cwd(), 'repos.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const { data } = Papa.parse<RepoData>(csvContent, {
        header: true,
        skipEmptyLines: true
    });

    console.log(`Processing ${data.length} repositories...`);

    // Add company info to each row
    const updatedData = data.map(row => {
        const companyInfo = extractCompanyInfo(row['Job Page']);
        return {
            'Repository': row.Repository,
            'Company Name': companyInfo.name,
            'Company URL': companyInfo.url,
            'Description': row.Description,
            'Job Page': row['Job Page'],
            'Tags': row.Tags,
            'Language': row.Language
        };
    });

    // Convert back to CSV
    const newCsv = Papa.unparse(updatedData, {
        columns: ['Repository', 'Company Name', 'Company URL', 'Description', 'Job Page', 'Tags', 'Language']
    });

    // Write the updated CSV
    fs.writeFileSync(csvPath, newCsv);

    console.log('Company Name and Company URL columns added successfully!');
    console.log(`Processed ${updatedData.length} rows`);
}

main().catch(console.error);
