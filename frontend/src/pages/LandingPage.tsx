import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardImg from "@/assets/dashboard-example.png";
import AnimationContainer from "@/components/ui/animation-container";
import MaxWidthWrapper from "@/components/ui/max-width-container";
import { BentoCard, BentoGrid, CARDS } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import MagicBadge from "@/components/ui/magic-badge";
import { LampContainer } from "@/components/ui/lamb";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <>
      {/* ----------------------------------Hero Section---------------------------------- */}
      <div className="relative z-10 flex flex-col justify-center pt-10 md:pt-20 items-center">
        <MagicBadge title="AI Authentication Suite" />
        <h1 className="text-5xl md:text-8xl leading-tight text-center mt-5 max-w-6xl">
          The{" "}
          <span className="bg-linear-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_5px_--theme(--color-blue-500/80%)]">
            Authentication Blade
          </span>{" "}
          Your Platform{" "}
          <span className="bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_5px_var(--color-slate-400)]">
            Needs
          </span>
        </h1>
        <div className="text-center mt-6 text-accent-foreground">
          <p className="text-sm md:text-xl max-w-xl">
            Authentication, avatars, usernames, spam protection <br />
            Katana gives you{" "}
            <span className="bg-linear-to-r from-blue-500 to-white bg-clip-text text-transparent">
              one Toolkit
            </span>{" "}
            to nail them all.
            <br />
            <span className="bg-linear-to-r from-white to-amber-300 bg-clip-text text-transparent">
              Start free
            </span>
            , scale when you're ready.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button asChild>
            <Link to="/dashboard" className="flex items-center">
              Start building for free
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* ----------------------------------Image Bento Grid---------------------------------- */}
      <div className="relative z-10 py-25 px-4 w-full max-w-6xl mx-auto">
        {/* Glow behind grid */}
        <div className="absolute inset-10 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative grid grid-cols-3 grid-rows-2 gap-4 h-125">
          {/* Large image - spans 2 columns */}
          <div className="col-span-2 row-span-1 relative rounded-xl overflow-hidden ring-1 ring-foreground/20">
            <img
              src={dashboardImg}
              alt="Dashboard"
              className="w-full h-full object-cover p-2 rounded-2xl"
            />
          </div>
          {/* Top right - tall image spans 2 rows */}
          <div className="col-span-1 row-span-2 relative rounded-xl overflow-hidden ring-1 ring-foreground/20">
            <img
              src={dashboardImg}
              alt="Dashboard"
              className="w-full h-full object-cover p-2 rounded-2xl"
            />
          </div>
          {/* Bottom left */}
          <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden ring-1 ring-foreground/20">
            <img
              src={dashboardImg}
              alt="Dashboard"
              className="w-full h-full object-cover p-2 rounded-2xl"
            />
          </div>
          {/* Bottom middle */}
          <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden ring-1 ring-foreground/20">
            <img
              src={dashboardImg}
              alt="Dashboard"
              className="w-full h-full object-cover p-2 rounded-2xl"
            />
          </div>
        </div>
        {/* Fade overlay */}
        <div className="absolute bottom-10 left-0 right-0 h-1/3 bg-linear-to-t from-background from-30% via-background/50 to-transparent pointer-events-none rounded-2xl" />
      </div>

      {/* ----------------------------------Features section---------------------------------- */}
      <MaxWidthWrapper className="py-15 relative z-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="Features" />
            <h2 className="text-center text-3xl md:text-5xl leading-tight font-medium font-heading text-foreground mt-6">
              Everything your onboarding {" "}
              <span className="bg-linear-to-r from-white to-blue-500 bg-clip-text text-transparent">
                needs
              </span>
              . And more
            </h2>
            <p className="text-sm md:text-xl mt-4 text-center text-accent-foreground max-w-lg">
              Use the full suite or just the pieces you want. One script tag, done.
            </p>
          </div>
        </AnimationContainer>
        <AnimationContainer delay={0.2}>
          <BentoGrid className="py-8">
            {CARDS.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* ----------------------------------CTA section---------------------------------- */}
      <MaxWidthWrapper className="my-15 pb-80 max-w-[80vw] overflow-x-hidden scrollbar-hide">
        <AnimationContainer delay={0.1}>
          <LampContainer>
            <div className="flex flex-col items-center justify-center relative w-full text-center max-w-3xl">
              <h2 className="text-3xl md:text-5xl pt-7 bg-clip-text text-center leading-tight font-medium font-heading tracking-tight">
                Ready to ship?
              </h2>
              <p className="text-sm md:text-xl text-accent-foreground mt-4 max-w-md mx-auto">
                Grab your API key and integrate in minutes. Free forever for most apps.
              </p>
              <div className="mt-6">
                <Button>
                  Get your API key
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </LampContainer>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* ----------------------------------Footer---------------------------------- */}
      <Footer/>
    </>
  );
};

export default LandingPage;
