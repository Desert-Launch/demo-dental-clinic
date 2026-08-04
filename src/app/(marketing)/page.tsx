import { AssuranceStrip } from "@/components/marketing/assurance-strip";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeaturedServices } from "@/components/marketing/featured-services";
import { Hero } from "@/components/marketing/hero";
import { SmileGallery } from "@/components/marketing/smile-gallery";
import { TeamStrip } from "@/components/marketing/team-strip";
import { Testimonials } from "@/components/marketing/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AssuranceStrip />
      <FeaturedServices />
      <TeamStrip />
      <Testimonials />
      <SmileGallery />
      <CtaBand />
    </>
  );
}
