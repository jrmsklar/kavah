/**
 * Seed prompts for a community by slug.
 *
 * Usage:
 *   npx tsx scripts/seed-prompts.ts friday-tables
 *
 * This attaches the Friday Tables prompt structure to an existing community.
 * The community must already exist (created via the dashboard).
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

// ─── Prompt definitions by community slug ───────────────────────────────────

type PromptDef = {
  label: string;
  type: "single_select" | "multi_select" | "video" | "text_input" | "textarea";
  required: boolean;
  options?: string[];
};

type SectionDef = {
  title: string;
  step: "basics" | "videos" | "profile";
  prompts: PromptDef[];
};

const SEEDS: Record<string, SectionDef[]> = {
  "friday-tables": [
    {
      title: "Identity",
      step: "basics",
      prompts: [
        {
          label: "I Am A",
          type: "single_select",
          required: true,
          options: ["Man", "Woman", "Non-Binary"],
        },
        {
          label: "Looking To Date",
          type: "multi_select",
          required: true,
          options: ["Men", "Women", "Non-Binary People", "Open To Anyone"],
        },
      ],
    },
    {
      title: "Jewish Life",
      step: "basics",
      prompts: [
        {
          label: "I Identify As",
          type: "single_select",
          required: true,
          options: [
            "Just Jewish",
            "Cultural",
            "Reform",
            "Conservative",
            "Traditional",
            "Modern Orthodox",
            "Orthodox",
          ],
        },
      ],
    },
    {
      title: "Relationship Patterns",
      step: "videos",
      prompts: [
        {
          label: "Think about the people you're closest to – what do they rely on you for, and what do those relationships ask of you that's hard?",
          type: "video",
          required: true,
        },
      ],
    },
    {
      title: "Life Vision",
      step: "videos",
      prompts: [
        {
          label: "In 5-10 years, what does your actual day-to-day life look like – and what are the two things that matter most in it?",
          type: "video",
          required: true,
        },
      ],
    },
    {
      title: "Current Needs",
      step: "videos",
      prompts: [
        {
          label: "What do you need more of in your life right now – and what do you need less of?",
          type: "video",
          required: true,
        },
      ],
    },
    {
      title: "Attraction & Partner Vision",
      step: "videos",
      prompts: [
        {
          label: "Describe your person – not a checklist, just what they feel like to be around.",
          type: "video",
          required: true,
        },
      ],
    },
  ],
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error("Usage: npx tsx scripts/seed-prompts.ts <community-slug>");
    console.error("Available seeds:", Object.keys(SEEDS).join(", "));
    process.exit(1);
  }

  const sections = SEEDS[slug];
  if (!sections) {
    console.error(`No seed data defined for "${slug}".`);
    console.error("Available seeds:", Object.keys(SEEDS).join(", "));
    process.exit(1);
  }

  // Look up community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (communityError || !community) {
    console.error(`Community "${slug}" not found. Create it in the dashboard first.`);
    process.exit(1);
  }

  console.log(`Seeding prompts for "${community.name}" (${community.id})...\n`);

  // Check for existing prompts
  const { data: existingSections } = await supabase
    .from("prompt_sections")
    .select("id")
    .eq("community_id", community.id);

  if (existingSections && existingSections.length > 0) {
    console.error(`Community already has ${existingSections.length} prompt section(s).`);
    console.error("Delete existing prompts first, or use the dashboard to edit them.");
    process.exit(1);
  }

  // Insert sections, prompts, and options
  for (let si = 0; si < sections.length; si++) {
    const section = sections[si];

    const { data: sectionRow, error: sectionError } = await supabase
      .from("prompt_sections")
      .insert({
        community_id: community.id,
        title: section.title,
        step: section.step,
        sort_order: si,
      })
      .select("id")
      .single();

    if (sectionError || !sectionRow) {
      console.error(`Failed to create section "${section.title}":`, sectionError);
      process.exit(1);
    }

    console.log(`  Section: ${section.title} (${section.step})`);

    for (let pi = 0; pi < section.prompts.length; pi++) {
      const prompt = section.prompts[pi];

      const { data: promptRow, error: promptError } = await supabase
        .from("prompts")
        .insert({
          section_id: sectionRow.id,
          label: prompt.label,
          type: prompt.type,
          sort_order: pi,
          required: prompt.required,
        })
        .select("id")
        .single();

      if (promptError || !promptRow) {
        console.error(`Failed to create prompt "${prompt.label}":`, promptError);
        process.exit(1);
      }

      const truncated = prompt.label.length > 50 ? prompt.label.slice(0, 50) + "..." : prompt.label;
      console.log(`    Prompt: ${truncated}`);

      if (prompt.options?.length) {
        const optionRows = prompt.options.map((label, oi) => ({
          prompt_id: promptRow.id,
          label,
          sort_order: oi,
        }));

        const { error: optionsError } = await supabase
          .from("prompt_options")
          .insert(optionRows);

        if (optionsError) {
          console.error(`Failed to create options:`, optionsError);
          process.exit(1);
        }

        console.log(`      Options: ${prompt.options.join(", ")}`);
      }
    }
  }

  console.log(`\nDone! Seeded ${sections.length} sections for "${community.name}".`);
}

main().catch(console.error);
