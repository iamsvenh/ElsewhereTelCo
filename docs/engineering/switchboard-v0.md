# The v0 Switchboard — work package

**Status: design spec for Sven's review, 2026-07-24.** Turns the single-option teaser line into a branching, instrumented, **LLM-free** switchboard — the first real version of the Operator/switchboard that eventually routes the whole universe. Everything here is pre-produced audio + TwiML + Postgres; **zero live inference** except the opt-in transfer to the live Devil.

Goals (Sven): make the first interaction **fun**, **maximize time on the line**, **maximize information captured per caller** (KPIs are the point), lift the interaction rate, and build it so it **extends** into the eventual real switchboard. Synthesized from three research legs (SMS/A2P compliance · engaging-IVR UX · KPI/event model) — sources cited at the bottom. **Nothing built yet** — this is for your redline + the open decisions in §10.

## 1. The problem (from last night's testing)

The current funnel is **linear and back-loaded**: ~56s of pitch, then one weak ask ("press 1 to be notified") at the very end, where attention has already thinned. This violates nearly every IVR drop-off principle: callers abandon during long preambles before they reach the prompt, and a cold end-of-monologue "subscribe" reads as a commitment ask, not play. (The signup-capture bug — now fixed — *also* ate the presses that happened, so past numbers undercount; but the design problem stands.)

## 2. The reframe: pitch → switchboard

Greet fast, offer choices **early**, lead with the **strongest hook**, make "subscribe" one of several exits. Every keypress is simultaneously an experience and a data point.

**The strongest hook we now have is the live Devil.** "To be connected to someone right now, press 1" beats "press 1 to be notified." Immediate value > deferred value, and it's technically almost free: the teaser line can **transfer the call** to the Devil (TwiML `<Dial>` / re-route to `/incoming-call`). That turns the teaser number from a mailing-list capture into a **live gateway to the product** — and live AI cost is incurred only when a caller chooses that branch.

## 3. The menu (v0 design)

**Principles (from the IVR-UX research), applied:**
- **Front-load the choice** — first key possible by **~8-10s**, not 56. Total time-to-action target **≤20s** (hard cap ~30).
- **Barge-in always on** — a caller who knows they want the Devil hits `1` over the opener and is connected (~200ms cut).
- **4 options, ideally not more** (auditory memory caps ~5). Plus **1 hidden** egg.
- **Label before key** — "For the Devil, press 1," not "press 1 for the Devil." Intent forms before the number lands.
- **Primacy/recency** — put the two highest-value actions at position **1 and last**.
- **Never dead-end** — on timeout/invalid, re-prompt in character, then fall through to a default (never a bare hangup).
- Intro ≤8s; each option line ≤4s (~8-12 words); cut *words*, not pace (the bored-operator cadence is on-brand).

**The menu (4 + hidden), ordered by value:**
1. **The Devil, live, now** — transfer to the Devil line. Primacy slot, the money option.
2. **"What is this place"** — short recorded explainer (audio cousin of the directory), buried mid-list (curious callers still find it); ends by offering the link.
3. **The link** — deliver the directory/site URL (recited now, SMS after 10DLC — see §4).
4. **Leave your number** — the mailing list (today's "press 1"), in the recency slot where it's best remembered.
- **Hidden (unannounced `0` or `★`)** — a bonus operator bit / a different voice / a "you weren't supposed to find that" line. Never announced. **This is the highest-leverage single element for the Stage-0 unprompted-sharing metric** ("listen to what it says when you press…").

**Fallbacks & pacing:**
- **No-input timeout ~5-7s** after the menu → **one** in-character nudge re-offering the top options ("Still on the line? Most people press 1."), not a scold.
- **Invalid key** → short character-consistent recovery ("That button does nothing here. It's 1 through 4.") → re-offer.
- **~2 retries, then fall through to a default** — open decision (§10): recite-the-URL + goodbye, or auto-connect to the Devil. I lean recite-URL (auto-connect spends live AI on a passive caller).
- **React in character the instant they press** ("Connecting you. Don't say I didn't warn you.") — the reward for interacting is *more personality, immediately*.
- **Vary the lines** — a small pool for opener/re-prompt/invalid, so repeat callers and hand-the-phone-around sharers get something new.

**Input mode: DTMF (keypad), not speech.** Four fixed options is textbook DTMF — reliable, accent/noise-proof, cheap, no ASR. Speech stays *inside* the persona call (the Realtime layer). ⚠️ **Rotary caveat:** true rotary phones can't send DTMF — the hardware stage will need a voice/timing branch fallback. Noted here and to carry into the hardware spec; irrelevant for Stage-0 (Twilio/smartphone callers).

**Script skeleton (placeholder copy — final VO written + approved locally):**
```
[OPENER ≤8s, barge-in on]
  "Elsewhere Telephone Company. You've reached the switchboard.
   I can see you want something. Let's not waste the line."
[MENU ≤16s, label-then-key, barge-in on]
  "To be connected to someone right now — press 1.
   To hear what this place is — press 2.
   To have the details sent to your phone — press 3.
   To leave your number and be rung back — press 4."
[NO-INPUT ~5-7s → one re-prompt]  "...Still there? Most people press 1."
[INVALID]                          "That button does nothing here. It's 1 through 4."
[FALL-THROUGH after ~2 tries]      → default (recite URL + goodbye, or auto-connect — §10)
[HIDDEN 0/★, unannounced]          → operator easter-egg bit
```

## 4. Follow-up & the link — SMS compliance

**For the first testers, don't send SMS — recite a short vanity URL aloud** (e.g. `elsewheretel.co/x`, a redirect we serve from the bridge). Zero compliance overhead, zero setup delay, and on-brand ("the operator will now recite your case number"). This unblocks everything *today*.

**When SMS is worth it** (clickable link in-hand, growing volume), the compliant path:
- **A2P 10DLC registration is mandatory** for SMS from our 806 number — unregistered long-code traffic is filtered/blocked. Register **Sole Proprietor** brand + campaign via Twilio Trust Hub → The Campaign Registry: **~\$4 brand + \$15 campaign (one-time) + ~\$2/mo**. **Approval up to ~5 business days** — the one scheduling dependency; register ~1 week ahead. Sole-Prop limits (1 msg/sec, 1,000/day T-Mobile) are ample.
- **Consent is easy:** a keypress requesting the link is valid express consent, and the text is **transactional** (a link they asked for) → the *lower* TCPA tier — **as long as there's zero marketing content in that message.**
- **Required SMS elements:** brand ("Elsewhere Telephone Co.") + link + "Msg & data rates may apply" + "Reply STOP to opt out, HELP for help." One segment. Keep Twilio **Advanced Opt-Out ON**. Log keypress + timestamp + number as the consent record.
- **Cost:** ~\$0.012-0.015/segment — negligible; the ~\$2/mo campaign fee dominates.
- **Toll-free is worse for us:** 2026 rules require an **EIN** for toll-free verification (hard blocker without one). Prefer Sole-Prop 10DLC.

The IVR line that offers the text ("press 3 for the link — msg & data rates may apply, reply STOP to opt out") doubles as the consent capture.

## 5. Measure everything — event log + KPIs

**Adopt an append-only event log as the source of truth**, not wide summary rows. For an explorable-world product, the *sequence and timing* between key-presses ARE the signal (which door first, how long they hesitated, did they come back). New menu options need zero schema change (just a new `node` string); every KPI is a `GROUP BY`. A derived **view** gives per-call convenience without dual-writes.

**Schema (drop-in migration when we build):**
```sql
create table if not exists switchboard_events (
  id            bigint generated always as identity primary key,
  call_sid      text        not null,               -- joins teaser_calls / calls
  caller_hash   text        not null,               -- HMAC(E.164, app-secret): the analytics key
  caller_number text,                               -- the ONLY PII; purged after 90d (see privacy)
  seq           int         not null,               -- event ordinal within the call
  event_type    text        not null,               -- see CHECK below
  node          text,                               -- menu/state id, path-style: root, root/hell, persona/devil
  digit         text,                               -- key pressed (for key_pressed)
  detail        jsonb       not null default '{}',   -- segment_id, persona, prompt_version, hangup_by, error…
  ms_since_prev   int,                              -- inter-event latency
  ms_since_prompt int,                              -- press latency since menu_presented → hesitation signal
  occurred_at   timestamptz not null default now(),
  constraint switchboard_events_type_chk check (event_type in (
    'call_started','menu_presented','key_pressed','invalid_key','input_timeout',
    'segment_played','segment_completed','transfer_initiated','transfer_connected',
    'sms_sent','subscribe','link_requested','menu_returned','hangup','call_ended'))
);
create unique index on switchboard_events (call_sid, seq);
create index on switchboard_events (event_type, occurred_at desc);
create index on switchboard_events (caller_hash, occurred_at);
create index on switchboard_events (node, event_type);
alter table switchboard_events enable row level security;  -- no policies: bridge (secret key) + Studio only
```
Plus a `switchboard_call_summary` view (per-call rollup: presses, nodes_visited, subscribed, connected, requested_link, exit_node) so the old wide-row convenience survives with zero dual-write.

**The KPIs that matter (definitions):**
- **`interaction_rate`** = calls with ≥1 keypress ÷ all calls. *The* top number: did the menu land at all.
- **`option_ctr(node,digit)`** = presses ÷ times that menu was presented. Demand per door.
- **drop-off heatmap by `node`** = where calls die (hangups ÷ entries per node).
- **conversion:** `connect_rate` · `subscribe_rate` · `link_request_rate` (per call and per menu-impression).
- **retention:** `repeat_caller_rate`, `return_within_7d`, `median_intercall_gap`.
- **"it's a WORLD" signals (instrument hardest):** `exploration_breadth` (distinct top-level districts a caller enters — >1 = they got it), `cross_call_novelty` (repeat callers picking a *different* door later), `post_experience_return` (menu-returns after a completed segment/connect = "what else is here"). These are the differentiator between "novelty gag" and "explorable world" — the exact Stage-0 question.

**Per-caller inference** (all keyed on `caller_hash`): an *interest vector* (which districts, weighted by follow-through), *hesitation* (median decision latency + fumbles → confused vs confident/returning), and a derived **caller-state ladder**: `new` → `browser` (pressed, no convert) → `explorer` (≥2 districts or returned-to-menu) → `converter` (subscribed/linked) → `regular` (≥3 calls). Explorer + regular = the world concept is landing.

**Privacy** (fits our rules cleanly): one PII field (`caller_number`); analytics run on `caller_hash` (HMAC, not reversible without the salt); **no audio/biometric data in this table** — it's keypad + timing only, so the no-voiceprint rule is *structurally* satisfied. 90-day purge of raw numbers (keep the hash so retention/organic metrics survive); add `caller_hash` to `seed_numbers` for cohort attribution post-purge; RLS-no-policies + `sb_secret` only, matching every other table. Interaction logging is the default consent tier (disclosed in-character + ToS), separate from the recording-publish opt-in.

Wire the funnel queries into `/switchboard-stats`; watch **`interaction_rate`, `exploration_breadth`, and the organic-cohort drop-off heatmap** first — those three answer "does the world read as a world."

## 6. Production checklist

Same pipeline as the shipped teaser (ElevenLabs "Elsewhere Operator" → telephone-master chain), no new tooling. Assets:
- One Operator VO clip **per menu node**: opener/menu, "what is this" explainer, link hand-off + spoken vanity URL, subscribe confirmation, no-input re-prompt, invalid-key line, goodbye, and the Devil-transfer hand-off ("connecting you to the down trunk, hold please").
- The hidden easter-egg clip(s), plus **line variants** (a small pool for opener/re-prompt/invalid).
- A reusable **follow-up copy library** (the "universal follow-up prose"): the spoken-URL script now; the compliant transactional SMS (brand + link + rates + STOP/HELP) for later.
- All authored/approved locally before deploy (teaser production discipline).

## 7. Extensibility → the real switchboard

Build the menu as **config-driven data**, not hardcoded TwiML: a tree of nodes, each `{ prompt_audio, options: { digit → action } }`, actions ∈ `play · dial_persona · deliver_link · subscribe · submenu · hangup`. Then v0 **is** the prototype of the universe switchboard: adding a world = add an option + a route; the establishing layer (vision §5c) slots in as threshold audio before each `dial_persona`; the event log already speaks in `node` paths (`root/hell`, `persona/devil`) that generalize to every district. "The switchboard is the world map," extensible from day one, still LLM-free (the tree is data; the bridge walks it).

## 8. Cost summary

- IVR prompts: pre-produced, **zero marginal**.
- Devil transfer: live AI **only on opt-in** (~\$0.14/mini-call) — that's the product.
- Twilio inbound ~\$0.0085/min; SMS (later) ~\$4 + \$15 one-time + ~\$2/mo + ~\$0.013/msg.
- Net: pennies until someone chooses the Devil.

## 9. Build phases

1. **Now (no registration needed):** the switchboard menu (1/2/4 + 0-egg), Devil transfer, **recite-URL** follow-up, the `switchboard_events` log + `/switchboard-stats`. Config-driven tree from the start.
2. **Fast-follow:** register Sole-Prop 10DLC; light up the SMS link branch (option 3) + consent capture.
3. **Later:** establishing-layer hooks; more worlds as menu options; rotary/voice-branch fallback in the hardware spec.

## 10. Open decisions for Sven

1. **Menu set & order** — ratify 1=Devil / 2=what-is-this / 3=link / 4=leave-number, plus a hidden egg? Or adjust.
2. **Is the live-Devil transfer the #1 option now**, or hold it until the Devil rebuild ships (he's still a rough draft — a bad first impression on the hook option cuts both ways)? Big one.
3. **Fall-through default** on repeated no-input: recite-URL + goodbye (my lean) vs auto-connect to the Devil.
4. **SMS now or recite-URL first?** Recommendation: recite-URL first, register 10DLC in parallel, add SMS as fast-follow.
5. **The hidden easter egg** — what's behind `0`/`★`? (Highest-leverage fun element for the sharing metric.)
6. **Greenlight to build phase 1** once 1-5 are settled (migration + bridge menu + stats).

---

### Research sources
IVR UX: [ComputerTalk](https://www.computer-talk.com/blogs/ivr-best-practices) · [FitSmallBusiness](https://fitsmallbusiness.com/design-ivr/) · [UXPA Magazine](https://uxpamagazine.org/designing-great-voice-user-interfaces-more-than-creating-good-conversations/) · [Plivo](https://www.plivo.com/blog/ivr-best-practices/). Easter-egg/curiosity: [Phable](https://www.phable.io/phable-labs/the-art-of-brand-easter-eggs) · [AcrobatAnt](https://acrobatant.com/unleashing-the-power-of-easter-egg-marketing-engaging-your-audience-with-hidden-surprises/). DTMF vs speech: [Retell AI](https://www.retellai.com/blog/dtmf-vs-voice-recognition-when-to-use-retells-dual-tone). SMS/A2P: [Twilio 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc) · [Twilio Sole-Prop](https://www.twilio.com/en-us/blog/products/launches/sole-proprietor-api-and-console-experience-for-10dlc-registration) · [TCPA 2026](https://activeprospect.com/blog/tcpa-text-messages/). (Fees/timelines current mid-2026; verify in Console at registration.)
