import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HowItWorksFAQ from "@/components/auction/HowItWorksFAQ";
import {
  Search,
  UserCheck,
  Gavel,
  Clock,
  Trophy,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Create Your Account",
    description:
      "Sign up for free and choose whether you want to bid on items or sell your own products.",
  },
  {
    number: "02",
    icon: Search,
    title: "Find Something You Love",
    description:
      "Browse through hundreds of active auctions. Use filters to find exactly what you're looking for.",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Place Your Bid",
    description:
      "Enter your bid amount. Our platform ensures fair bidding with real-time updates.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Win & Collect",
    description:
      "If you're the highest bidder when the auction ends, you win! Arrange payment and delivery.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">How It Works</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about bidding on TORI
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col md:flex-row items-start gap-6 md:gap-10"
                >
                  <div className="flex items-center gap-4 md:w-64 shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Icon className="h-7 w-7 text-indigo-600" />
                    </div>
                    <span className="text-4xl font-bold text-gray-200">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Common Questions
            </h2>
            <p className="mt-2 text-gray-600">
              Quick answers to get you started
            </p>
          </div>
          <HowItWorksFAQ />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-3 text-gray-600">
            Join TORI today and start winning amazing auctions.
          </p>
          <div className="mt-8">
            <Button href="/register" variant="primary" size="lg">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
