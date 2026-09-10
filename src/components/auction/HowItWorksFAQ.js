"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is it free to register?",
    answer:
      "Yes, creating an account on TORI is completely free.",
  },
  {
    question: "How do I know if I've been outbid?",
    answer:
      "You'll receive notifications when someone places a higher bid.",
  },
  {
    question: "What happens when I win?",
    answer:
      "You'll be notified and can arrange payment with the seller.",
  },
  {
    question: "Can I sell items on TORI?",
    answer:
      "Yes! Switch to a seller account and create your first auction.",
  },
];

export default function HowItWorksFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">
              {faq.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? "max-h-40" : "max-h-0"
            }`}
          >
            <p className="px-6 pb-4 text-sm text-gray-600">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
