import { EventEmitter } from "events";

// Global singleton event emitter so it persists across module reloads in dev and runtime
const globalForEvents = globalThis;

if (!globalForEvents.__toriAuctionEmitter) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(200);
  globalForEvents.__toriAuctionEmitter = emitter;
}

const auctionEmitter = globalForEvents.__toriAuctionEmitter;

export function broadcastAuctionUpdate(auctionId, data) {
  try {
    const channel = `auction:${Number(auctionId)}`;
    auctionEmitter.emit(channel, data);
  } catch (err) {
    console.error(`[TORI Live] Broadcast error for auction ${auctionId}:`, err);
  }
}

export function subscribeToAuction(auctionId, callback) {
  const channel = `auction:${Number(auctionId)}`;
  auctionEmitter.on(channel, callback);
  return () => {
    auctionEmitter.off(channel, callback);
  };
}
