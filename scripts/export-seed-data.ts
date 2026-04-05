/**
 * Export current community + prompt data as SQL INSERT statements.
 *
 * Usage:
 *   npx tsx scripts/export-seed-data.ts > supabase/seed.sql
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * in apps/dashboard/.env.local (or set as environment variables).
 */

import { readFileSync } from "fs";
import { createClient } from "../packages/db/node_modules/@supabase/supabase-js";

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

function esc(val: string | null): string {
  if (val === null) return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

async function main() {
  const lines: string[] = [];

  lines.push("-- Seed data exported on " + new Date().toISOString());
  lines.push("-- This script re-creates communities, prompt sections, prompts, and prompt options.");
  lines.push("");

  // Communities
  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .order("created_at");

  if (!communities?.length) {
    console.error("No communities found.");
    process.exit(1);
  }

  lines.push("-- Communities");
  for (const c of communities) {
    lines.push(
      `INSERT INTO communities (id, name, slug, description, icon_url, matchmaker_display_name, created_at, updated_at)` +
      ` VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.description)}, ${esc(c.icon_url)}, ${esc(c.matchmaker_display_name)}, now(), now());`
    );
  }
  lines.push("");

  // Prompt sections
  const { data: sections } = await supabase
    .from("prompt_sections")
    .select("*")
    .order("sort_order");

  if (sections?.length) {
    lines.push("-- Prompt sections");
    for (const s of sections) {
      lines.push(
        `INSERT INTO prompt_sections (id, community_id, title, step, sort_order, created_at, updated_at)` +
        ` VALUES (${esc(s.id)}, ${esc(s.community_id)}, ${esc(s.title)}, ${esc(s.step)}, ${s.sort_order}, now(), now());`
      );
    }
    lines.push("");
  }

  // Prompts
  const { data: prompts } = await supabase
    .from("prompts")
    .select("*")
    .order("sort_order");

  if (prompts?.length) {
    lines.push("-- Prompts");
    for (const p of prompts) {
      lines.push(
        `INSERT INTO prompts (id, section_id, label, type, sort_order, required, created_at, updated_at)` +
        ` VALUES (${esc(p.id)}, ${esc(p.section_id)}, ${esc(p.label)}, ${esc(p.type)}, ${p.sort_order}, ${p.required}, now(), now());`
      );
    }
    lines.push("");
  }

  // Prompt options
  const { data: options } = await supabase
    .from("prompt_options")
    .select("*")
    .order("sort_order");

  if (options?.length) {
    lines.push("-- Prompt options");
    for (const o of options) {
      lines.push(
        `INSERT INTO prompt_options (id, prompt_id, label, sort_order, created_at, updated_at)` +
        ` VALUES (${esc(o.id)}, ${esc(o.prompt_id)}, ${esc(o.label)}, ${o.sort_order}, now(), now());`
      );
    }
    lines.push("");
  }

  console.log(lines.join("\n"));
}

main().catch(console.error);
