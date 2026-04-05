/**
 * Reset all data tables and storage buckets (preserves schema).
 *
 * Usage:
 *   npx tsx scripts/reset-db.ts
 *   npx tsx scripts/reset-db.ts --confirm    (skip confirmation prompt)
 */

import { readFileSync } from "fs";
import { createClient } from "../packages/db/node_modules/@supabase/supabase-js";
import { createInterface } from "readline";

// Load env from dashboard .env.local
const envFile = readFileSync("apps/dashboard/.env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TABLES = [
  "tags",
  "responses",
  "prompt_options",
  "prompts",
  "prompt_sections",
  "matches",
  "memberships",
  "user_profiles",
  "communities",
  "users",
];

async function confirm(): Promise<boolean> {
  if (process.argv.includes("--confirm")) return true;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(
      "⚠️  This will delete ALL data from ALL tables and storage buckets. Are you sure? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "yes");
      }
    );
  });
}

async function collectPaths(bucket: string, prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000 });

  if (error || !data) return [];

  const paths: string[] = [];
  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      // It's a file
      paths.push(fullPath);
    } else {
      // It's a folder — recurse
      const nested = await collectPaths(bucket, fullPath);
      paths.push(...nested);
    }
  }
  return paths;
}

async function main() {
  const ok = await confirm();
  if (!ok) {
    console.log("Aborted.");
    process.exit(0);
  }

  console.log("Resetting database...\n");

  for (const table of TABLES) {
    // Delete all rows (Supabase doesn't support TRUNCATE via the client)
    const { error } = await supabase.from(table).delete().gte("created_at", "1970-01-01");
    if (error) {
      console.error(`  Failed to clear ${table}:`, error.message);
    } else {
      console.log(`  Cleared: ${table}`);
    }
  }

  // Clear storage buckets
  console.log("\nClearing storage buckets...\n");

  const BUCKETS = ["video-responses", "community-logos"];

  for (const bucket of BUCKETS) {
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list("", { limit: 1000 });

    if (listError) {
      console.error(`  Failed to list ${bucket}:`, listError.message);
      continue;
    }

    if (!files || files.length === 0) {
      console.log(`  Cleared: ${bucket} (already empty)`);
      continue;
    }

    // Recursively collect all file paths (handles folders)
    const paths = await collectPaths(bucket, "");

    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (removeError) {
        console.error(`  Failed to clear ${bucket}:`, removeError.message);
      } else {
        console.log(`  Cleared: ${bucket} (${paths.length} file${paths.length === 1 ? "" : "s"})`);
      }
    } else {
      console.log(`  Cleared: ${bucket} (already empty)`);
    }
  }

  console.log("\nDone! All tables and storage buckets are empty.");
  console.log("Next: npx tsx scripts/seed-prompts.ts <community-slug>");
}

main().catch(console.error);
