import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedStory } from "@/components/FeaturedStory";
import { ReadingBlock } from "@/components/ReadingBlock";
import { CineBlock } from "@/components/CineBlock";
import { Newsletter } from "@/components/Newsletter";
import { AboutStrip } from "@/components/AboutStrip";

export default function HomePage() {
  return (
    <>
      <Hero variant="centered" imageSrc="/images/Banner.png" />
      <CategoryGrid />
      <FeaturedStory />
      <ReadingBlock />
      <CineBlock />
      <Newsletter />
      <AboutStrip />
    </>
  );
}
