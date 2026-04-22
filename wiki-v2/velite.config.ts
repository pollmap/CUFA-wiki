import { defineConfig, s } from "velite";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const difficulty = s.enum(["beginner", "intermediate", "advanced"]);
const track = s.enum([
  "learn",
  "industries",
  "career",
  "tools",
  "research",
]);

const baseMeta = {
  title: s.string().max(140),
  description: s.string().max(280).optional(),
  slug: s.path(),
  date: s.isodate().optional(),
  updated: s.isodate().optional(),
  track,
  section: s.string(),
  order: s.number().default(999),
  difficulty: difficulty.default("intermediate"),
  readingMinutes: s.number().default(5),
  tags: s.array(s.string()).default([]),
  related: s.array(s.string()).default([]),
  prerequisites: s.array(s.string()).default([]),
  certifications: s.array(s.string()).default([]),
  koreaContext: s.boolean().default(false),
  sources: s
    .array(
      s.object({
        label: s.string(),
        url: s.string().url().optional(),
        accessed: s.isodate().optional(),
      })
    )
    .default([]),
  draft: s.boolean().default(false),
};

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/content-assets",
    base: "/content-assets/",
    clean: true,
  },
  collections: {
    learnDocs: {
      name: "LearnDoc",
      pattern: "learn/**/*.{md,mdx}",
      schema: s
        .object({
          ...baseMeta,
          layer: s
            .enum(["L1", "L2", "L3", "L4", "macro", "portfolio", "asset", "product", "structure", "behavioral", "regulation", "history", "esg", "quant"])
            .optional(),
          body: s.mdx(),
          metadata: s.metadata(),
        })
        .transform((data) => ({ ...data, url: `/learn/${data.slug}` })),
    },
    researchDocs: {
      name: "ResearchDoc",
      pattern: ["research/**/*.{md,mdx}", "!research/field-notes/**"],
      schema: s
        .object({
          ...baseMeta,
          ticker: s.string().optional(),
          analyst: s.string().optional(),
          rating: s.enum(["BUY", "HOLD", "SELL", "NA"]).default("NA"),
          targetPrice: s.string().optional(),
          fieldVisits: s
            .array(
              s.object({
                place: s.string(),
                date: s.isodate(),
                lat: s.number().optional(),
                lon: s.number().optional(),
              })
            )
            .default([]),
          body: s.mdx(),
          metadata: s.metadata(),
        })
        .transform((data) => ({ ...data, url: `/research/${data.slug}` })),
    },
    careerDocs: {
      name: "CareerDoc",
      pattern: "career/**/*.{md,mdx}",
      schema: s
        .object({
          ...baseMeta,
          body: s.mdx(),
          metadata: s.metadata(),
        })
        .transform((data) => ({ ...data, url: `/career/${data.slug}` })),
    },
    companies: {
      name: "Company",
      pattern: "industries/companies/**/*.{md,mdx}",
      schema: s
        .object({
          ...baseMeta,
          ticker: s.string().optional(),
          corpCode: s.string().optional(),
          sector: s.string().default("미분류"),
          sub: s.string().optional(),
          listed: s.boolean().default(true),
          market: s.enum(["KOSPI", "KOSDAQ", "KONEX", "US", "Other"]).default("KOSPI"),
          body: s.mdx(),
          metadata: s.metadata(),
        })
        .transform((data) => ({ ...data, url: `/industries/${data.slug}` })),
    },
    fieldNotes: {
      name: "FieldNote",
      pattern: "research/field-notes/**/*.{md,mdx}",
      schema: s
        .object({
          title: s.string(),
          slug: s.path(),
          date: s.isodate(),
          place: s.string(),
          lat: s.number().optional(),
          lon: s.number().optional(),
          sector: s.string(),
          tags: s.array(s.string()).default([]),
          photos: s.array(s.string()).default([]),
          body: s.mdx(),
        })
        .transform((data) => ({ ...data, url: `/research/field-notes/${data.slug}` })),
    },
  },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
