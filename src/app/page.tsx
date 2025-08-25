"use client";

import React, { useMemo, useState } from "react";

/**
 * Skyback Claim – One-page Starter (Next.js App Router + Tailwind)
 * Paste this ENTIRE file into: src/app/page.tsx
 */

const EU261_COMP = [
  { maxKm: 1500, eur: 250 },
  { maxKm: 3500, eur: 400 },
  { maxKm: Infinity, eur: 600 },
];

const airlines = [
  "Wizz Air",
  "Ryanair",
  "easyJet",
  "British Airways",
  "Lufthansa",
  "Austrian",
  "ITA Airways",
  "Turkish Airlines",
  "Air Serbia",
  "LOT",
  "SWISS",
  "Vueling",
  "Transavia",
];

const faqs = [
  {
    q: { en: "What is EU261 compensation?", sq: "Çfarë është dëmshpërblimi sipas EU261?" },
    a: {
      en: "EU Regulation 261/2004 sets fixed compensation for long delays (3+ hours), cancellations, or denied boarding on eligible flights.",
      sq: "Rregullorja 261/2004 parashikon dëmshpërblim fiks për vonesa 3+ orë, anulime ose refuzim imbarkimi për fluturime të përshtatshme.",
    },
  },
  {
    q: { en: "Which flights qualify?", sq: "Cilat fluturime kualifikohen?" },
    a: {
      en: "Flights departing from the EU/EEA/UK, or flights into the EU/EEA/UK operated by EU/EEA/UK carriers.",
      sq: "Fluturime që nisen nga BE/ZEE/MB, ose fluturime drejt BE/ZEE/MB të operuara nga kompani BE/ZEE/MB.",
    },
  },
  {
    q: { en: "What documents are needed?", sq: "Çfarë dokumentesh duhen?" },
    a: {
      en: "Boarding pass or e-ticket (PNR), ID/passport, proof of delay/cancellation (photo, email, app screenshot).",
      sq: "Boarding pass ose biletë (PNR), ID/pasaportë, provë e vonesës/anulimit (foto, email, screenshot).",
    },
  },
  {
    q: { en: "How long does it take?", sq: "Sa kohë zgjat?" },
    a: {
      en: "Airline replies usually 30–60 days. Court/ADR can extend timelines.",
      sq: "Përgjigjja e kompanisë zakonisht 30–60 ditë. Procedurat ligjore mund t’a zgjasin afatin.",
    },
  },
];

type Outcome =
  | { eligible: true; amount: number; currency: "EUR"; basis: string }
  | { eligible: false; reason: string };

function eligibilityOutcome(params: {
  distanceKm: number;
  delayHours: number;
  departedEU: boolean;
  arrivedEUCarrier: boolean;
  cause: "airline" | "extraordinary" | "unknown";
  cancelled: boolean;
  denied: boolean;
}): Outcome {
  const { distanceKm, delayHours, departedEU, arrivedEUCarrier, cause, cancelled, denied } = params;

  const eligibleFlight = departedEU || arrivedEUCarrier;
  if (!eligibleFlight) return { eligible: false, reason: "Flight not under EU/UK jurisdiction" };

  if (denied) return payout(distanceKm, "Denied boarding");
  if (cancelled) {
    if (cause === "extraordinary")
      return { eligible: false, reason: "Extraordinary circumstances (e.g., weather/ATC)" };
    return payout(distanceKm, "Cancellation");
  }
  if (delayHours >= 3) {
    if (cause === "extraordinary")
      return { eligible: false, reason: "Extraordinary circumstances (e.g., weather/ATC)" };
    return payout(distanceKm, "Arrival delay");
  }
  return { eligible: false, reason: "Delay under 3 hours" };
}

function payout(distanceKm: number, basis: string): Outcome {
  const band = EU261_COMP.find((b) => distanceKm <= b.maxKm) || EU261_COMP[2];
  return { eligible: true, amount: band.eur, currency: "EUR", basis };
}

export default function Page() {
  const [lang, setLang] = useState<"en" | "sq">("en");

  const t = useMemo(() => (key: string) => {
    const map: Record<string, { en: string; sq: string }> = {
      title: { en: "Skyback Claim", sq: "Skyback Claim" },
      hero_h: { en: "Flight delayed or cancelled?", sq: "Fluturimi u vonua apo u anulua?" },
      hero_p: {
        en: "Check eligibility in 30 seconds and start your claim with zero upfront costs.",
        sq: "Kontrollo për 30 sekonda dhe nis kërkesën pa pagesë paraprake.",
      },
      cta: { en: "Start your claim", sq: "Nis kërkesën" },
      calc_h: { en: "Eligibility checker", sq: "Kalkulatori i kualifikimit" },
      steps_h: { en: "How it works", sq: "Si funksionon" },
      step1: { en: "1) Check eligibility", sq: "1) Kontrollo kualifikimin" },
      step2: { en: "2) E-sign the mandate", sq: "2) Firmos autorizimin online" },
      step3: { en: "3) We pursue the airline", sq: "3) Ndjekim kompaninë ajrore" },
      step4: { en: "4) You get paid", sq: "4) Marrja e pagesës" },
      features_h: { en: "Why choose us", sq: "Pse ne" },
      feature1: { en: "No win, no fee", sq: "Pa fitim, pa pagesë" },
      feature2: { en: "EU/UK 261 experts", sq: "Ekspertë EU/UK 261" },
      feature3: { en: "Dedicated TIA/Wizz support", sq: "Suport i dedikuar TIA/Wizz" },
      form_h: { en: "Start your claim", sq: "Nis kërkesën" },
      consent: {
        en: "I agree to the Terms and Privacy Policy and consent to data processing for my claim.",
        sq: "Pranoj Termat dhe Privatësinë dhe jap pëlqim për përpunimin e të dhënave.",
      },
      submit: { en: "Submit", sq: "Dërgo" },
      faq_h: { en: "FAQ", sq: "Pyetje të shpeshta" },
    };
    return (map[key] ?? { en: key, sq: key })[lang];
  }, [lang]);

  const [form, setForm] = useState({
    airline: "Wizz Air",
    origin: "TIA",
    destination: "",
    date: "",
    pnr: "",
    delayHours: 3,
    distanceKm: 800,
    departedEU: true,
    arrivedEUCarrier: true,
    cause: "airline" as "airline" | "extraordinary" | "unknown",
    cancelled: false,
    denied: false,
    name: "",
    email: "",
    consent: false,
  });

  const outcome = useMemo(
    () =>
      eligibilityOutcome({
        distanceKm: Number((form as any).distanceKm) || 0,
        delayHours: Number((form as any).delayHours) || 0,
        departedEU: !!(form as any).departedEU,
        arrivedEUCarrier: !!(form as any).arrivedEUCarrier,
        cause: (form as any).cause,
        cancelled: !!(form as any).cancelled,
        denied: !!(form as any).denied,
      }),
    [form]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600" title="Skyback Claim logo" />
            <span className="font-bold">{t("title")}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-1 rounded-xl ${
                lang === "en" ? "bg-gray-900 text-white" : "bg-white border"
              }`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={`px-3 py-1 rounded-xl ${
                lang === "sq" ? "bg-gray-900 text-white" : "bg-white border"
              }`}
              onClick={() => setLang("sq")}
            >
              SQ
            </button>
            <a
              href="#start"
              className="hidden sm:inline px-4 py-2 rounded-2xl bg-indigo-600 text-white font-medium shadow"
            >
              {t("cta")}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center py-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{t("hero_h")}</h1>
          <p className="mt-4 text-lg text-gray-600">{t("hero_p")}</p>
          <div className="mt-6 flex gap-3">
            <a href="#checker" className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow">
              {t("step1")}
            </a>
            <a href="#start" className="px-5 py-3 rounded-2xl bg-white border font-semibold">
              {t("cta")}
            </a>
          </div>
          <div className="mt-4 text-sm text-gray-500">EU/UK 261 • No win, no fee • Secure & GDPR compliant</div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow border">
          <h3 className="font-semibold text-xl mb-4">{t("calc_h")}</h3>
          <EligibilityForm form={form} setForm={setForm} outcome={outcome} />
        </div>
      </section>

      {/* Logos / airlines */}
      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {airlines.map((a) => (
            <div key={a} className="text-center text-sm px-3 py-2 rounded-xl border bg-gray-50">
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">{t("steps_h")}</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {["step1", "step2", "step3", "step4"].map((k, i) => (
            <div key={k} className="bg-white rounded-3xl p-5 shadow border">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 mb-3" />
              <div className="font-semibold">{t(k)}</div>
              <p className="text-sm text-gray-600 mt-1">
                {i === 0
                  ? lang === "en"
                    ? "Use our checker to see compensation band (250/400/600 €)."
                    : "Përdor kalkulatorin për të parë shumën (250/400/600 €)."
                  : i === 1
                  ? lang === "en"
                    ? "Sign a digital mandate so we can represent you."
                    : "Firmos autorizimin online për përfaqësim."
                  : i === 2
                  ? lang === "en"
                    ? "We handle the airline, ADR, or court if needed."
                    : "Ne ndjekim kompaninë, ADR ose gjykatën nëse duhet."
                  : lang === "en"
                  ? "Once paid by airline, we transfer your share immediately."
                  : "Pasi të paguhet nga kompania, ju kalojmë shumën tuaj menjëherë."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">{t("features_h")}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[t("feature1"), t("feature2"), t("feature3")].map((txt) => (
            <div key={txt} className="bg-white rounded-3xl p-6 shadow border">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 mb-3" />
              <div className="font-semibold">{txt}</div>
              <p className="text-sm text-gray-600 mt-1">
                {lang === "en"
                  ? "Transparent fees, modern portal, and fast payouts."
                  : "Tarifa transparente, portal modern dhe pagesa të shpejta."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 py-10" id="faq">
        <h2 className="text-2xl font-bold mb-6">{t("faq_h")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow border">
              <div className="font-semibold">{item.q[lang]}</div>
              <p className="text-sm text-gray-600 mt-1">{item.a[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Start Claim */}
      <section className="bg-white border-y" id="start">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t("form_h")}</h2>
            <p className="text-gray-600">
              {lang === "en"
                ? "Fill the form and we’ll email you a secure link to upload documents and e-sign."
                : "Plotësoni formularin dhe do ju dërgojmë një link të sigurt për dokumentet dhe firmosjen."}
            </p>
            <ul className="mt-4 text-sm text-gray-600 list-disc pl-5">
              <li>{lang === "en" ? "PNR / booking code" : "PNR / kodi i rezervimit"}</li>
              <li>{lang === "en" ? "Boarding pass or e-ticket" : "Boarding pass ose biletë"}</li>
              <li>{lang === "en" ? "ID / Passport" : "ID / Pasaportë"}</li>
            </ul>
          </div>
          <ClaimForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold">{t("title")}</div>
            <p className="mt-2">
              {lang === "en"
                ? "EU/UK 261 passenger rights experts based in Albania."
                : "Ekspertë të të drejtave të pasagjerëve EU/UK 261 me bazë në Shqipëri."}
            </p>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <ul className="mt-2 space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy (GDPR)</li>
              <li>Cookies</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Contact</div>
            <p className="mt-2">support@skyback.al • +355</p>
            <p>Rr. e Airportit, Tirana</p>
          </div>
        </div>
        <div className="mt-8 text-center">© {new Date().getFullYear()} Skyback Claim</div>
      </footer>
    </div>
  );
}

function EligibilityForm({
  form,
  setForm,
  outcome,
}: {
  form: any;
  setForm: (fn: (prev: any) => any) => void;
  outcome: Outcome;
}) {
  const update = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));
  const eligible = (outcome as any).eligible;

  return (
    <div id="checker" className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Airline" value={form.airline} onChange={(e) => update("airline", e.target.value)} />
        <Input label="PNR / Booking code" value={form.pnr} onChange={(e) => update("pnr", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Origin (IATA)" value={form.origin} onChange={(e) => update("origin", e.target.value)} />
        <Input label="Destination (IATA)" value={form.destination} onChange={(e) => update("destination", e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Distance (km)" type="number" value={form.distanceKm} onChange={(e) => update("distanceKm", e.target.value)} />
        <Input label="Arrival delay (h)" type="number" value={form.delayHours} onChange={(e) => update("delayHours", e.target.value)} />
        <Input label="Flight date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Cause"
          value={form.cause}
          onChange={(e) => update("cause", e.target.value)}
          options={[
            { label: "Airline (technical/crew)", value: "airline" },
            { label: "Extraordinary (weather/ATC/strike)", value: "extraordinary" },
            { label: "Unknown", value: "unknown" },
          ]}
        />
        <Select
          label="Jurisdiction"
          value={form.departedEU ? "eu" : "non-eu"}
          onChange={(e) => update("departedEU", e.target.value === "eu")}
          options={[
            { label: "Departed EU/EEA/UK or EU carrier", value: "eu" },
            { label: "Other", value: "non-eu" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Checkbox label="Cancelled" checked={form.cancelled} onChange={(e) => update("cancelled", e.target.checked)} />
        <Checkbox label="Denied boarding" checked={form.denied} onChange={(e) => update("denied", e.target.checked)} />
      </div>

      <div className={`p-4 rounded-2xl border ${eligible ? "bg-green-50 border-green-400" : "bg-amber-50 border-amber-400"}`}>
        {eligible ? (
          <div>
            <div className="font-semibold">Estimated compensation: €{(outcome as any).amount}</div>
            <div className="text-sm text-gray-600">
              Basis: {(outcome as any).basis}. Final amount may vary per rerouting, arrival time, and airline defenses.
            </div>
          </div>
        ) : (
          <div>
            <div className="font-semibold">Not clearly eligible</div>
            <div className="text-sm text-gray-600">
              Reason: {(outcome as any).reason}. Try adjusting inputs or submit your case for a manual review.
            </div>
          </div>
        )}
      </div>

      <a href="#start" className="block text-center px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow">
        Start claim
      </a>
    </div>
  );
}

function ClaimForm() {
  const [state, setState] = useState({
    fullName: "",
    email: "",
    phone: "",
    airline: "Wizz Air",
    pnr: "",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!state.consent) {
    alert("Please accept terms and privacy.");
    return;
  }

  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // use the SAME keys your API expects
        fullName: state.fullName,    // <-- capital N
        email: state.email,

        // optional extras (match whatever you want to store)
        phone: state.phone || "",
        airline: state.airline || "",
        pnr: state.pnr || "",
        origin: state.origin || "",
        destination: state.destination || "",
        delayhours: (state as any).delayhours ?? "", // only if you actually have it in state
        cause: (state as any).cause ?? "",
        note: state.message || "",
        consent: !!state.consent,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      alert(`Error saving your claim. ${error ?? res.statusText}`);
      return;
    }

    setSubmitted(true);
    // (optional) reset fields:
    // setState({ fullName: "", email: "", phone: "", airline: "", pnr: "", origin: "", destination: "", message: "", consent: false });
  } catch (err: any) {
    alert(`Error saving your claim. ${err?.message ?? err}`);
  }
};


  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-400 rounded-3xl p-6">
        <div className="font-semibold text-green-800">Thank you!</div>
        <p className="text-sm mt-1">Check your inbox for a secure upload link. We’ll review your case in 24–48h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl p-6 shadow border space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Full name" value={state.fullName} onChange={(e) => setState((s) => ({ ...s, fullName: e.target.value }))} />
        <Input label="Email" type="email" value={state.email} onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" value={state.phone} onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))} />
        <Input label="Airline" value={state.airline} onChange={(e) => setState((s) => ({ ...s, airline: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="PNR / Booking code" value={state.pnr} onChange={(e) => setState((s) => ({ ...s, pnr: e.target.value }))} />
        <Input label="Message (optional)" value={state.message} onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))} />
      </div>
      <Checkbox
        label="I agree to Terms & Privacy and allow you to process my data for this claim (GDPR)."
        checked={state.consent}
        onChange={(e) => setState((s) => ({ ...s, consent: (e.target as HTMLInputElement).checked }))}
      />
      <button type="submit" className="w-full px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow">Submit</button>
      <p className="text-xs text-gray-500">You can withdraw consent anytime. We store data in the EEA and use encryption at rest & in transit.</p>
    </form>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border" />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
