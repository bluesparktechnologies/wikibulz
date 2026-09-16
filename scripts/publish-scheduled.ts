import { loadEnvConfig } from "@next/env";
import { publishDueQueueItems } from "../src/modules/autoblog/publishing/scheduled-publisher";

loadEnvConfig(process.cwd());

async function main() {
  const result = await publishDueQueueItems();
  console.log(`Checked ${result.checked} due queue items. Published ${result.published}. Failed ${result.failed}.`);
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
