// Shared pure helper: decides whether a seed run must refuse.
// NODE_ENV=production seeding is blocked unless the operator sets the
// deliberate override documented in docs/supabase-migration.md.
const PROD_SEED_OVERRIDE = "i-understand-data-loss";

function isProductionSeedBlocked(env) {
  const source = env || process.env;
  return (
    source.NODE_ENV === "production" &&
    source.ALLOW_PROD_SEED !== PROD_SEED_OVERRIDE
  );
}

module.exports = { isProductionSeedBlocked, PROD_SEED_OVERRIDE };
