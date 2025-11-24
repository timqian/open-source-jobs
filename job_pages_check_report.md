# Job Pages 检查报告

**检查日期**: 2025-11-24
**检查范围**: repos.csv 中前55个job page

## 📊 检测摘要

| 指标 | 数量 | 百分比 |
|------|------|--------|
| **总计检查** | 55 | 100% |
| **可访问 (200 OK)** | 1 | 1.8% |
| **403 错误 (禁止访问)** | 31 | 56.4% |
| **连接失败** | 23 | 41.8% |
| **确认不在招聘** | 1 | 1.8% |
| **确认在招聘** | 0 | 0% |

## ⚠️ 主要发现

### 严重问题
由于大部分网站都有反爬虫保护机制，自动化检测受到严重限制：

1. **403 错误 (31个)**: 网站阻止了自动化请求，但不意味着页面不存在
2. **连接失败 (23个)**: 可能是域名失效、服务器下线，或反爬虫措施
3. **仅1个页面可访问**: Sentry的招聘页面，但显示当前无职位空缺

### 可能失效的Job Pages

以下URL完全无法访问，可能需要更新或删除：

#### 连接失败 (23个) - 最可能失效
1. `https://pm2.io/jobs/` - Unitech/pm2
2. `https://comma.ai/jobs` - commaai/openpilot
3. `https://www.arangodb.com/jobs/` - arangodb/arangodb
4. `https://hasura.io/careers` - hasura/graphql-engine
5. `https://sysdig.com/jobs/` - draios/sysdig
6. `https://nodesource.com/careers` - nodesource/distributions
7. `https://angel.co/rasahq/jobs` - RasaHQ/rasa_nlu
8. `https://www.mapbox.com/careers/` - mapbox/mapbox-gl-js
9. `https://corelight.com/company/careers` - zeek/zeek
10. `https://www.rundeck.com/careers` - rundeck/rundeck
11. `https://www.datawire.io/careers/` - datawire/ambassador
12. `https://bitnami.com/careers` - bitnami/minideb
13. `https://pimcore.com/en/about/careers` - pimcore/pimcore
14. `https://corp.kaltura.com/company/careers/` - kaltura/nginx-vod-module
15. `https://unsplash.com/hiring` - unsplash/unsplash-js
16. `https://www.seldon.io/careers/` - SeldonIO/seldon-core
17. `https://fossa.com/careers` - fossas/fossa-cli
18. `https://oroinc.com/careers` - oroinc/crm
19. `https://www.irccloud.com/jobs` - irccloud/ios
20. `https://ez.no/About-eZ/Careers` - ezsystems/ezplatform
21. `https://platform.sh/company/careers` - platformsh/platformsh-cli
22. `https://decent.ch/careers/` - DECENTfoundation/DECENT-Network
23. `https://www.arduino.cc/en/Careers/Home` - arduino/Arduino
24. `https://codecombat.com/about#careers` - codecombat/codecombat
25. `https://www.chaosgenius.io/about.html` - chaos-genius/chaos_genius

#### 403错误 (31个) - 需要手动验证
这些页面可能仍然有效，但阻止了自动化访问：

1. `https://www.elastic.co/about/careers/` - elastic/elasticsearch
2. `https://serverless.com/company/jobs/` - serverless/serverless
3. `https://grafana.com/about/hiring` - grafana/grafana
4. `https://www.mongodb.com/careers` - mongodb/mongo
5. `https://www.cockroachlabs.com/careers/` - cockroachdb/cockroach
6. `https://www.cloudbees.com/careers/` - jenkinsci/jenkins
7. `https://www.odoo.com/jobs` - odoo/odoo
8. `https://pingcap.com/recruit-cn/join/` - pingcap/tidb
9. `https://dgraph.io/careers` - dgraph-io/dgraph
10. `https://www.saltstack.com/company/careers/` - saltstack/salt
11. `https://gradle.com/careers/` - gradle/gradle
12. `https://www.parity.io/jobs` - paritytech/parity-ethereum
13. `http://www.jobs.net/jobs/prestashop/en-gb/` - PrestaShop/PrestaShop
14. `http://sonarsource.com/company/jobs/` - SonarSource/SonarQube
15. `https://www.confluent.io/careers/` - confluentinc/ksql
16. `https://hazelcast.com/company/careers/` - hazelcast/hazelcast
17. `https://angel.co/company/purse/jobs/90956-open-source-protocol-developer-bcoin` - bcoin-org/bcoin
18. `https://www.npmjs.com/jobs` - npm/cli
19. `https://sylabs.io/resources/jobs` - sylabs/singularity
20. `https://carto.com/careers/` - CartoDB/cartodb
21. `https://crate.io/jobs/` - crate/crate
22. `https://hire.withgoogle.com/public/jobs/yugabyte` - YugaByte/yugabyte-db
23. `https://amazee.bamboohr.com/jobs/` - amazeeio/lagoon
24. `https://site.vizor.io/jobs` - vizorvr/patches
25. `https://www.jetbrains.com/careers/jobs/` - jetbrains/kotlin & jetbrains/intellij-community
26. `https://jobs.lever.co/mattermost/` - mattermost/mattermost-server
27. `https://www.metabase.com/jobs/` - metabase/metabase
28. `https://slic3r.org/blog/job-opportunities/` - slic3r/Slic3r

### 确认状态
- **getsentry/sentry** (`https://sentry.io/careers/`) - ✅ 页面可访问，但显示当前无职位空缺

## 🔍 建议下一步行动

### 1. 手动验证高优先级项目
建议手动在浏览器中检查以下知名项目的招聘页面：
- Elasticsearch, Grafana, MongoDB, Kubernetes相关项目
- JetBrains (Kotlin, IntelliJ)
- HashiCorp项目
- 数据库相关: CockroachDB, TiDB, Dgraph

### 2. 使用浏览器检查
由于反爬虫限制，需要：
- 使用正常浏览器访问403错误的URL
- 检查是否有重定向到新的招聘页面
- 确认页面是否真的存在招聘信息

### 3. 更新CSV文件
对于确认失效的URL（特别是连接失败的23个），考虑：
- 从CSV中删除
- 更新为新的招聘页面URL
- 标记为"招聘页面不可用"

### 4. 替代方案
对于失效的招聘页面，可以考虑：
- 搜索公司的最新招聘页面
- 使用LinkedIn Jobs、Greenhouse、Lever等招聘平台
- 查看公司GitHub组织页面的最新信息

## 📋 详细检查结果

完整的JSON格式检查结果已保存至: `job_pages_check_results.json`

## 🛠️ 技术说明

**检测方法**: 使用Python requests库进行HTTP请求
**User-Agent**: 模拟Chrome浏览器
**超时设置**: 10秒
**并发数**: 5个线程

**限制**:
- 许多现代网站使用Cloudflare、WAF等防护措施
- 403错误不一定表示页面不存在，可能只是阻止了自动化访问
- 连接失败可能是临时网络问题或永久性服务下线
