import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HowItWorksFAQ from "@/components/auction/HowItWorksFAQ";
import {
  Search,
  UserCheck,
  Gavel,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Authenticate Your Identity",
    description:
      "Register a complimentary TORI account. Choose between buyer collector privileges or verified seller consignment status.",
  },
  {
    number: "02",
    icon: Search,
    title: "Inspect Catalogue & Lots",
    description:
      "Explore curated auctions with high-resolution imagery, verified provenance, opening reserves, and remaining countdown clocks.",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Execute Real-Time Bids",
    description:
      "Place bids using real-time transactions. The platform guarantees fair competition with instant outbid alerts and anti-sniping rules.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Settle & Receive Certified Lot",
    description:
      "When the auction clock expires, the leading bidder claims the item through protected escrow settlement and tracked delivery.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Editorial Header with Floating Glass Navbar */}
      <div className="bg-zinc-950 text-white border-b border-zinc-900">
        <Navbar />
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3">
              Bidding Mechanics & Rules
            </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            How TORI Operates
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about navigating the online auction marketplace, bidding protocols, and winning lots.
          </p>
        </div>
      </section>
      </div>

      {/* 4-Step Process Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-8 sm:p-10 relative transition-all duration-300 hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                      <Icon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <span className="text-4xl font-mono font-bold text-zinc-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-950 mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Guarantees Strip */}
      <section className="py-14 bg-zinc-950 text-white border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2 border-l-0 md:border-l border-zinc-800 md:pl-6">
              <ShieldCheck className="h-5 w-5 text-indigo-400 mx-auto md:mx-0" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Certified Authentication
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every listed lot is reviewed for verified specifications and accurate condition disclosures.
              </p>
            </div>
            <div className="space-y-2 border-l-0 md:border-l border-zinc-800 md:pl-6">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 mx-auto md:mx-0" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Anti-Sniping Safeguards
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Auctions receiving last-minute bids extend dynamically so every collector has an authentic fair chance.
              </p>
            </div>
            <div className="space-y-2 border-l-0 md:border-l border-zinc-800 md:pl-6">
              <UserCheck className="h-5 w-5 text-indigo-400 mx-auto md:mx-0" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Zero Hidden Buyer Premiums
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                What you bid is the hammer valuation. Transparent escrow settlement with direct seller fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-zinc-950 mt-1">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Clear answers to the most common bidding and consignment questions.
            </p>
          </div>
          <HowItWorksFAQ />
        </div>
      </section>

      {/* Closing Callout */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Ready to participate?
          </h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Create your account in seconds and place your first bid on an active lot today.
          </p>
          <div className="pt-2">
            <Button href="/register" variant="primary" size="lg" className="group">
              <span>Create Free Account</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
