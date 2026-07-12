import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedStory } from "@/components/FeaturedStory";
import { ReadingBlock } from "@/components/ReadingBlock";
import { CineBlock } from "@/components/CineBlock";
import { Newsletter } from "@/components/Newsletter";
import { AboutStrip } from "@/components/AboutStrip";
import { getBooks } from "@/lib/content";

export default async function HomePage() {
  const books = await getBooks();
  const latestBooks = books.slice(-5);

  return (
    <>
      <Hero variant="centered" imageSrc="/images/Banner.png" />
      <CategoryGrid />
      <FeaturedStory />
      <ReadingBlock books={latestBooks} viewAllHref="/club-de-lectura" />
      <CineBlock />
      <Newsletter />
      <AboutStrip />
    </>
  );
}
