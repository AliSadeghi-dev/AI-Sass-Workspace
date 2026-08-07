import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { Footer } from "./footer";
import { LandingHeader } from "./header";
import { HeroSection } from "./hero-section";
import { LandingBackground } from "./landing-background";
import { MvpSection } from "./mvp-section";
import { RoadmapSection } from "./roadmap-section";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LandingBackground />
      <LandingHeader />

      <main>
        <HeroSection />
        <FeaturesSection />
        <RoadmapSection />
        <MvpSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
