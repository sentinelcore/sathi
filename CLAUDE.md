# Sathi — Claude Code Context File

> READ THIS FIRST. This file tells you everything about the project so you can
> pick up exactly where we left off without losing context.

---

## What is Sathi?

**Sathi** (साथी = companion) is a health companion PWA for elderly parents in India,
built specifically so NRI (Non-Resident Indian) children abroad can remotely monitor
their parents' health daily.

**Two users, one app:**
- 👴 **Elderly parent in India** — opens on mobile browser (PWA), phone OTP login,
  takes photo of health device → AI reads it → done
- 🧑‍💻 **NRI child abroad** — web dashboard, sees daily AI health summaries, charts,
  alerts, manages subscription

---

## Current State (as of 2026-03-18)

**Phase 1 MVP is fully coded and pushed to git.**
**Not yet deployed — needs env vars + Supabase project + Vercel.**

### What's built ✅
- Next.js 14 PWA (App Router) — no separate mobile app needed
- Supabase schema + full RLS (see `supabase/migrations/001_initial.sql`)
- Auth: phone OTP for elder (Supabase + Twilio), email/password for NRI
- Elder UI: daily check-in, photo→Claude OCR for health readings, SOS button
- NRI Dashboard: parent health cards, AI summaries, charts, invite parent, alerts
- API routes: OCR, health readings, daily summary, SMS+email delivery, Razorpay
- Razorpay: 3 plans (Base ₹999, Standard ₹2499, Premium ₹4999/month)
- SMS (Twilio) + HTML email (Resend) daily summary delivery
- Claude Vision OCR: elder takes photo of any device → AI extracts the reading

### What's NOT done yet ❌
- Supabase project not created (no real DB yet)
- Vercel deployment not done
- `.env` not filled in (see `.env.example`)
- `health-photos` Supabase Storage bucket not created
- Supabase phone auth not enabled
- Razorpay webhook not registered
- No cron job for daily summary generation yet
- WhatsApp delivery (Phase 2 — Puppeteer automation)
- Hindi/vernacular language support (Phase 2)
- BLE device sync (Phase 3)

---

## Stack

```
Framework:    Next.js 14 (App Router) — PWA
Database:     Supabase (PostgreSQL + Auth + Storage + Realtime)
AI:           Claude API — claude-sonnet-4-6 (Vision OCR + summaries)
              claude-haiku-4-5-20251001 (companion chat)
SMS:          Twilio
Email:        Resend
Payments:     Razorpay (INR, UPI, cards)
Deployment:   Vercel
```

---

## Project Structure

```
sathi/
├── app/
│   ├── (elder)/              ← Elder parent UI (large font, mobile-first)
│   │   ├── home/             ← Daily check-in home screen
│   │   └── checkin/          ← Photo capture → OCR → save reading
│   ├── (nri)/                ← NRI child dashboard
│   │   ├── dashboard/        ← Main dashboard with parent health cards
│   │   └── settings/         ← Profile + subscription management
│   ├── auth/
│   │   ├── login/            ← Unified login (detects role, shows phone or email)
│   │   ├── onboarding/       ← 3-step onboarding (name, DOB, conditions)
│   │   └── callback/         ← Supabase auth callback
│   └── api/
│       ├── ai/ocr/           ← POST: Claude Vision extracts reading from photo
│       ├── ai/summary/       ← POST: generate + deliver daily health summary
│       ├── health/readings/  ← GET/POST: health data CRUD
│       ├── notifications/send/ ← POST: SOS + alert SMS
│       ├── payments/create-order/ ← POST: Razorpay order
│       ├── payments/webhook/ ← POST: Razorpay webhook → activate subscription
│       ├── families/         ← GET/POST: family links + invite parent
│       └── auth/complete-profile/ ← POST: finish onboarding + link invite token
├── components/
│   ├── elder/  CheckInCard, SOSButton
│   └── nri/    NRINav, ParentHealthCard, HealthChart, AlertsBanner,
│               SubscriptionBanner, InviteParentModal
├── lib/
│   ├── supabase/client.ts    ← Browser Supabase client
│   ├── supabase/server.ts    ← Server Supabase client + service role client
│   ├── claude/index.ts       ← extractHealthReading(), generateDailySummary(), companionChat()
│   ├── twilio/index.ts       ← sendSMS(), formatDailySummaryForSMS()
│   ├── resend/index.ts       ← sendDailySummaryEmail(), sendInviteEmail()
│   ├── razorpay/index.ts     ← createOrder(), verifyPaymentSignature(), PLANS config
│   └── utils.ts              ← cn(), HEALTH_RANGES, METRIC_ICONS, formatDate()
├── supabase/migrations/001_initial.sql  ← Full DB schema, run this in Supabase
├── middleware.ts             ← Route protection + auth redirect
├── .env.example              ← All env vars needed
└── SATHI_PROJECT_PLAN.md     ← Full business + technical plan
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends auth.users — role (nri_child / elderly_parent), conditions |
| `families` | Links NRI child → elderly parent, stores invite tokens |
| `health_readings` | All health data — BP, glucose, SpO2, weight, steps |
| `medications` | Medication list + reminder schedule per parent |
| `daily_summaries` | AI-generated daily summaries with health score |
| `alerts` | Abnormal reading + SOS alerts shown on NRI dashboard |
| `subscriptions` | Razorpay subscription state per NRI user |

---

## Environment Variables Needed

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude (Anthropic)
ANTHROPIC_API_KEY=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend (Email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@sathi.health

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Run dev server
npm run dev

# App runs at http://localhost:3000
# Elder login:  http://localhost:3000/auth/login (choose "I am the parent")
# NRI login:    http://localhost:3000/auth/login (choose "I am the family member")
```

---

## Deployment Checklist (Do This to Go Live)

```
[ ] 1. Go to supabase.com → New project
[ ] 2. SQL Editor → paste and run supabase/migrations/001_initial.sql
[ ] 3. Storage → New bucket → name: "health-photos" → Public: ON
[ ] 4. Authentication → Providers → Phone → enable → add Twilio SID + Token
[ ] 5. Get: Project URL, anon key, service role key
[ ] 6. Fill in .env.local with all keys
[ ] 7. vercel deploy (or connect GitHub repo to Vercel)
[ ] 8. Add all env vars in Vercel dashboard (Settings → Environment Variables)
[ ] 9. Razorpay dashboard → Webhooks → add: https://your-app.vercel.app/api/payments/webhook
       Events: payment.captured, subscription.cancelled
[  ] 10. Test: NRI signup → invite parent → parent OTP login → check-in → view on dashboard
```

---

## Key Business Decisions

| Decision | What we chose | Why |
|---|---|---|
| App type | Next.js PWA (no native app) | No app store, works on any phone browser |
| Elder login | Phone OTP | Simplest for elderly — no passwords |
| Health data entry | Photo → Claude Vision OCR | No BLE/pairing complexity for elderly |
| Languages | English first | Ship fast, add Hindi/Tamil/Telugu later |
| Notifications | SMS + Email | No WhatsApp API approval delays |
| WhatsApp | Phase 2 via Puppeteer (personal number) | Avoid Meta API approval |
| Payments | Razorpay | INR + UPI, India-first |
| Pricing | ₹999 / ₹2,499 / ₹4,999 per month | Base / Standard / Premium |

---

## Immediate Next Features to Build

### High priority
- [ ] **Daily summary cron** — Supabase Edge Function or Vercel cron at 8pm IST
      calling `/api/ai/summary` for each active parent
- [ ] **Companion chat UI** — chat interface on elder home screen using `lib/claude/companionChat()`
- [ ] **Medication tracking** — elder marks medications as taken/missed, NRI sees compliance
- [ ] **Weekly PDF report** — generate downloadable report for NRI
- [ ] **Push notifications** — browser push for NRI dashboard (Service Worker already has PWA base)

### Phase 2
- [ ] **WhatsApp delivery** — Puppeteer script that sends the daily summary via
      web.whatsapp.com from a personal number (run as Vercel serverless or separate server)
- [ ] **Hindi language support** — Claude responses + UI in Hindi
- [ ] **Multi-language onboarding** — detect phone locale, show onboarding in local language

---

## Health Ranges Reference (for AI context)

```
Blood Pressure:  Normal < 120/80 | Elevated 120-139/80-89 | High ≥ 140/90
Blood Glucose:   Fasting: Normal < 100 | Pre-diabetic 100-125 | Diabetic ≥ 126 mg/dL
SpO2:            Normal ≥ 95% | Concerning < 95% | Critical < 90%
Heart Rate:      Normal 60-100 bpm
```

---

## Important Code Locations

| What | Where |
|---|---|
| Claude OCR prompt | `lib/claude/index.ts` → `extractHealthReading()` |
| Daily summary prompt | `lib/claude/index.ts` → `generateDailySummary()` |
| Razorpay plan config | `lib/razorpay/index.ts` → `PLANS` constant |
| Health normal ranges | `lib/utils.ts` → `HEALTH_RANGES` |
| DB schema | `supabase/migrations/001_initial.sql` |
| Elder check-in flow | `app/(elder)/checkin/page.tsx` |
| NRI dashboard | `app/(nri)/dashboard/NRIDashboardClient.tsx` |

---

## Full Business Plan
See `SATHI_PROJECT_PLAN.md` for the complete plan including market research,
competitive analysis, pricing strategy, marketing plan, and revenue projections.
