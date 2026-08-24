import IconSprite from "@/components/IconSprite";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import Capabilities from "@/components/sections/Capabilities";
import PlugsIn from "@/components/sections/PlugsIn";
import WhyNow from "@/components/sections/WhyNow";
import Segments from "@/components/sections/Segments";
import Pricing from "@/components/sections/Pricing";
import About from "@/components/sections/About";
import Team from "@/components/sections/Team";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <IconSprite />
      <div className="ambient" />
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Capabilities />
      <PlugsIn />
      <WhyNow />
      <Segments />
      <Pricing />
      <About />
      <Team />
      <FinalCta />
      <Footer />
    </>
  );
}
