# Sathi — Project Plan & AI Context File

> **AI CONTEXT NOTE:** This file is the single source of truth for the Sathi project. If your context is reset, read this file first to understand what has been built, what is in progress, and what comes next. Update the "Current Status" section after every significant work session.

---

## Table of Contents
1. [Vision & Problem Statement](#1-vision--problem-statement)
2. [Target Market & Market Research](#2-target-market--market-research)
3. [Product Overview](#3-product-overview)
4. [Device Ecosystem](#4-device-ecosystem)
5. [Feature Roadmap](#5-feature-roadmap)
6. [Technical Architecture](#6-technical-architecture)
7. [Business Model & Pricing](#7-business-model--pricing)
8. [Marketing Strategy](#8-marketing-strategy)
9. [Development Phases & Timeline](#9-development-phases--timeline)
10. [Current Status & Next Steps](#10-current-status--next-steps)
11. [Open Questions & Decisions Log](#11-open-questions--decisions-log)

---

## 1. Vision & Problem Statement

### Vision
**Sathi** (Hindi: साथी, meaning "companion") is an intelligent, friendly health companion app that empowers Non-Resident Indians (NRIs) to remotely monitor and manage the health and wellbeing of their elderly parents in India — giving both peace of mind and proactive care.

### The Problem
- ~30 million NRIs live abroad (US, UK, Canada, UAE, Australia, Singapore, etc.)
- Most have elderly parents (60+) living alone or with limited family support in India
- India has 140M+ people aged 60+; projected to reach 300M by 2050
- Key pain points:
  - **Distance anxiety**: NRIs cannot physically check in on aging parents daily
  - **Late detection**: Health emergencies (heart attacks, falls, diabetic episodes) often go unnoticed
  - **Communication gap**: Elderly parents don't always communicate health issues to avoid worrying children
  - **Complexity barrier**: Existing health apps are too complex for elderly, non-tech-savvy users
  - **Fragmentation**: Multiple devices, apps, and doctors with no single view
- No product today combines simplicity for elderly users + remote monitoring for NRI families

### The Solution
Sathi provides:
1. An **ultra-simple mobile app** for the elderly parent (large UI, voice guidance, vernacular language support)
2. A **web/mobile dashboard** for the NRI child to monitor in real time
3. **Daily AI-generated voice note + health report** delivered to the child (like a daily update from a caretaker)
4. Integration with **affordable OTC devices** (BP monitor, oximeter, glucometer, weighing scale)
5. Optional **wellness packages** (yoga, mental health, companionship, nutrition)

---

## 2. Target Market & Market Research

### Market Sizing

| Segment | Size |
|---|---|
| NRIs worldwide | ~32 million |
| NRIs with parents 60+ in India (est.) | ~12-15 million |
| Addressable early adopters (tech-savvy, income $50k+) | ~3-4 million |
| TAM (Total Addressable Market) at $20/month | ~$720M/year |
| SAM (Serviceable Addressable Market, Year 1-3) | ~$20-50M/year |

### Market Validation Signals
- **Remote patient monitoring (RPM)** global market: $175B by 2030 (CAGR 18%)
- **Indian digital health** market: $10B by 2025
- **Senior care tech** in India is extremely underpenetrated
- WhatsApp-first behavior among elderly Indians = strong voice/media consumption habits
- COVID-19 accelerated NRI concern for elderly parents → permanent behavioral shift
- Competitors: **None** with this exact positioning (NRI-to-India remote elderly care)
  - Adjacent: Portea (home care), Emoha (elderly care community), Apple Health, Fitbit
  - None combine NRI-focused remote monitoring + simplicity for elderly + AI summaries

### Competitive Landscape

| Product | Focus | Gap |
|---|---|---|
| Portea | Home nursing/care visits | No remote monitoring, no NRI dashboard |
| Emoha | Community for elderly | No health data, no NRI features |
| Apple Health/Fitbit | General fitness | Too complex, no family monitoring |
| Practo/1mg | Doctor appointments | No continuous monitoring |
| **Sathi** | **NRI remote monitoring + elderly simplicity** | **This gap is ours** |

### Target User Profiles

**User A — The NRI Child (Payer)**
- Age: 28–50
- Location: US, UK, Canada, UAE, Australia, Singapore
- Income: $60k–$200k+
- Pain: Guilt + anxiety about not being able to check on parents
- Behavior: Heavy WhatsApp user, willing to pay for peace of mind
- Motivation: "I just want to know my parents are okay every day"

**User B — The Elderly Parent (Primary User of app)**
- Age: 60–80
- Location: Tier 1 & Tier 2 cities in India
- Tech comfort: WhatsApp-level; resistant to complex apps
- Languages: Hindi, Tamil, Telugu, Kannada, Marathi, Gujarati, Bengali
- Health: Managing 1–3 chronic conditions (hypertension, diabetes, arthritis common)
- Motivation: "I don't want to worry my children, but I'd love a companion"

### Pricing Research & Willingness to Pay

Based on NRI spending patterns and comparable services:

| Tier | Monthly Price (INR) | Monthly Price (USD) | Target Segment |
|---|---|---|---|
| Base (App only) | ₹999/month | ~$12/month | Budget-conscious, test first |
| Standard (App + 2 devices) | ₹2,499/month | ~$30/month | Core market |
| Premium (App + full kit + wellness) | ₹4,999/month | ~$60/month | Affluent NRIs |
| Annual discount | 20% off | 20% off | Lock-in |

**NRIs pay in USD; parents' subscription managed from abroad.** This is a key UX feature — the NRI child signs up and pays; the parent just uses the app.

---

## 3. Product Overview

### Core App — For Elderly Parent (Mobile)
- **Ultra-simple UI**: Large text, large buttons, minimal screens
- **Voice-guided**: App speaks instructions aloud (in local language)
- **Daily health check-in**: Gentle reminders to take readings (BP, SpO2, glucose, weight)
- **Medication reminders**: Simple alarm + voice reminder
- **SOS button**: One-tap emergency alert to family + nearest emergency contact
- **Companion chat**: Simple AI chat (Claude-powered) in local language
- **Activity tracking**: Steps, sleep via phone sensors + wearables (no action needed from user)

### Dashboard — For NRI Child (Web + Mobile)
- **Daily digest**: AI-generated summary of parent's health (voice note + text)
- **Real-time alerts**: Abnormal readings, missed check-ins, SOS
- **Health trends**: Graphs of BP, glucose, SpO2, weight, steps over time
- **Multi-parent support**: Manage health of multiple family members
- **Care team**: Add siblings, local relatives, doctor contacts
- **Device management**: Link/manage connected devices remotely
- **Teleconsult**: Book video calls with doctors directly from dashboard

### AI Health Engine (Claude-powered)
- Analyze daily readings against age/condition norms
- Generate daily voice + text summaries in simple language ("Your father's BP was slightly high today, he should reduce salt...")
- Detect anomalies and trend deterioration early
- Answer health questions from both parent and child
- Generate weekly/monthly health reports (PDF)

---

## 4. Device Ecosystem

### Recommended OTC Devices (BLE-enabled)

| Device | Metric | Recommended Models | Price Range (INR) |
|---|---|---|---|
| Pulse Oximeter | SpO2, Heart Rate | iHealth Air, Wellue O2Ring, Contec | ₹1,500–3,000 |
| BP Monitor | Blood Pressure | Omron HEM-7156T, iHealth Track | ₹3,000–5,000 |
| Glucometer | Blood Glucose | Accu-Chek Instant S, OneTouch Select Plus | ₹2,000–4,000 |
| Smart Scale | Weight, BMI | Xiaomi Mi Scale 2, Healthifyme Smart Scale | ₹1,500–3,500 |
| Smart Wearable | Activity, HR, Sleep | Mi Band 8, Fitbit Inspire 3, Samsung Galaxy Fit 3 | ₹3,000–10,000 |

### Data Sources (No Hardware Required)
- **Smartphone sensors**: Steps (accelerometer), GPS activity, screen time (proxy for activity)
- **Apple HealthKit** (iOS): HR, steps, sleep, blood oxygen, ECG (Apple Watch)
- **Google Fit / Health Connect** (Android): Steps, sleep, HR
- **Samsung Health SDK**: Galaxy Watch data

### Device Integration Strategy
- BLE pairing via React Native (react-native-ble-plx)
- HealthKit / Health Connect SDK integration
- Device profiles stored in Supabase
- Readings synced in real-time to backend

---

## 5. Feature Roadmap

### Phase 0 — Foundation (Weeks 1–4)
- [ ] Project setup (monorepo: Next.js web + React Native app + Node backend)
- [ ] Supabase setup (auth, database schema, row-level security)
- [ ] User onboarding flow (NRI child signs up, invites parent)
- [ ] Basic profile: parent health profile (age, conditions, medications)
- [ ] CI/CD setup

### Phase 1 — MVP (Weeks 5–12)
**Goal: NRI child can monitor one parent's basic health daily**

- [ ] Parent app (React Native)
  - [ ] Splash + simple onboarding (language selection)
  - [ ] Daily check-in screen (manual entry: BP, glucose, SpO2, weight)
  - [ ] Medication reminder
  - [ ] SOS button
  - [ ] Steps via phone accelerometer

- [ ] NRI Dashboard (Next.js web)
  - [ ] Login + invite parent flow
  - [ ] Daily health summary card
  - [ ] Trend charts (7-day, 30-day)
  - [ ] Alert notifications (email + push)
  - [ ] Basic AI summary (text) via Claude

- [ ] Backend (Node.js + Supabase)
  - [ ] Auth (email + OTP for elderly)
  - [ ] Health data ingestion API
  - [ ] Notification service (FCM + email)
  - [ ] Claude integration for daily summary generation
  - [ ] Scheduled jobs (daily digest generation)

### Phase 2 — Device Integration (Weeks 13–20)
**Goal: Seamless BLE device connectivity**

- [ ] BLE device pairing (BP, oximeter, glucose, scale)
- [ ] Apple HealthKit integration
- [ ] Google Health Connect integration
- [ ] Auto-sync readings (no manual entry needed)
- [ ] Device status monitoring (battery, last sync)
- [ ] Voice note generation (AI summary → TTS → WhatsApp delivery)

### Phase 3 — AI & Intelligence (Weeks 21–28)
**Goal: Proactive health intelligence, not just data collection**

- [ ] Claude-powered conversational health assistant (for parent)
- [ ] Anomaly detection (abnormal BP/glucose patterns)
- [ ] Trend analysis (deterioration detection over weeks)
- [ ] Personalized health recommendations
- [ ] Weekly health report (PDF generation)
- [ ] Multi-language AI responses (Hindi, Tamil, Telugu, etc.)

### Phase 4 — Wellness Packages (Weeks 29–36)
**Goal: Increase ARPU with add-on packages**

- [ ] Yoga & fitness content (video library)
- [ ] Mental health check-ins (mood tracking, PHQ-9 screening)
- [ ] Companion calls (AI companion chat + scheduled human companion calls)
- [ ] Nutrition guidance (diet recommendations for common conditions)
- [ ] Teleconsultation booking integration (with Practo/MFine API)

### Phase 5 — Scale & Community (Weeks 37–52)
- [ ] Family group features (add siblings, relatives)
- [ ] Doctor portal (share health reports with doctor)
- [ ] Referral program (NRI-to-NRI referrals)
- [ ] Android TV / large-screen UI for elderly
- [ ] Vernacular voice interface (speak to app instead of type)

---

## 6. Technical Architecture

### Stack (REVISED — PWA-first, single Next.js app)
```
Web App (PWA):    Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
                  — serves both Elder (mobile) and NRI (desktop/web) from one codebase
                  — PWA manifest for "Add to Home Screen" on mobile
Backend:          Next.js API routes (no separate server needed)
Database:         Supabase (PostgreSQL + Realtime + Auth + Storage)
AI:               Claude API (claude-sonnet-4-6)
                  — Vision: OCR health device photos
                  — Text: daily summaries, chat companion
Notifications:    Twilio (SMS) + Resend (email)
WhatsApp (Phase2):Puppeteer automation of web.whatsapp.com
Payments:         Razorpay (INR, UPI, cards)
File Storage:     Supabase Storage (device photos, PDF reports)
Deployment:       Vercel
```

### App Structure
```
sathi/
├── app/
│   ├── (elder)/              # Elder parent UI — large text, simple, mobile-first
│   │   ├── layout.tsx        # Elder layout (large fonts, high contrast)
│   │   ├── home/page.tsx     # Daily check-in home
│   │   └── checkin/page.tsx  # Photo capture + health reading entry
│   ├── (nri)/                # NRI child UI — dashboard, charts, alerts
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── parent/[id]/page.tsx
│   │   └── settings/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx    # Unified login (detects elder vs NRI by role)
│   │   └── callback/page.tsx
│   ├── api/
│   │   ├── ai/ocr/route.ts           # Claude Vision → extract reading from photo
│   │   ├── ai/summary/route.ts       # Generate daily health summary
│   │   ├── health/readings/route.ts  # CRUD health data
│   │   ├── notifications/send/route.ts # SMS + email
│   │   ├── payments/create-order/route.ts
│   │   └── payments/webhook/route.ts
│   ├── layout.tsx
│   └── page.tsx              # Root redirect (→ /auth/login)
├── components/
│   ├── elder/                # Elder-specific: large cards, SOS, camera
│   └── nri/                  # NRI: charts, alerts, parent cards
├── lib/
│   ├── supabase/             # Client + server Supabase
│   ├── claude/               # Claude client + prompts
│   ├── twilio/               # SMS sending
│   ├── resend/               # Email sending
│   └── razorpay/             # Payment orders
├── supabase/
│   └── migrations/
│       └── 001_initial.sql   # Full schema
├── public/
│   └── manifest.json         # PWA manifest
├── SATHI_PROJECT_PLAN.md
└── package.json
```

### Database Schema (High-Level)

```sql
-- Core tables
users                  -- Auth users (both NRI and elderly)
profiles               -- Extended user profile (role: 'nri_child' | 'elderly_parent')
families               -- Family group (links NRI to parents)
family_members         -- Many-to-many: users <-> families

-- Health data
health_readings        -- All readings (type, value, timestamp, device_source)
medications            -- Medication list per parent
medication_logs        -- Taken/missed log

-- Devices
connected_devices      -- BLE devices linked to parent account
device_sync_logs       -- Sync history

-- AI & Reports
daily_summaries        -- AI-generated daily summary (text + voice_note_url)
alerts                 -- Triggered alerts (abnormal readings, missed check-ins)

-- Subscriptions
subscriptions          -- Plan, status, billing cycle
```

### API Structure
```
POST   /auth/signup              -- NRI child signup
POST   /auth/invite-parent       -- Invite parent (OTP-based)
GET    /health/readings          -- Get readings (filtered by type, date)
POST   /health/readings          -- Submit new reading
GET    /health/summary/:date     -- Get daily AI summary
GET    /alerts                   -- Get alerts for NRI dashboard
POST   /devices/pair             -- Register BLE device
POST   /ai/chat                  -- Chat with AI companion
GET    /reports/weekly           -- Generate weekly PDF report
```

---

## 7. Business Model & Pricing

### Subscription Plans

**Base Plan — ₹999/month (~$12 USD)**
- App for 1 parent
- Manual health data entry
- Daily AI text summary
- 7-day health trends
- Email alerts
- Medication reminders

**Standard Plan — ₹2,499/month (~$30 USD)**
- Everything in Base
- App for 2 parents
- BLE device sync (up to 3 devices)
- Daily voice note (WhatsApp/email)
- 30-day health trends + weekly report
- Push notifications + SMS alerts
- Priority support

**Premium Plan — ₹4,999/month (~$60 USD)**
- Everything in Standard
- App for up to 4 parents
- Full device kit included (first 3 months)
- AI companion chat (unlimited)
- Wellness package (yoga, mental health check-ins)
- Monthly video consultation (1 session)
- Dedicated health manager

### Add-on Packages
| Package | Price |
|---|---|
| Extra parent slot | ₹499/month |
| Wellness (yoga + nutrition) | ₹999/month |
| Mental health module | ₹799/month |
| Human companion calls (4/month) | ₹1,499/month |
| Doctor teleconsult (per session) | ₹499/session |

### Revenue Projections (Conservative)

| Year | Subscribers | MRR | ARR |
|---|---|---|---|
| Year 1 | 500 | ₹12.5L | ₹1.5 Cr (~$180k) |
| Year 2 | 3,000 | ₹75L | ₹9 Cr (~$1.1M) |
| Year 3 | 10,000 | ₹2.5 Cr | ₹30 Cr (~$3.6M) |

### Unit Economics (Standard Plan)
- ARPU: ₹2,499/month
- CAC target: ₹5,000–8,000 (~2–3 months payback)
- Gross margin target: 70%+
- LTV: ₹2,499 × 24 months avg = ₹59,976 → LTV:CAC = 7–10x (excellent)

---

## 8. Marketing Strategy

### NRI-Focused Go-to-Market

**Core message: "Be there for your parents, even when you can't be there"**

### Channel Strategy

#### 1. NRI Community Channels (Highest ROI)
- **WhatsApp NRI groups**: Organic sharing via early adopters; NRI communities share actively
- **Facebook NRI groups**: "Indians in USA/UK/Canada/UAE/Australia" — millions of members
- **Desi podcasts & YouTube**: Sponsor NRI lifestyle content creators
- **Indian associations abroad**: Tie up with IACA, BAPS, Indian community centers
- **Indian newspapers abroad**: Economic Times NRI, NRI Pulse, Desi Blitz

#### 2. Digital Marketing
- **Google Ads**: Target "elderly parents India", "remote health monitoring India", "NRI parents health"
- **Facebook/Instagram Ads**: Target by: Indian ethnicity + living outside India + age 30–50
- **LinkedIn Ads**: Target Indian professionals abroad
- **SEO**: Long-form content — "How to monitor your parents' health from abroad", "Best health apps for elderly parents India"

#### 3. Partnerships
- **Indian banks abroad** (SBI, ICICI, HDFC NRI banking): Co-market to their NRI customer base
- **Travel insurance companies**: Bundle with India travel insurance for NRIs
- **Indian corporates**: B2B — companies with large Indian employee bases (Infosys, TCS, Wipro overseas offices) as employee benefit
- **Healthcare providers**: Apollo, Fortis, Manipal for teleconsult referrals

#### 4. Referral & Virality
- **Give-a-gift model**: NRI buys subscription as gift for parents → viral among siblings
- **Sibling sharing**: One parent, multiple NRI children share cost → referral loop
- **Refer a friend**: ₹500 credit for each NRI referred

### Launch Markets (Priority Order)
1. **USA** (4M+ Indian-Americans, high income)
2. **UAE** (3.5M Indians, closest to India, high remittance behavior)
3. **UK** (1.5M Indians)
4. **Canada** (1.8M Indians)
5. **Australia** (700k Indians)
6. **Singapore** (350k Indians)

### Content Marketing
- Blog: "Guide to managing your aging parents' health from abroad"
- YouTube: Real stories of NRI families (emotional content, high virality)
- WhatsApp forward-worthy content: Simple health tips for elderly in Hindi
- Instagram Reels: "Quick health tips for your parents in India"

---

## 9. Development Phases & Timeline

### Phase 0: Foundation (Weeks 1–4)
**Goal: Working monorepo, auth, DB schema**
- Set up Turborepo monorepo
- Next.js web app scaffold
- React Native (Expo) app scaffold
- Node.js API scaffold
- Supabase project + schema migrations
- Auth flow (NRI signup → invite parent → parent OTP login)
- CI/CD (GitHub Actions)
- Environment setup + secrets management

### Phase 1: MVP (Weeks 5–12)
**Goal: End-to-end flow working — manual data entry → NRI dashboard view**
- Parent app: Onboarding, daily check-in (manual), medication reminders, SOS
- NRI web dashboard: Login, parent overview, charts, alerts
- Backend: Health data API, Claude daily summary, notification service
- Basic Claude integration: daily text summary

**MVP Success Criteria:**
- NRI child can see parent's daily health readings
- Daily AI summary generated and delivered
- SOS button works
- 5 pilot families using it daily

### Phase 2: Device Integration (Weeks 13–20)
- BLE device pairing (Omron BP, iHealth oximeter)
- Apple HealthKit + Google Health Connect
- Auto-sync readings
- Voice note generation (TTS → WhatsApp delivery)

### Phase 3: AI Intelligence (Weeks 21–28)
- Conversational AI companion for elderly parent
- Anomaly detection
- Weekly PDF health report
- Multi-language support (Hindi first, then Tamil, Telugu)

### Phase 4: Wellness Packages (Weeks 29–36)
- Yoga content library
- Mental health module
- Companion chat
- Teleconsult booking

### Phase 5: Growth & Scale (Weeks 37–52)
- Referral system
- B2B/corporate offering
- Android TV / large screen
- Voice-first interface
- Doctor portal

---

## 10. Current Status & Next Steps

### Current Status
```
Date: 2026-03-18
Phase: 1 (MVP — BUILT, pending deployment)
Branch: claude/setup-project-plan-ZBqsO
What's done:
  - [x] Project plan created + updated with revised decisions
  - [x] Next.js 14 PWA scaffolded (package.json, tailwind, tsconfig, postcss, PWA manifest)
  - [x] Supabase schema + migrations (profiles, families, health_readings, medications,
        daily_summaries, alerts, subscriptions + RLS policies + triggers)
  - [x] Auth flow — phone OTP (elderly parent) + email/password (NRI child)
  - [x] Auth onboarding — name, DOB, health conditions, invite token linking
  - [x] Middleware — route protection, role-based redirects
  - [x] Elder UI — home screen with daily progress, metric check-in cards, SOS button
  - [x] Elder check-in — photo capture → Claude Vision OCR → confirm/manual fallback
  - [x] NRI Dashboard — parent cards, health score, AI summary, readings grid, charts
  - [x] NRI Settings — profile, subscription status
  - [x] Invite parent flow — SMS via Twilio with deep link
  - [x] Alerts — real-time abnormal reading + SOS alerts to NRI
  - [x] Claude AI — Vision OCR, daily summary generation, companion chat
  - [x] Razorpay — order creation, payment webhook, 3 plans (Base/Standard/Premium)
  - [x] SMS (Twilio) + Email (Resend) daily summary delivery
  - [ ] Supabase project not yet created (needs env vars)
  - [ ] Vercel deployment not yet done
  - [ ] Health photo storage bucket not yet created in Supabase
```

### File Tree (what was built)
```
sathi/
├── app/
│   ├── (elder)/
│   │   ├── layout.tsx
│   │   ├── home/page.tsx + ElderHomeClient.tsx
│   │   └── checkin/page.tsx
│   ├── (nri)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx + NRIDashboardClient.tsx
│   │   └── settings/page.tsx + SettingsClient.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── callback/route.ts
│   ├── api/
│   │   ├── ai/ocr/route.ts
│   │   ├── ai/summary/route.ts
│   │   ├── health/readings/route.ts
│   │   ├── notifications/send/route.ts
│   │   ├── payments/create-order/route.ts
│   │   ├── payments/webhook/route.ts
│   │   ├── families/route.ts
│   │   └── auth/complete-profile/route.ts
│   ├── layout.tsx, globals.css, page.tsx
├── components/
│   ├── elder/ CheckInCard.tsx, SOSButton.tsx
│   └── nri/   NRINav.tsx, ParentHealthCard.tsx, HealthChart.tsx,
│               AlertsBanner.tsx, SubscriptionBanner.tsx, InviteParentModal.tsx
├── lib/
│   ├── supabase/client.ts, server.ts
│   ├── claude/index.ts     (OCR + summary + companion chat)
│   ├── twilio/index.ts
│   ├── resend/index.ts     (HTML email template)
│   ├── razorpay/index.ts   (orders + webhook verification + plan config)
│   └── utils.ts            (cn, health ranges, metric icons)
├── supabase/migrations/001_initial.sql
├── middleware.ts
├── public/manifest.json
└── .env.example
```

### Next Steps to Go Live
1. **Create Supabase project** at supabase.com, run `001_initial.sql`, create `health-photos` storage bucket (public)
2. **Set up .env** — Supabase URL/keys, Anthropic key, Twilio SID/token/phone, Resend key, Razorpay keys
3. **Deploy to Vercel** — `vercel deploy`, add env vars in Vercel dashboard
4. **Enable Supabase phone auth** — enable Twilio provider in Supabase Auth settings
5. **Register Razorpay webhook** — point to `https://your-app.vercel.app/api/payments/webhook`
6. **Test end-to-end** with 1 pilot family
7. **Add daily summary cron** — Supabase pg_cron or Vercel cron to hit `/api/ai/summary` at 8pm IST daily

### Revised Elder Health Photo OCR Flow
```
Elder taps "Check BP" → camera opens → takes photo of BP monitor display
→ photo uploaded to Supabase Storage
→ /api/ai/ocr called with image URL
→ Claude Vision extracts: { metric: "blood_pressure", systolic: 120, diastolic: 80 }
→ Elder sees: "We read: 120/80 — Is this correct?" [Yes] [Enter Manually]
→ Confirmed → saved to health_readings
→ Daily summary regenerated
```

### Immediate Next Steps (Do These Next)
1. **Scaffold Next.js 14 PWA** — package.json, next.config, tailwind, PWA manifest
2. **Supabase schema** — profiles, families, health_readings, medications, daily_summaries, subscriptions
3. **Auth flow** — phone OTP (elder) + email (NRI) + role-based redirect
4. **Elder UI** — home screen, photo check-in, SOS
5. **NRI Dashboard** — parent cards, health charts, AI summary, alerts
6. **API routes** — OCR, readings, summary generation, SMS/email, Razorpay
7. **Deploy to Vercel**

### Key Decisions Made
| Decision | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 | SSR for dashboard, SEO for marketing site |
| Mobile | React Native (Expo) | Cross-platform, code sharing with web |
| Backend | Node.js + Express | Team familiarity, Supabase JS SDK |
| Database | Supabase | Auth + DB + Realtime + Storage in one |
| AI | Claude API | Best reasoning, multilingual, safe for health |
| TTS | ElevenLabs (primary) / AWS Polly (fallback) | Natural voice quality |
| Deployment | Vercel + Railway + Supabase | Simple, scalable, low ops overhead |

### Key Decisions Made (2026-03-18 update)
| Decision | Choice | Rationale |
|---|---|---|
| App type | Next.js PWA (not native) | Ship fast, no app store, works on any mobile browser |
| Elder login | Phone OTP via Supabase + Twilio | Simplest possible login for elderly |
| NRI login | Email/password | Standard web login |
| BLE devices | **Not in MVP** | Too complex for elderly; use photo OCR instead |
| Health data entry | Photo of device → Claude Vision OCR | Elder takes photo of any device, AI extracts reading |
| Languages | English only in MVP | Add Hindi/vernacular post-launch |
| Notifications | SMS (Twilio) + Email (Resend) | No WhatsApp API approval delays |
| WhatsApp (future) | Automate web.whatsapp.com via Puppeteer on personal number | Phase 2, no API needed |
| Payments | **Razorpay** (India-first) | Phase 1, INR + UPI support |

---

## 11. Open Questions & Decisions Log

### Regulatory & Compliance
- **DPDP Act (India)**: Digital Personal Data Protection Act 2023 — health data is sensitive; need consent framework, data localization consideration
- **HIPAA**: If targeting US market for NRI child's data, consider HIPAA-lite practices
- **Medical device regulation**: Glucometers/BP monitors are Class B medical devices in India — selling them as a bundle may require CDSCO registration
- **Recommendation**: Consult healthcare lawyer before launch; start with "wellness" framing, not "medical device" framing

### Technical Risks
- BLE reliability on older Android phones (common among elderly in India)
- WhatsApp Business API approval (can take weeks, need backup delivery channel)
- ElevenLabs Indian language quality (may need to test AWS Polly for Hindi)
- Claude API costs at scale (estimate: ~$0.10–0.30 per daily summary; budget at ₹25-50/user/month)

### Business Risks
- Hardware returns/support complexity if bundling devices
- Convincing elderly parents to adopt new technology
- Competing with free WhatsApp video calls as "good enough" for NRIs
- Market education cost (new category = high CAC initially)

---

*Last updated: 2026-03-18 | Updated by: Claude (setup-project-plan-ZBqsO)*
*Next update: After Supabase + Vercel deployment*
