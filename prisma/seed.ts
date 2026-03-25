import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCES = [
  { name: "TLDR Tech",         url: "https://bullrich.dev/tldr-rss/tech.rss",                             category: "Tech"   },
  { name: "TLDR AI",           url: "https://bullrich.dev/tldr-rss/ai.rss",                               category: "AI"     },
  { name: "TLDR Design",       url: "https://bullrich.dev/tldr-rss/design.rss",                           category: "Design" },
  { name: "TechCrunch AI",     url: "https://techcrunch.com/category/artificial-intelligence/feed/",      category: "AI"     },
  { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/",                             category: "Design" },
  { name: "OpenAI News",       url: "https://openai.com/news/rss.xml",                                   category: "AI"     },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml",                               category: "AI"     },
  { name: "Hacker News",       url: "https://hnrss.org/frontpage",                                       category: "Tech"   },
];

async function main() {
  console.log("Seeding sources…");

  // One-time fix: swap TLDR Tech URL from HN to the real TLDR feed.
  // This preserves the existing source.id and all article relations.
  // Safe to rerun: checks existence before updating.
  const staleHnTldr = await prisma.source.findUnique({
    where: { url: "https://hnrss.org/frontpage" },
  });
  if (staleHnTldr?.name === "TLDR Tech") {
    await prisma.source.update({
      where: { url: "https://hnrss.org/frontpage" },
      data: { url: "https://bullrich.dev/tldr-rss/tech.rss" },
    });
    console.log("  ~ Migrated TLDR Tech URL to tldr-rss middleman");
  }

  for (const source of SOURCES) {
    await prisma.source.upsert({
      where: { url: source.url },
      create: source,
      update: {},
    });
    console.log(`  ✓ ${source.name}`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
