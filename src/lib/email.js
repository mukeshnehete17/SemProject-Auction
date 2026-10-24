/**
 * Provider-based email service for TORI Auction Marketplace.
 * Integrates directly with Resend HTTP API (zero external SDK bloat).
 * Fallback gracefully records operational logs when unconfigured.
 */

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
}

export function getEmailSender() {
  return process.env.EMAIL_FROM || "TORI Auctions <notifications@resend.dev>";
}

function getAppBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Core email dispatcher using Resend API.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!isEmailConfigured()) {
    console.info(`[TORI Email] Delivery skipped (RESEND_API_KEY unconfigured). Target: <${to}>, Subject: "${subject}"`);
    return {
      success: false,
      configured: false,
      reason: "RESEND_API_KEY environment variable not configured",
    };
  }

  const from = getEmailSender();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[TORI Email] Resend API error:", data);
      return {
        success: false,
        configured: true,
        error: data.message || "Failed to send email via Resend",
      };
    }

    console.info(`[TORI Email] Message delivered via Resend. ID: ${data.id} to <${to}>`);
    return {
      success: true,
      configured: true,
      messageId: data.id,
    };
  } catch (err) {
    console.error("[TORI Email] Network error sending email:", err);
    return {
      success: false,
      configured: true,
      error: err.message || "Network error",
    };
  }
}

/**
 * Base email layout matching TORI brand identity (B&W + restrained purple).
 */
function wrapEmailTemplate({ title, preheader, bodyHtml, ctaText, ctaUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; color: #18181b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; }
    .header { background: #09090b; padding: 24px 32px; color: #ffffff; }
    .logo { font-size: 20px; font-weight: 900; letter-spacing: -0.05em; color: #ffffff; text-decoration: none; }
    .accent { color: #6366f1; }
    .content { padding: 32px; line-height: 1.6; font-size: 14px; }
    .btn { display: inline-block; background: #09090b; color: #ffffff !important; padding: 12px 24px; font-weight: 600; text-decoration: none; border-radius: 8px; margin: 20px 0; font-size: 14px; }
    .footer { padding: 24px 32px; background: #f4f4f5; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${getAppBaseUrl()}" class="logo">TORI<span class="accent">.</span></a>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; color: #09090b;">${title}</h2>
      ${bodyHtml}
      ${ctaText && ctaUrl ? `<p><a href="${ctaUrl}" class="btn">${ctaText} &rarr;</a></p>` : ""}
    </div>
    <div class="footer">
      <p style="margin: 0;">TORI Online Auction Marketplace &bull; Automated notification. Do not reply directly.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. User Outbid Notification
 */
export async function sendOutbidEmail({ to, userName, auctionTitle, auctionId, newHighestBid }) {
  const url = `${getAppBaseUrl()}/auctions/${auctionId}`;
  const subject = `You've been outbid on "${auctionTitle}"`;
  const bodyHtml = `
    <p>Dear ${userName || "Collector"},</p>
    <p>Another bidder has placed a higher bid of <strong>₹${newHighestBid.toLocaleString("en-IN")}</strong> on <strong>${auctionTitle}</strong>.</p>
    <p>The auction is still active. Visit the auction room now if you wish to place a counter-bid before the hammer falls.</p>
  `;
  return sendEmail({
    to,
    subject,
    html: wrapEmailTemplate({
      title: "Outbid Alert",
      bodyHtml,
      ctaText: "Increase Your Bid",
      ctaUrl: url,
    }),
    text: `You have been outbid on "${auctionTitle}". The current highest bid is ₹${newHighestBid}. Counter-bid here: ${url}`,
  });
}

/**
 * 2. Auction Ending Soon Notification
 */
export async function sendEndingSoonEmail({ to, userName, auctionTitle, auctionId, currentBid, endTime }) {
  const url = `${getAppBaseUrl()}/auctions/${auctionId}`;
  const subject = `Ending Soon: "${auctionTitle}"`;
  const bodyHtml = `
    <p>Dear ${userName || "Collector"},</p>
    <p>An auction on your watchlist, <strong>${auctionTitle}</strong>, is entering its final hours.</p>
    <p>Current Standing Bid: <strong>₹${currentBid.toLocaleString("en-IN")}</strong></p>
    <p>Ensure you are in the auction room to secure this lot before time runs out.</p>
  `;
  return sendEmail({
    to,
    subject,
    html: wrapEmailTemplate({
      title: "Final Hours Alert",
      bodyHtml,
      ctaText: "Enter Auction Room",
      ctaUrl: url,
    }),
    text: `Auction ending soon: "${auctionTitle}". Current bid: ₹${currentBid}. View lot: ${url}`,
  });
}

/**
 * 3. Auction Won Notification (Buyer)
 */
export async function sendAuctionWonEmail({ to, userName, auctionTitle, auctionId, winningAmount }) {
  const url = `${getAppBaseUrl()}/dashboard/won-auctions`;
  const subject = `Congratulations! You won "${auctionTitle}"`;
  const bodyHtml = `
    <p>Dear ${userName || "Winner"},</p>
    <p>The hammer has fallen. You are the winning bidder for <strong>${auctionTitle}</strong> with a final bid of <strong>₹${winningAmount.toLocaleString("en-IN")}</strong>.</p>
    <p>Your item has been recorded in your buyer portfolio. Review details and proceed with lot fulfillment on your dashboard.</p>
  `;
  return sendEmail({
    to,
    subject,
    html: wrapEmailTemplate({
      title: "Lot Won Confirmation",
      bodyHtml,
      ctaText: "View Won Lots",
      ctaUrl: url,
    }),
    text: `Congratulations! You won "${auctionTitle}" with a final bid of ₹${winningAmount}. View here: ${url}`,
  });
}

/**
 * 4. Seller Auction Ended Notification
 */
export async function sendSellerAuctionEndedEmail({
  to,
  sellerName,
  auctionTitle,
  auctionId,
  winnerName,
  winningAmount,
  bidCount,
}) {
  const url = `${getAppBaseUrl()}/dashboard/my-auctions`;
  const subject = `Auction Completed: "${auctionTitle}"`;
  const bodyHtml = winnerName
    ? `
    <p>Dear ${sellerName || "Consignor"},</p>
    <p>Your auction lot <strong>${auctionTitle}</strong> has officially concluded with <strong>${bidCount} total bids</strong>.</p>
    <p>The winning bidder is <strong>${winnerName}</strong> with a final valuation of <strong>₹${winningAmount.toLocaleString("en-IN")}</strong>.</p>
  `
    : `
    <p>Dear ${sellerName || "Consignor"},</p>
    <p>Your auction lot <strong>${auctionTitle}</strong> has concluded without receiving any valid bids.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: wrapEmailTemplate({
      title: "Consignment Completed",
      bodyHtml,
      ctaText: "Manage Your Auctions",
      ctaUrl: url,
    }),
    text: winnerName
      ? `Your auction "${auctionTitle}" concluded. Winner: ${winnerName} for ₹${winningAmount}.`
      : `Your auction "${auctionTitle}" concluded with no bids.`,
  });
}

/**
 * 5. Password Reset Request Email
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = "Reset your TORI Account Password";
  const bodyHtml = `
    <p>We received a request to reset the password for your TORI account.</p>
    <p>This single-use link is valid for <strong>30 minutes</strong>. If you did not initiate this request, you can safely disregard this message; your account credentials remain unchanged.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: wrapEmailTemplate({
      title: "Password Recovery",
      bodyHtml,
      ctaText: "Reset Account Password",
      ctaUrl: resetUrl,
    }),
    text: `Reset your TORI account password using this link (expires in 30 minutes): ${resetUrl}`,
  });
}
