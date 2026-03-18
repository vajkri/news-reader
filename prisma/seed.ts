import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCES = [
  { name: "TLDR Tech",         url: "https://hnrss.org/frontpage",                                       category: "Tech"   },
  { name: "Dev.to",            url: "https://dev.to/feed",                                               category: "Dev"    },
  { name: "TechCrunch AI",     url: "https://techcrunch.com/category/artificial-intelligence/feed/",      category: "AI"     },
  { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/",                            category: "Design" },
];

async function main() {
  console.log("Seeding sources…");
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
