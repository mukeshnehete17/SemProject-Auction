import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import {
  Target,
  Users,
  Shield,
  Zap,
  Heart,
  Award,
  ArrowUpRight,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Verified Origin",
    description:
      "Every lot is backed by rigorous authentication and condition assessment before auction launch.",
  },
  {
    icon: Target,
    title: "Radical Transparency",
    description:
      "Real-time bid ledger ensures every participant has equal, immediate visibility into price formation.",
  },
  {
    icon: Users,
    title: "Curated Community",
    description:
      "A collective of serious collectors, verified sellers, and technology enthusiasts across India.",
  },
  {
    icon: Zap,
    title: "Zero-Latency Architecture",
    description:
      "Engineered for sub-second bidding synchronisation, immediate push alerts, and high-frequency auctions.",
  },
  {
    icon: Heart,
    title: "Uncompromising Fairness",
    description:
      "Strict anti-sniping timers and automated bidding safeguards prevent unfair last-second manipulation.",
  },
  {
    icon: Award,
    title: "Curatorial Excellence",
    description:
      "We prioritize rare, distinctive, and high-demand electronics and collectible lots over volume.",
  },
];

const team = [
  {
    name: "Krishna Patel",
    role: "Founder & Lead Engineer",
    bio: "Passionate about full-stack systems architecture, real-time transaction protocols, and digital marketplace design.",
    initials: "KP",
  },
  {
    name: "Aryan Sharma",
    role: "Co-Founder & Operations",
    bio: "Strategist focused on logistics, seller provenance validation, and auction consignment pipelines.",
    initials: "AS",
  },
  {
    name: "Priya Deshmukh",
    role: "Lead Product Designer",
    bio: "Creative lead shaping the editorial visual language, micro-interactions, and bidder experience of TORI.",
    initials: "PD",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Editorial Header with Floating Glass Navbar */}
      <div className="bg-zinc-950 text-white border-b border-zinc-900">
        <Navbar />
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              The Story & Ethos
            </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            About TORI
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Pioneering transparent digital auction commerce for rare electronics, hardware, and certified lots.
          </p>
        </div>
      </section>
      </div>

      {/* Mission & Metrics Split Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
                Our Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 leading-tight">
                Democratizing access to high-value price discovery.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                TORI was created to eliminate opacity from online auctions. We believe that collectors and consignors deserve a high-fidelity platform where price formation happens openly, authenticated lots are guaranteed, and competitive auctions feel as exhilarating as an in-person auction house.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                By pairing editorial design with modern real-time database transactions, TORI elevates college semester engineering into an enterprise-grade digital auction environment.
              </p>
            </div>

            <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200/90 rounded-2xl p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-zinc-950 tracking-tight">1,250+</p>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Verified Bidders</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-zinc-950 tracking-tight">320+</p>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Curated Drops</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-zinc-950 tracking-tight">950+</p>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Hammer Closes</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black font-mono text-indigo-600 tracking-tight">₹50L+</p>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Settled Volume</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              Principles
            </span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-1">
              Core Tenets of Our Platform
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              The non-negotiable operational standards governing every transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-zinc-200/90 p-7 hover:border-zinc-300 hover:shadow-xs transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 mb-2 tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              Leadership
            </span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-1">
              Meet the Founders
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              The team architecting the next generation of online auction marketplaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto text-lg font-bold font-mono">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-wider text-indigo-600 mt-0.5">
                    {member.role}
                  </p>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-zinc-950 text-white border-t border-zinc-900 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Join the TORI Marketplace
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Experience fair, transparent, and certified auctions today.
          </p>
          <div className="pt-2">
            <Button href="/register" variant="accent" size="lg" className="group">
              <span>Create Account</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
