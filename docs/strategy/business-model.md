# Business model & economics

**Status: v1 draft for Sven's redline, 2026-07-23.** How Elsewhere captures value and what it costs to deliver. Consolidates the revenue/pricing/economics threads from `concept.md` and `vision-world-company.md` into one home, and records the in-lore-sponsorship idea. Fundraising lives separately in [fundraising.md](fundraising.md); pre-launch traction in [go-to-market.md](go-to-market.md).

> The governing fiction (from the vision): **you don't buy AI minutes, you get a phone plan.** Every price is a tariff; every limit is a busy signal. No revenue mechanism ever breaks the fourth wall.

## 1. Revenue streams

Ordered floor-first (most certain, nearest-term) to upside.

| Stream | What it is | Stage | Margin shape |
| ------ | ---------- | ----- | ------------ |
| **Venue / event B2B** | short capped calls at events, bars, installations; \$/block or unit sale/rev-share to existing photo-booth & audio-guestbook vendors | near-term **revenue floor** | strong; calls are short and metered by the event |
| **Consumer subscription** (phone plan) | monthly plan dressed as a telco tariff — a rationed audience with the premium Residents, unmetered overworld | 2.1+ | the core LTV engine; margin depends on live-AI ratio (§4) |
| **Prepaid calling cards** | one-off / gift purchases; the calling-card artifact doubles as the shared-device identity key | 2.1+ | high; prepaid = cash up front, breakage |
| **Hardware & merch** | the vintage phone as portal + object: home units, the Yellow Pages, calling cards, tariff placards | 2.x+ | product margin; also the brand's soul (see vision §6a) |
| **In-lore native sponsorship** | brands woven into the fiction as period-authentic sponsor moments (§2) | 3+ (opt-in, curated) | very high; artisanal, low-volume, premium-priced |
| **Licensing / commissions** | Meow Wolf-shaped deals: physical portals into our universe, IP licensing, bespoke installations | 4+ | high; project-based |

## 2. In-lore native sponsorship (new — Sven, 2026-07-23)

Not banner ads, not interstitials. **Product placement woven into the lore**, in-character and in-register. The example: the Devil, mid-call, mutters "oh hell — Lizzy, did you forget to buy more Pepsi again?"

Why it fits Elsewhere specifically:

- **It's period-authentic.** Old radio serials were sponsor-branded by construction ("The Lux Radio Theatre," "brought to you by..."). The vintage-telco frame can carry vintage-radio sponsorship natively. The medium *expects* it.
- **It's diegetic, via the Management.** The company sells ad space; the Residents grumble about having to shill. The Devil resenting a mandated Pepsi plug is *funnier* than a clean ad — the resentment is the bit, and it routes through the diegetic-changelog frame (the Management decided; the Devil complies badly). The ad never breaks the deadpan because the complaint about the ad is *in* the deadpan.
- **It's premium, not volume.** A bespoke, genuinely funny in-world placement is a creative product a brand pays real money for — closer to a branded content deal than programmatic. Low volume, high price, artisanal. Fits the metered-depth ethos: scarce and good, never spammy.

Rules (non-negotiable, protect the world):

1. **Rare.** Too many placements and the world reads as for-sale, which kills the thing brands are paying to be near. Scarcity is the asset.
2. **In-character and in-register, always.** If it isn't funny or interesting in-world, it doesn't ship. The placement must survive the transcript-review bar like any other line.
3. **Brands that get the joke only.** The Devil endorsing you is edgy; that self-selects irreverent brands and repels the rest, which is correct. Curated, not open inventory.
4. **Never from a safety/wellbeing beat.** No sponsorship anywhere near the serious registers.

Status: a stage-3+ upside, recorded now so we design the frame to accommodate it (the Management-sells-adspace fiction is already load-bearing). Not built, not sold, until the world has an audience worth placing in.

## 3. The pricing fiction (how price = progression)

From the vision (§7, §8), consolidated:

- **Distance = depth = price.** Long-distance costs more; the deeper into a district you go, the more it costs; the direct line to the Devil is premium, the secretary is cheaper.
- **Loyalty unlocks cheaper access.** As a subscriber levels, they unlock the resident/local discount. Real telco (loyalty plans) and real game progression (grinding unlocks) in one fiction.
- **Metered depth, unmetered breadth.** The meter gates only the premium live-AI layer; the pre-produced overworld is explorable freely. "The Devil takes one audience per day on the basic plan" — Wordle-style scarcity as a retention ritual, not a damper.
- **Diegetic cost control.** Busy signals ARE rate limiting; "please deposit 25 cents" IS metering; off-peak rates ARE load shaping. The frame is the unfair advantage.

## 4. Unit economics & cost structure

The vision multiplies engagement hours; inference cannot scale linearly with them. Margin is governed by the **live-AI ratio** — how much of an engagement hour runs on premium live models vs. the cheaper layers.

**Per-call, measured (Stage 0, the Devil line):**
- `gpt-realtime-mini`, ~73% cached tokens → **≈ \$0.14 / call** (5-min cap).
- `gpt-realtime-2` runs ~3× the mini rate (audio tokens dominate). The bridge prices per-model (`PRICE_BY_MODEL`) and logs `cached_tokens` — silent cache failure is the \$0.24-vs-\$2.20 difference, so it's verified every call.

**The delivery spectrum (vision §8), cheapest carrying the most time:**
1. Premium live (realtime-2) — \$0.04-0.11/min. The boss encounters only.
2. Budget live (mini or cheaper, latency-tolerant) — minor Residents; latency baked in as character.
3. Pre-produced audio — near-zero marginal; the overworld, explorable for many minutes.
4. Print/web — zero marginal.

**Blended sketch:** a heavy player at 10 hrs/mo *pure-live* ≈ \$25-65 inference (unworkable). Same hours at a **20-30% live ratio** ≈ \$6-18 (workable under a subscription tariff). The whole production architecture exists to keep that ratio low *without* the world feeling cheap — the feeling comes first, the cost layers serve it.

**Cost ceiling discipline:** OpenAI project hard-capped at \$25/mo during Stage 0. The runtime persona config makes *model* a DB lever, which is also the seam a self-hosted open-weight model slots into at scale (a stage-4 margin lever — see [fundraising.md](fundraising.md)).

## 5. Open questions

- Consumer plan tiers and price points (once retention data exists) — what does "basic" vs. a deeper plan actually include?
- Prepaid card denominations and the breakage assumption.
- The venue B2B motion: sell/white-label units to existing rental vendors vs. run events directly — `concept.md` leans ride-existing-vendors for fastest volume.
- Whether economics graduates to its own doc once the model gets quantitative (currently folded here).
