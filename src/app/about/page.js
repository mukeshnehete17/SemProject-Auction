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
} from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Every transaction is secured with industry-standard encryption and verification processes.",
  },
  {
    icon: Target,
    title: "Transparency",
    description:
      "Real-time bid tracking ensures every participant has equal visibility into the auction.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join thousands of active bidders and sellers across India who trust TORI.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We continuously improve our platform with new features and cutting-edge technology.",
  },
  {
    icon: Heart,
    title: "Fairness",
    description:
      "Our system ensures equal opportunity for all bidders with anti-sniping protection.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for the best user experience in every interaction on our platform.",
  },
];

const team = [
  {
    name: "Krishna Patel",
    role: "Founder & Developer",
    bio: "Passionate about building technology that connects people through fair and transparent commerce.",
    color: "bg-indigo-600",
    initials: "KP",
  },
  {
    name: "Aryan Sharma",
    role: "Co-Founder",
    bio: "Expert in business strategy and operations with a vision to revolutionize online auctions in India.",
    color: "bg-emerald-600",
    initials: "AS",
  },
  {
    name: "Priya Deshmukh",
    role: "UI/UX Designer",
    bio: "Creative designer focused on crafting intuitive and beautiful user experiences.",
    color: "bg-rose-600",
    initials: "PD",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">About TORI</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Building the future of online auctions in India
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                TORI was created to make online auctions accessible,
                transparent, and exciting for everyone in India. We believe that
                everyone should have the opportunity to discover unique products
                and get great deals through fair competitive bidding.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">1,250+</p>
                <p className="text-sm text-gray-600 mt-1">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">320+</p>
                <p className="text-sm text-gray-600 mt-1">Live Auctions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">950+</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">₹50L+</p>
                <p className="text-sm text-gray-600 mt-1">Total Volume</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-2 text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Meet the Team</h2>
            <p className="mt-2 text-gray-600">
              The people behind TORI
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="text-center"
              >
                <div
                  className={`h-20 w-20 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-2xl font-bold text-white">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-indigo-600 font-medium mt-1">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Join TORI Today
          </h2>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">
            Be part of India&apos;s fastest growing auction platform.
          </p>
          <div className="mt-8">
            <Button href="/register" variant="primary" size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
