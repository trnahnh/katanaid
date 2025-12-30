import { Button } from "@/components/ui/button";
import { ArrowRightIcon, LucideSearch, LucideSearchCode } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardImg from "@/assets/dashboard-example.png";

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col justify-center pt-10 md:pt-20 items-center">
        <Button variant="outline" className="group overflow-hidden rounded-2xl">
          Check for deepfake
          <LucideSearch className="group-hover:hidden transition-all" />
          <LucideSearchCode className="hidden group-hover:block transition-all" />
        </Button>
        <h1 className="font-bold text-7xl text-center mt-5 max-w-2xl leading-24">
          Cut through{" "}
          <span className="bg-linear-to-r from-purple-500 to-pink-300 drop-shadow-[0_0_5px_rgba(190,10,190,1)] bg-clip-text text-transparent">
            Deepfake
          </span>{" "}
          Content with{" "}
          <span className="bg-linear-to-r from-blue-500 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_9px_rgba(60,130,240,0.8)]">
            Precision
          </span>
        </h1>
        <div className="text-center mt-6">
          <p className="text-md max-w-xl">
            Upload any image, video or audio. Get instant verification. <br />
            Let{" "}
            <span className="bg-linear-to-r from-blue-500 to-white bg-clip-text text-transparent">
              <b>AI-powered analysis 🔎</b>
            </span>{" "}
            catch what the eye can't.
            <br />
            Completely for{" "}
            <span className="bg-linear-to-r from-white to-amber-400 bg-clip-text text-transparent">
              <b>free ✨!</b>
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button asChild>
            <Link to="/dashboard" className="flex items-center">
              Start verifying for free
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Image Gallery - Bento Grid */}
      <div className="relative pt-20 pb-20 px-4 w-full max-w-5xl mx-auto">
        {/* Glow behind grid */}
        <div className="absolute inset-10 bg-blue-500/40 blur-3xl rounded-full pointer-events-none" />
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
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-background from-30% via-background/50 to-transparent pointer-events-none" />
      </div>
    </>
  );
};

export default LandingPage;
