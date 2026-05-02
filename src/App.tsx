import { useEffect, useRef, useState } from "react";

type Step = 1 | 2 | 3 | 4;

type FormState = {
  codePostal: string;
  projet: string;
  delai: string;
  typeBien: string;
  chambres: string;
  etat: string;
  rue: string;
  numero: string;
  ville: string;
  message: string;
  nom: string;
  telephone: string;
  email: string;
};

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxhdY9p_l8F1i-XMqZs93_wWZnazlOkEKygFZXB-Ke33kqkZWcHwQ16ObfWFrOfgjCE/exec";

const LOGO_ICON_URL = "/logo-icon.png";

const STEPS: Array<{ num: Step; label: string }> = [
  { num: 1, label: "Secteur" },
  { num: 2, label: "Projet" },
  { num: 3, label: "Bien" },
  { num: 4, label: "Coordonnées" },
];

const INITIAL_FORM: FormState = {
  codePostal: "",
  projet: "",
  delai: "",
  typeBien: "",
  chambres: "",
  etat: "",
  rue: "",
  numero: "",
  ville: "",
  message: "",
  nom: "",
  telephone: "",
  email: "",
};

const PROJET_OPTIONS = [
  "Je souhaite vendre mon bien",
  "Je prépare une vente dans les prochains mois",
  "Je souhaite connaître la valeur de mon bien",
  "Je me renseigne simplement",
];

const DELAI_OPTIONS = [
  "Dès que possible",
  "Dans les 3 mois",
  "Dans les 6 mois",
  "Pas encore défini",
];

const TYPE_BIEN_OPTIONS = [
  "Maison",
  "Appartement",
  "Studio",
  "Duplex",
  "Triplex",
  "Terrain",
  "Immeuble",
  "Autre",
];

export default function RealEstateLeadPage() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [animKey, setAnimKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cpError, setCpError] = useState("");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isInForm, setIsInForm] = useState(false);
  const [hideHeroOnMobile, setHideHeroOnMobile] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  // Detect #formulaire on load (Meta ads) → hide hero on mobile
  useEffect(() => {
    if (window.location.hash === "#formulaire") {
      setHideHeroOnMobile(true);
    }
  }, []);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValidBelgianPostalCode = (cp: string) => {
    const n = parseInt(cp, 10);
    return cp.length === 4 && n >= 1000 && n <= 9999;
  };

  const canNext = (): boolean => {
    if (step === 1) return isValidBelgianPostalCode(form.codePostal);
    if (step === 2) return Boolean(form.projet && form.delai);
    if (step === 3) return Boolean(form.typeBien && form.chambres && form.etat);
    if (step === 4)
      return Boolean(
        form.nom && form.telephone && form.email && form.rue && form.numero && form.ville
      );
    return false;
  };

  const goNext = () => {
    if (!canNext()) return;
    setDirection("forward");
    setAnimKey((k) => k + 1);
    setStep((prev) => Math.min(prev + 1, 4) as Step);
  };

  const goBack = () => {
    setDirection("backward");
    setAnimKey((k) => k + 1);
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = (e: React.FormEvent) => {
    // Critical fix: block submit if not on last step
    if (step !== 4) {
      e.preventDefault();
      return;
    }
    if (!canNext() || isSubmitting) {
      e.preventDefault();
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
  };

  const handleIframeLoad = () => {
    if (!isSubmitting) return;
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // Focus step heading on step change
  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => stepHeadingRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [step, submitted]);

  // Scroll to form top on step change
  useEffect(() => {
    if (submitted) return;
    const el = formTopRef.current;
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    );
  }, [step, submitted]);

  // Scroll to success
  useEffect(() => {
    if (!submitted) return;
    const el = document.getElementById("formulaire");
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    );
  }, [submitted]);

  // Scroll toward "Continuer" when step becomes completable
  useEffect(() => {
    if (!canNext()) return;
    const el = actionsRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.codePostal, form.projet, form.delai, form.typeBien, form.chambres, form.etat]);

  // Track whether user is viewing the form section
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("formulaire");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setIsInForm(rect.top < window.innerHeight && rect.bottom > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard: Enter advances, Escape goes back
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === "Enter" && tag !== "BUTTON" && tag !== "TEXTAREA" && tag !== "SELECT") {
      if (step < 4 && canNext()) goNext();
    }
    if (e.key === "Escape" && step > 1) goBack();
  };

  const continueTooltip = !canNext()
    ? step === 1
      ? "Veuillez entrer un code postal belge valide"
      : step === 2
      ? !form.projet
        ? "Veuillez sélectionner votre projet"
        : "Veuillez sélectionner un délai"
      : step === 3
      ? !form.typeBien
        ? "Veuillez sélectionner le type de bien"
        : !form.chambres
        ? "Veuillez sélectionner le nombre de chambres"
        : "Veuillez sélectionner l'état du bien"
      : "Veuillez compléter tous les champs"
    : undefined;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#FAFAF8",
        minHeight: "100dvh",
        color: "#1a1a18",
        paddingBottom: 96,
        WebkitTextSizeAdjust: "100%",
      }}
      onKeyDown={handleKeyDown}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        #formulaire { scroll-margin-top: 80px; }
        .brand-link { display: flex; align-items: center; gap: 10px; min-width: 0; text-decoration: none; color: inherit; }
        .brand-icon { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }

        input, select, textarea {
          width: 100%; padding: 13px 16px;
          border: 1.5px solid #D6D4CE; border-radius: 12px;
          background: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 16px; line-height: 1.25; color: #1a1a18; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        input:focus, select:focus, textarea:focus { border-color: #8B6A3E; box-shadow: 0 0 0 3px rgba(139,106,62,0.1); }
        input.error { border-color: #B3261E; }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px;
        }
        input::placeholder, textarea::placeholder { color: #B4B2A9; }
        .field { margin-bottom: 10px; }
        .field label, .field-label {
          display: block; font-size: 12px; font-weight: 500;
          color: #888780; margin-bottom: 6px; letter-spacing: 0.03em; text-transform: uppercase;
        }
        .field-error { font-size: 11px; color: #B3261E; margin-top: 4px; }

        /* Option buttons */
        .option-btn {
          padding: 12px 16px; border: 1.5px solid #D6D4CE; border-radius: 12px;
          background: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1a18;
          cursor: pointer; transition: border-color 0.15s, background 0.15s, color 0.15s;
          text-align: left; width: 100%; display: flex; align-items: center; gap: 10px;
        }
        .option-btn:hover { border-color: #8B6A3E; background: #FAF6F1; }
        .option-btn.selected { border-color: #8B6A3E; background: #FAF6F1; color: #7A5C34; font-weight: 500; }
        .option-btn:focus-visible { outline: 3px solid #8B6A3E; outline-offset: 2px; }
        .option-btn .btn-check {
          margin-left: auto; flex-shrink: 0;
          width: 20px; height: 20px; border-radius: 50%;
          background: #8B6A3E; display: flex; align-items: center; justify-content: center;
        }
        .option-btn .btn-check svg { width: 11px; height: 11px; }
        .type-btn { flex-direction: column; text-align: center; padding: 12px 8px; font-size: 13px; gap: 4px; justify-content: center; align-items: center; }
        .chambre-btn { flex: 1; min-width: 42px; padding: 11px 6px; font-size: 14px; font-weight: 500; justify-content: center; text-align: center; }

        /* Primary buttons */
        .btn-primary { width: 100%; padding: 15px 24px; background: #1a1a18; color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.15s, opacity 0.2s; min-height: 52px; }
        .btn-primary:hover:not(:disabled) { background: #333330; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-amber { background: #8B6A3E !important; }
        .btn-amber:hover:not(:disabled) { background: #7A5C34 !important; }

        /* Tooltip on disabled button */
        .btn-wrapper { position: relative; flex: 1; }
        .btn-wrapper .tooltip {
          display: none; position: absolute; bottom: calc(100% + 8px); left: 50%;
          transform: translateX(-50%); background: #1a1a18; color: #fff;
          font-size: 12px; padding: 6px 10px; border-radius: 8px; white-space: nowrap;
          pointer-events: none; z-index: 10;
        }
        .btn-wrapper .tooltip::after {
          content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent; border-top-color: #1a1a18;
        }
        .btn-wrapper:hover .tooltip { display: block; }

        .btn-back { background: none; border: 1.5px solid #D6D4CE; border-radius: 12px; padding: 13px 20px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #888780; cursor: pointer; transition: border-color 0.2s, color 0.2s; white-space: nowrap; }
        .btn-back:hover { border-color: #1a1a18; color: #1a1a18; }

        /* Misc */
        .badge { display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 100px; font-size: 13px; font-weight: 500; }
        .badge-green { background: #EAF3DE; color: #3B6D11; }
        .badge-amber { background: #FAEEDA; color: #854F0B; }
        .badge-blue  { background: #E6F1FB; color: #185FA5; }
        .card { background: #fff; border: 1px solid #E8E6E0; border-radius: 18px; padding: 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .opts-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }

        /* Form card — height adapts to content */
        .form-card {
          background: #fff; border: 1px solid #E8E6E0; border-radius: 24px;
          padding: 32px 28px; box-shadow: 0 8px 48px rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
        }
        .form-top-anchor { scroll-margin-top: 96px; }
        .form-actions {
          display: flex; gap: 10px; margin-top: 18px;
          position: sticky; bottom: 0;
          padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
          background: linear-gradient(to top, #fff 80%, rgba(255,255,255,0));
        }

        /* Step slide transitions */
        @keyframes slideInForward  { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInBackward { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
        .slide-forward  { animation: slideInForward  0.25s cubic-bezier(0.4,0,0.2,1) both; }
        .slide-backward { animation: slideInBackward 0.25s cubic-bezier(0.4,0,0.2,1) both; }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .slide-forward, .slide-backward,
          .success-circle, .success-text, .success-steps { animation: none !important; }
          .success-check { animation: none !important; stroke-dashoffset: 0 !important; }
          * { transition-duration: 0.01ms !important; }
        }

        /* Success animations */
        @keyframes circlePop   { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes checkDraw   { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .success-circle { animation: circlePop   0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .success-check  { stroke-dasharray: 50; stroke-dashoffset: 50; animation: checkDraw 0.45s ease 0.3s forwards; }
        .success-text   { animation: fadeSlideUp 0.4s ease 0.55s both; }
        .success-steps  { animation: fadeSlideUp 0.4s ease 0.75s both; }

        [tabindex="-1"]:focus { outline: none; }

        /* Mobile CTA */
        .mobile-cta { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 998; padding: 12px 20px 20px; background: linear-gradient(to top, #fff 80%, transparent); }
        .mobile-cta a { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; background: #1a1a18; color: #fff; border-radius: 14px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; text-decoration: none; box-shadow: 0 4px 20px rgba(0,0,0,0.18); }

        @media (max-width: 900px) {
          .hero-layout { grid-template-columns: 1fr !important; gap: 0 !important; }
          .why-layout  { grid-template-columns: 1fr !important; gap: 28px !important; }
          .grid-2      { grid-template-columns: 1fr !important; }
          .mini-cards  { grid-template-columns: 1fr !important; }
          .cta-layout  { grid-template-columns: 1fr !important; }
          .span-2      { grid-column: span 1 !important; }
          .opts-4      { grid-template-columns: 1fr 1fr !important; }
          .mobile-cta  { display: block; }
          .nav-wrap    { padding: 10px 16px !important; }
          .brand-icon  { width: 38px !important; height: 38px !important; }
          .hero-image  { display: none !important; }
          .hero-pad    { padding: 32px 16px !important; }
          .hero-content-mobile-hidden { display: none; }
          .form-sticky { position: static !important; top: auto !important; }
          .form-card   { padding: 20px 16px !important; border-radius: 16px !important; box-shadow: 0 4px 24px rgba(0,0,0,0.07) !important; }
          .field       { margin-bottom: 10px !important; }
          .section-pad { padding: 48px 16px !important; }
          .cta-box     { padding: 32px 20px !important; }
          .step-card   { flex-direction: column !important; align-items: flex-start !important; }
          .step-link   { margin-left: 0; width: 100%; justify-content: center; }
          .nav-button  { display: none !important; }
          .cta-image   { min-height: 200px !important; }
        }
      `}</style>

      {/* SR live region */}
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
        {`Étape ${step} sur 4 : ${STEPS[step - 1].label}`}
      </div>

      {/* ── NAVBAR ── */}
      {!isInForm && (
        <nav className="nav-wrap" aria-label="Navigation principale" style={{ position: "sticky", top: 0, zIndex: 999, background: "#fff", borderBottom: "1px solid #E8E6E0", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", gap: 16 }}>
          <a href="#" className="brand-link" aria-label="EstimationGratuite.be – accueil">
            <img src={LOGO_ICON_URL} alt="" aria-hidden="true" className="brand-icon" />
            <span className="serif" style={{ fontSize: 20, fontWeight: 700, whiteSpace: "nowrap" }}>
              <span style={{ color: "#1a1a18" }}>Estimation</span>
              <span style={{ color: "#8B6A3E" }}>Gratuite</span>
              <span style={{ color: "#1a1a18" }}>.be</span>
            </span>
          </a>
          <a className="nav-button" href="#formulaire" style={{ padding: "9px 20px", background: "#1a1a18", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
            Estimer mon bien gratuitement
          </a>
        </nav>
      )}

      {/* ── HERO ── */}
      <section className="hero-section" style={{ background: "linear-gradient(135deg, #F7F5F0 0%, #fff 60%, #F7F5F0 100%)", borderBottom: "1px solid #E8E6E0", position: "relative", overflow: "hidden" }}>
        <div className="hero-image" role="img" aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: "38%", height: "100%", backgroundImage: "url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12, pointerEvents: "none" }} />
        <div className="hero-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
          <div className="hero-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

            {/* Left — masqué sur mobile si Meta */}
            <div className={hideHeroOnMobile ? "hero-content-mobile-hidden" : ""}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                <span className="badge badge-green">Estimation gratuite</span>
                <span className="badge badge-amber">Sans engagement</span>
                <span className="badge badge-blue">Professionnel local</span>
              </div>
              <h1 className="serif" style={{ fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Combien vaut vraiment votre bien aujourd'hui ?
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "#5F5E5A", maxWidth: 520, marginBottom: 32, fontWeight: 300 }}>
                Votre demande est transmise à un professionnel immobilier actif dans votre secteur, afin d'échanger sur votre bien et d'estimer sa valeur gratuitement, sans engagement.
              </p>
              <div style={{ marginBottom: 36 }}>
                <a href="#formulaire" style={{ display: "inline-flex", padding: "14px 28px", background: "#1a1a18", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
                  Obtenir mon estimation gratuite
                </a>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex" }} aria-hidden="true">
                    {["#C4A882", "#A8896A", "#8B6A3E"].map((bg, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: bg, border: "2px solid #F7F5F0", marginLeft: i === 0 ? 0 : -8 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "#888780" }}>
                    <strong style={{ color: "#1a1a18" }}>+120 propriétaires</strong>&nbsp;ont déjà demandé leur estimation
                  </span>
                </div>
              </div>
              <div className="mini-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { title: "Professionnel du secteur", desc: "Votre demande est orientée vers un professionnel immobilier actif localement." },
                  { title: "Sans obligation de vente", desc: "Demander une estimation ne vous engage à aucune mise en vente de votre bien." },
                  { title: "Pour mieux définir votre projet", desc: "Vous obtenez un repère concret pour avancer plus sereinement dans votre réflexion." },
                ].map((card) => (
                  <div key={card.title} className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{card.title}</div>
                    <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.65 }}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FORMULAIRE ── */}
            <div id="formulaire" className="form-sticky" style={{ position: "sticky", top: 80 }}>
              <div className="form-card">
                <iframe ref={iframeRef} name="hidden_iframe" title="Soumission du formulaire" style={{ display: "none" }} onLoad={handleIframeLoad} aria-hidden="true" />

                {/* SUCCESS */}
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }} role="status" aria-live="assertive">
                    <div className="success-circle" style={{ width: 72, height: 72, borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                        <path className="success-check" d="M8 17l6 6 12-12" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="success-text">
                      <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Votre demande a bien été transmise</h2>
                      <p style={{ fontSize: 14, color: "#5F5E5A", lineHeight: 1.75, maxWidth: 360, margin: "0 auto" }}>
                        Un professionnel immobilier actif dans votre secteur vous contactera afin d'échanger sur votre bien et organiser une estimation gratuite et sans engagement.
                      </p>
                    </div>
                    <div className="success-steps" style={{ marginTop: 24, display: "grid", gap: 10 }}>
                      {[
                        { n: "1", text: "Votre demande est en cours d'analyse" },
                        { n: "2", text: "Un professionnel vous contacte sous 48h" },
                        { n: "3", text: "Estimation gratuite et sans engagement" },
                      ].map(({ n, text }) => (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F7F5F0", borderRadius: 12, textAlign: "left" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#8B6A3E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }} aria-hidden="true">{n}</div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "#8B6A3E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Étape {n}</div>
                            <div style={{ fontSize: 13, color: "#5F5E5A" }}>{text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (

                  /* FORM */
                  <form action={SCRIPT_URL} method="POST" target="hidden_iframe" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }} aria-label="Formulaire d'estimation en plusieurs étapes" noValidate>
                    {(Object.keys(INITIAL_FORM) as (keyof FormState)[]).map((key) => (
                      <input key={key} type="hidden" name={key} value={form[key]} readOnly />
                    ))}

                    <div ref={formTopRef} className="form-top-anchor" />

                    {/* Progress */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em" }}>Étape {step} / 4</span>
                        <span style={{ fontSize: 12, color: "#8B6A3E", fontWeight: 500 }}>
                          {STEPS[step - 1].label}
                          {step < 4 && <span style={{ color: "#B4B2A9", fontWeight: 400 }}> → {STEPS[step].label}</span>}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label={`Progression : étape ${step} sur 4`}>
                        {STEPS.map((s) => (
                          <div key={s.num} style={{ flex: 1, height: 4, borderRadius: 4, background: s.num <= step ? "#8B6A3E" : "#E8E6E0", transition: "background 0.3s" }} />
                        ))}
                      </div>
                    </div>

                    {/* Animated step content */}
                    <div key={animKey} className={direction === "forward" ? "slide-forward" : "slide-backward"}>

                      {/* STEP 1 */}
                      {step === 1 && (
                        <div>
                          <h2 ref={stepHeadingRef} tabIndex={-1} className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                            Où se situe le bien à estimer ?
                          </h2>
                          <p style={{ fontSize: 13, color: "#888780", marginBottom: 18, lineHeight: 1.6 }}>
                            Le code postal permet de transmettre votre demande à un professionnel actif dans votre secteur.
                          </p>
                          <div className="field">
                            <label htmlFor="codePostal">Code postal du bien</label>
                            <input
                              id="codePostal"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]{4}"
                              maxLength={4}
                              placeholder="Ex. 6230"
                              value={form.codePostal}
                              className={cpError ? "error" : ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setField("codePostal", val);
                                if (val.length === 4 && !isValidBelgianPostalCode(val)) {
                                  setCpError("Code postal belge invalide (1000–9999)");
                                } else {
                                  setCpError("");
                                }
                              }}
                              autoComplete="postal-code"
                              aria-required="true"
                              aria-describedby={cpError ? "cp-error" : "cp-hint"}
                              autoFocus
                            />
                            {cpError
                              ? <p id="cp-error" className="field-error" role="alert">{cpError}</p>
                              : <p id="cp-hint" style={{ fontSize: 11, color: "#B4B2A9", marginTop: 5 }}>4 chiffres — code postal belge</p>
                            }
                          </div>
                        </div>
                      )}

                      {/* STEP 2 */}
                      {step === 2 && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#EAF3DE", borderRadius: 12, padding: "10px 14px", marginBottom: 18 }}>
                            <span style={{ fontSize: 16, color: "#3B6D11", fontWeight: 700 }} aria-hidden="true">✓</span>
                            <span style={{ fontSize: 13, color: "#3B6D11", fontWeight: 500 }}>
                              Des professionnels sont actifs dans le secteur <strong>{form.codePostal}</strong>
                            </span>
                          </div>
                          <h2 ref={stepHeadingRef} tabIndex={-1} className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Quel est votre projet ?</h2>
                          <p style={{ fontSize: 13, color: "#888780", marginBottom: 18, lineHeight: 1.6 }}>Ces informations permettent de mieux comprendre votre besoin avant la prise de contact.</p>

                          <fieldset style={{ border: "none", padding: 0, marginBottom: 14 }}>
                            <legend className="field-label">Votre projet</legend>
                            <div style={{ display: "grid", gap: 8 }}>
                              {PROJET_OPTIONS.map((label) => (
                                <button key={label} type="button" className={`option-btn${form.projet === label ? " selected" : ""}`} onClick={() => setField("projet", label)} aria-pressed={form.projet === label}>
                                  <span>{label}</span>
                                  {form.projet === label && (
                                    <span className="btn-check" aria-hidden="true">
                                      <svg viewBox="0 0 12 10" fill="none"><path d="M1.5 5l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </fieldset>

                          <fieldset style={{ border: "none", padding: 0 }}>
                            <legend className="field-label">Délai de vente envisagé</legend>
                            <div style={{ display: "grid", gap: 8 }}>
                              {DELAI_OPTIONS.map((label) => (
                                <button key={label} type="button" className={`option-btn${form.delai === label ? " selected" : ""}`} onClick={() => setField("delai", label)} aria-pressed={form.delai === label}>
                                  <span>{label}</span>
                                  {form.delai === label && (
                                    <span className="btn-check" aria-hidden="true">
                                      <svg viewBox="0 0 12 10" fill="none"><path d="M1.5 5l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </fieldset>
                        </div>
                      )}

                      {/* STEP 3 */}
                      {step === 3 && (
                        <div>
                          <h2 ref={stepHeadingRef} tabIndex={-1} className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Quelques détails sur votre bien</h2>
                          <p style={{ fontSize: 13, color: "#888780", marginBottom: 18, lineHeight: 1.6 }}>Ces éléments aident le professionnel à préparer son premier échange avec vous.</p>

                          <fieldset style={{ border: "none", padding: 0, marginBottom: 14 }}>
                            <legend className="field-label">Type de bien</legend>
                            <div className="opts-4">
                              {TYPE_BIEN_OPTIONS.map((label) => (
                                <button key={label} type="button" className={`option-btn type-btn${form.typeBien === label ? " selected" : ""}`} onClick={() => setField("typeBien", label)} aria-pressed={form.typeBien === label}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          </fieldset>

                          <fieldset style={{ border: "none", padding: 0, marginBottom: 14 }}>
                            <legend className="field-label">Nombre de chambres</legend>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {["0", "1", "2", "3", "4", "5+"].map((count) => (
                                <button key={count} type="button" className={`option-btn chambre-btn${form.chambres === count ? " selected" : ""}`} onClick={() => setField("chambres", count)} aria-pressed={form.chambres === count} aria-label={`${count} chambre${count === "1" ? "" : "s"}`}>
                                  {count}
                                </button>
                              ))}
                            </div>
                          </fieldset>

                          <div className="field">
                            <label htmlFor="etat">État général</label>
                            <select id="etat" value={form.etat} onChange={(e) => setField("etat", e.target.value)} aria-required="true">
                              <option value="">Choisir l'état du bien</option>
                              <option value="À rénover">À rénover</option>
                              <option value="À rafraîchir">À rafraîchir</option>
                              <option value="Bon état">Bon état</option>
                              <option value="Excellent état">Excellent état</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* STEP 4 */}
                      {step === 4 && (
                        <div>
                          <h2 ref={stepHeadingRef} tabIndex={-1} className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Où vous recontacter ?</h2>
                          <p style={{ fontSize: 13, color: "#888780", marginBottom: 18, lineHeight: 1.6 }}>Un professionnel immobilier actif dans votre secteur vous contactera pour échanger sur votre bien.</p>
                          <div className="field">
                            <label htmlFor="nom">Prénom et nom</label>
                            <input id="nom" type="text" placeholder="Jean Dupont" value={form.nom} onChange={(e) => setField("nom", e.target.value)} aria-required="true" autoFocus autoComplete="name" />
                          </div>
                          <div className="grid-2">
                            <div className="field">
                              <label htmlFor="telephone">Téléphone</label>
                              <input id="telephone" type="tel" inputMode="tel" placeholder="0475 12 34 56" value={form.telephone} onChange={(e) => setField("telephone", e.target.value)} aria-required="true" autoComplete="tel" />
                            </div>
                            <div className="field">
                              <label htmlFor="email">E-mail</label>
                              <input id="email" type="email" placeholder="jean@exemple.be" value={form.email} onChange={(e) => setField("email", e.target.value)} aria-required="true" autoComplete="email" />
                            </div>
                          </div>
                          <div className="grid-2">
                            <div className="field">
                              <label htmlFor="rue">Rue</label>
                              <input id="rue" type="text" placeholder="Rue de la Gare" value={form.rue} onChange={(e) => setField("rue", e.target.value)} aria-required="true" autoComplete="address-line1" />
                            </div>
                            <div className="field">
                              <label htmlFor="numero">Numéro</label>
                              <input id="numero" type="text" placeholder="12" value={form.numero} onChange={(e) => setField("numero", e.target.value)} aria-required="true" autoComplete="address-line2" />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor="ville">Ville / Commune</label>
                            <input id="ville" type="text" placeholder="Pont-à-Celles" value={form.ville} onChange={(e) => setField("ville", e.target.value)} aria-required="true" autoComplete="address-level2" />
                          </div>
                          <div className="field" style={{ marginTop: 4 }}>
                            <label htmlFor="message">Précisions <span style={{ fontWeight: 400, color: "#B4B2A9", textTransform: "none" }}>(facultatif)</span></label>
                            <textarea id="message" rows={2} placeholder="Jardin, garage, rénovations récentes..." value={form.message} onChange={(e) => setField("message", e.target.value)} style={{ resize: "vertical" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "10px 0", marginTop: 8, borderTop: "1px solid #F1EFE8", borderBottom: "1px solid #F1EFE8", flexWrap: "wrap" }}>
                            {["Réponse sous 48h", "Aucun engagement", "Professionnel de votre secteur"].map((text) => (
                              <span key={text} style={{ fontSize: 12, color: "#888780", display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ color: "#3B6D11", fontWeight: 700 }} aria-hidden="true">✓</span> {text}
                              </span>
                            ))}
                          </div>
                          <p style={{ marginTop: 10, fontSize: 11, color: "#B4B2A9", lineHeight: 1.6, textAlign: "center" }}>
                            En cliquant sur « Obtenir mon estimation gratuite », vous acceptez la politique de confidentialité de EstimationGratuite.be et le traitement de vos données afin d'être contacté par un professionnel immobilier actif dans votre secteur.
                          </p>
                        </div>
                      )}

                    </div>{/* end slide */}

                    {submitError && (
                      <p role="alert" style={{ marginTop: 12, fontSize: 12, color: "#B3261E", textAlign: "center" }}>{submitError}</p>
                    )}

                    {/* Actions */}
                    <div className="form-actions" ref={actionsRef}>
                      {step > 1 && (
                        <button type="button" className="btn-back" onClick={goBack} aria-label="Retourner à l'étape précédente">← Retour</button>
                      )}
                      {step < 4 ? (
                        <div className="btn-wrapper">
                          {continueTooltip && <span className="tooltip" role="tooltip">{continueTooltip}</span>}
                          <button type="button" className="btn-primary btn-amber" disabled={!canNext()} onClick={goNext} style={{ width: "100%" }} aria-label={canNext() ? `Continuer vers ${STEPS[step].label}` : continueTooltip}>
                            Continuer →
                          </button>
                        </div>
                      ) : (
                        <button type="submit" className="btn-primary btn-amber" disabled={!canNext() || isSubmitting} aria-busy={isSubmitting} style={{ flex: 1 }}>
                          {isSubmitting ? "Envoi en cours…" : "Obtenir mon estimation gratuite →"}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POURQUOI ── */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div className="why-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>Pourquoi choisir un professionnel ?</p>
            <h2 className="serif" style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>Rien ne remplace le regard d'un professionnel sur votre bien</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#5F5E5A", fontWeight: 300 }}>Un simple outil en ligne ne perçoit pas tout ce qui fait la valeur réelle d'un bien. La luminosité, l'agencement, l'état d'entretien, les finitions et l'environnement immédiat influencent directement son estimation.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card"><h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Un professionnel actif localement</h3><p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>Votre demande est orientée vers un professionnel immobilier qui connaît votre secteur et ses réalités de marché.</p></div>
            <div className="card"><h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Le regard d'un professionnel change tout</h3><p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>La visite permet d'apprécier le bien dans tous ses aspects et de vous conseiller avec précision selon votre situation.</p></div>
            <div className="card span-2" style={{ gridColumn: "span 2" }}><h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>L'humain au centre de votre projet</h3><p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>Au-delà de l'estimation, un professionnel vous accompagne et vous aide à mieux comprendre les étapes de votre projet immobilier.</p></div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA FONCTIONNE ── */}
      <section className="section-pad" style={{ background: "#1a1a18", color: "#FAFAF8", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="why-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>Comment ça fonctionne ?</p>
              <h2 className="serif" style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>Votre estimation en quelques étapes simples</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "#B4B2A9", fontWeight: 300 }}>Complétez votre demande en quelques instants. Un professionnel actif dans votre secteur vous contacte ensuite.</p>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { n: "1", t: "Vous indiquez le secteur du bien", link: true },
                { n: "2", t: "Votre demande est analysée", link: false },
                { n: "3", t: "Un professionnel vous contacte", link: false },
              ].map((item) => (
                <div key={item.n} className="step-card" style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 22px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#8B6A3E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, flexShrink: 0 }} aria-hidden="true">{item.n}</div>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.t}</span>
                  {item.link && (
                    <a className="step-link" href="#formulaire" style={{ marginLeft: "auto", padding: "7px 14px", background: "#fff", color: "#1a1a18", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>Commencer</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div className="cta-layout" style={{ background: "#F1EFE8", borderRadius: 28, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div className="cta-box" style={{ padding: "56px 48px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>Vous envisagez de vendre votre bien ?</p>
            <h2 className="serif" style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>Une vente bien préparée commence par une estimation sérieuse</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#5F5E5A", fontWeight: 300, marginBottom: 32 }}>Dans un marché immobilier belge de plus en plus exigeant, préparer correctement sa vente est essentiel.</p>
            <a href="#formulaire" style={{ display: "inline-flex", padding: "16px 32px", background: "#1a1a18", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              Je demande mon estimation gratuite
            </a>
          </div>
          <div className="cta-image" role="img" aria-label="Photo d'une maison" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center", minHeight: 320 }} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #E8E6E0", background: "#fff", padding: "32px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <img src={LOGO_ICON_URL} alt="" aria-hidden="true" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8 }} />
          <span className="serif" style={{ fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: "#1a1a18" }}>Estimation</span>
            <span style={{ color: "#8B6A3E" }}>Gratuite</span>
            <span style={{ color: "#1a1a18" }}>.be</span>
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#888780" }}>L'estimation immobilière avec un regard humain</p>
      </footer>

      {/* ── CTA MOBILE ── */}
      {!isInForm && (
        <div className="mobile-cta" aria-label="Accès rapide au formulaire">
          <a href="#formulaire">Démarrer mon estimation →</a>
        </div>
      )}
    </div>
  );
}
