import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedStory } from "@/components/FeaturedStory";
import { ReadingBlock } from "@/components/ReadingBlock";
import { CineBlock } from "@/components/CineBlock";
import { Newsletter } from "@/components/Newsletter";
import { AboutStrip } from "@/components/AboutStrip";
import { getBooks, getFilms } from "@/lib/content";

export default async function HomePage() {
  const books = await getBooks();
  const latestBooks = books.slice(-5);

  const films = await getFilms();
  const seenCycles = new Set<string>();
  const latestFilms = [];
  for (const f of films) {
    if (!seenCycles.has(f.ciclo)) {
      if (seenCycles.size === 2) break;
      seenCycles.add(f.ciclo);
    }
    latestFilms.push(f);
  }

  return (
    <>
      <Hero variant="centered" imageSrc="/images/Banner.png" />
      <CategoryGrid />
      <FeaturedStory />
      <ReadingBlock books={latestBooks} viewAllHref="/club-de-lectura" />
      <CineBlock films={latestFilms} viewAllHref="/cineclub" />
      <Newsletter />
      <AboutStrip />
    </>
  );
}
