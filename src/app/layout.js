import "./globals.css";
import Providers from "@/components/layout/Providers";

export const metadata = {
  title: "TORI — Bid. Compete. Win.",
  description: "Online Auction Platform — Discover unique products, place competitive bids, and win auctions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
