import { useRef, useState } from "react";

type Step = 1 | 2 | 3 | 4;

type FormState = {
  typeBien: string;
  chambres: string;
  surface: string;
  etat: string;
  rue: string;
  numero: string;
  codePostal: string;
  ville: string;
  delai: string;
  message: string;
  nom: string;
  telephone: string;
  email: string;
};

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbztjZoWZFXlkzzX_BvNRNq0izXCf1gk5FmQiOt7p_Z3DC_Y03IWaR0Ya_iRjWSAWgHD/exec";

const STEPS: Array<{ num: Step; label: string }> = [
  { num: 1, label: "Votre bien" },
  { num: 2, label: "Localisation" },
  { num: 3, label: "Votre projet" },
  { num: 4, label: "Coordonnées" },
];

const INITIAL_FORM: FormState = {
  typeBien: "",
  chambres: "",
  surface: "",
  etat: "",
  rue: "",
  numero: "",
  codePostal: "",
  ville: "",
  delai: "",
  message: "",
  nom: "",
  telephone: "",
  email: "",
};

export default function RealEstateLeadPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = (): boolean => {
    if (step === 1) return Boolean(form.typeBien && form.chambres && form.surface && form.etat);
    if (step === 2) return Boolean(form.rue && form.numero && form.codePostal && form.ville);
    if (step === 3) return Boolean(form.delai);
    if (step === 4) return Boolean(form.nom && form.telephone && form.email);
    return false;
  };

  const goNext = () => {
    if (!canNext()) return;
    setStep((prev) => Math.min(prev + 1, 4) as Step);
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = () => {
    if (!canNext() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
  };

  const handleIframeLoad = () => {
    if (!isSubmitting) return;
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#1a1a18", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }

        input, select, textarea {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #D6D4CE;
          border-radius: 12px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a18;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #8B6A3E;
          box-shadow: 0 0 0 3px rgba(139,106,62,0.1);
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
        input::placeholder, textarea::placeholder { color: #B4B2A9; }
        .field { margin-bottom: 14px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #888780;
          margin-bottom: 6px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .btn-primary {
          width: 100%;
          padding: 15px 24px;
          background: #1a1a18;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { background: #333330; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-back {
          background: none;
          border: 1.5px solid #D6D4CE;
          border-radius: 12px;
          padding: 13px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #888780;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-back:hover { border-color: #1a1a18; color: #1a1a18; }

        .option-btn {
          padding: 13px 16px;
          border: 1.5px solid #D6D4CE;
          border-radius: 12px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a18;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
        }
        .option-btn:hover { border-color: #8B6A3E; background: #FAF6F1; }
        .option-btn.selected { border-color: #8B6A3E; background: #FAF6F1; color: #8B6A3E; font-weight: 500; }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
        }
        .badge-green { background: #EAF3DE; color: #3B6D11; }
        .badge-amber { background: #FAEEDA; color: #854F0B; }
        .badge-blue  { background: #E6F1FB; color: #185FA5; }

        .card { background: #fff; border: 1px solid #E8E6E0; border-radius: 18px; padding: 20px; }
        .step-fade { animation: stepIn 0.25s ease both; }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .mobile-cta {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 998;
          padding: 12px 20px 20px;
          background: linear-gradient(to top, #fff 80%, transparent);
        }
        .mobile-cta a {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 16px;
          background: #1a1a18; color: #fff;
          border-radius: 14px; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500; text-decoration: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
        }

        @media (max-width: 900px) {
          .hero-layout  { grid-template-columns: 1fr !important; gap: 32px !important; }
          .why-layout   { grid-template-columns: 1fr !important; gap: 28px !important; }
          .grid-2       { grid-template-columns: 1fr !important; }
          .mini-cards   { grid-template-columns: 1fr !important; }
          .cta-layout   { grid-template-columns: 1fr !important; }
          .span-2       { grid-column: span 1 !important; }
          .opts-4       { grid-template-columns: 1fr 1fr !important; }
          .mobile-cta   { display: block; }
          .nav-wrap     { padding: 12px 16px !important; gap: 12px; }
          .nav-brand    { font-size: 16px !important; }
          .nav-button   { padding: 8px 12px !important; font-size: 12px !important; }
          .hero-section { overflow: hidden !important; }
          .hero-image   { display: none !important; }
          .hero-pad     { padding: 40px 16px !important; }
          .form-sticky  { position: static !important; top: auto !important; }
          .form-card    { padding: 24px 18px !important; border-radius: 18px !important; }
          .section-pad  { padding: 56px 16px !important; }
          .cta-box      { padding: 36px 20px !important; }
          .step-card    { flex-direction: column !important; align-items: flex-start !important; }
          .step-link    { margin-left: 0 !important; width: 100%; justify-content: center; }
        }
      `}</style>

      <nav className="nav-wrap" style={{
        position: "sticky", top: 0, zIndex: 999,
        background: "#fff", borderBottom: "1px solid #E8E6E0",
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B6A3E", flexShrink: 0 }} />
          <span className="serif nav-brand" style={{ fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" }}>
            EstimationGratuite<span style={{ color: "#8B6A3E" }}>.be</span>
          </span>
        </div>
        <a className="nav-button" href="#formulaire" style={{
          padding: "9px 20px", background: "#1a1a18", color: "#fff",
          borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap",
        }}>
          Estimer mon bien gratuitement
        </a>
      </nav>

      <section className="hero-section" style={{ background: "linear-gradient(135deg, #F7F5F0 0%, #fff 60%, #F7F5F0 100%)", borderBottom: "1px solid #E8E6E0", position: "relative", overflow: "hidden" }}>
        <div className="hero-image" style={{
          position: "absolute", top: 0, right: 0,
          width: "38%", height: "100%",
          backgroundImage: "url('https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop&q=80')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.12, pointerEvents: "none",
        }} />
        <div className="hero-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
          <div className="hero-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                <span className="badge badge-green">Estimation gratuite</span>
                <span className="badge badge-amber">Sans engagement</span>
                <span className="badge badge-blue">Analyse locale</span>
              </div>
              <h1 className="serif" style={{ fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
                Découvrez combien vaut réellement votre bien grâce à une estimation gratuite
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "#5F5E5A", maxWidth: 500, marginBottom: 32, fontWeight: 300 }}>
                Recevez une première estimation gratuite, sans engagement, basée sur les caractéristiques de votre bien et la réalité du marché dans votre secteur.
              </p>
              <div style={{ marginBottom: 36 }}>
                <a href="#formulaire" style={{
                  display: "inline-flex", padding: "14px 28px",
                  background: "#1a1a18", color: "#fff",
                  borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: "none",
                }}>
                  Obtenir mon estimation gratuite
                </a>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex" }}>
                    {["#C4A882", "#A8896A", "#8B6A3E"].map((bg, i) => (
                      <div key={i} style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: bg, border: "2px solid #F7F5F0",
                        marginLeft: i === 0 ? 0 : -8,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "#888780" }}>
                    <strong style={{ color: "#1a1a18" }}>+120 propriétaires</strong> ont déjà demandé leur estimation
                  </span>
                </div>
              </div>
              <div className="mini-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { title: "Analyse du marché local", desc: "Votre bien est évalué en fonction du marché local, de son agencement et de ses caractéristiques." },
                  { title: "Sans obligation de vente", desc: "Demander une estimation ne vous engage à aucune mise en vente de votre bien." },
                  { title: "Pour mieux définir votre projet", desc: "Vous obtenez un repère concret pour réfléchir plus sereinement à la suite de votre projet immobilier." },
                ].map((card) => (
                  <div key={card.title} className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{card.title}</div>
                    <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.65 }}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="formulaire" className="form-sticky" style={{ position: "sticky", top: 80 }}>
              <div className="form-card" style={{
                background: "#fff", border: "1px solid #E8E6E0",
                borderRadius: 24, padding: "32px 28px",
                boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
              }}>
                <iframe ref={iframeRef} name="hidden_iframe" title="hidden_iframe" style={{ display: "none" }} onLoad={handleIframeLoad} />

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "#EAF3DE", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      margin: "0 auto 20px", fontSize: 22,
                    }}>✓</div>
                    <h2 className="serif" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                      Demande envoyée !
                    </h2>
                    <p style={{ fontSize: 14, color: "#5F5E5A", lineHeight: 1.75 }}>
                      Un professionnel de votre secteur vous contactera sous 48h pour organiser la visite d&apos;estimation, gratuitement et sans engagement.
                    </p>
                    <div style={{ marginTop: 24, padding: "14px 16px", background: "#F7F5F0", borderRadius: 12, fontSize: 13, color: "#888780" }}>
                      Réponse sous 48h · Aucun engagement · Professionnel de votre secteur
                    </div>
                  </div>
                ) : (
                  <form action={SCRIPT_URL} method="POST" target="hidden_iframe" onSubmit={handleSubmit}>
                    <input type="hidden" name="typeBien" value={form.typeBien} readOnly />
                    <input type="hidden" name="chambres" value={form.chambres} readOnly />
                    <input type="hidden" name="surface" value={form.surface} readOnly />
                    <input type="hidden" name="etat" value={form.etat} readOnly />
                    <input type="hidden" name="rue" value={form.rue} readOnly />
                    <input type="hidden" name="numero" value={form.numero} readOnly />
                    <input type="hidden" name="codePostal" value={form.codePostal} readOnly />
                    <input type="hidden" name="ville" value={form.ville} readOnly />
                    <input type="hidden" name="delai" value={form.delai} readOnly />
                    <input type="hidden" name="message" value={form.message} readOnly />
                    <input type="hidden" name="nom" value={form.nom} readOnly />
                    <input type="hidden" name="telephone" value={form.telephone} readOnly />
                    <input type="hidden" name="email" value={form.email} readOnly />

                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Étape {step} sur 4
                        </span>
                        <span style={{ fontSize: 12, color: "#8B6A3E", fontWeight: 500 }}>
                          {STEPS[step - 1].label}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {STEPS.map((s) => (
                          <div key={s.num} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: s.num <= step ? "#8B6A3E" : "#E8E6E0",
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                    </div>

                    {step === 1 && (
                      <div className="step-fade">
                        <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Votre bien</h2>
                        <p style={{ fontSize: 13, color: "#888780", marginBottom: 24, lineHeight: 1.6 }}>
                          Quelques informations sur le bien à estimer.
                        </p>
                        <div className="field">
                          <label>Type de bien</label>
                          <div className="opts-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                            {["Maison", "Appartement", "Studio", "Duplex", "Triplex", "Terrain", "Immeuble"].map((type) => (
                              <button key={type} type="button"
                                className={`option-btn${form.typeBien === type ? " selected" : ""}`}
                                onClick={() => setField("typeBien", type)}
                                style={{ textAlign: "center", padding: "11px 8px", fontSize: 13 }}>
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="field" style={{ marginTop: 16 }}>
                          <label>Nombre de chambres</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {["0", "1", "2", "3", "4", "5+"].map((count) => (
                              <button key={count} type="button"
                                className={`option-btn${form.chambres === count ? " selected" : ""}`}
                                onClick={() => setField("chambres", count)}
                                style={{ textAlign: "center", flex: 1, minWidth: 46, padding: "11px 6px", fontSize: 14, fontWeight: 500 }}>
                                {count}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: 4 }}>
                          <div className="field">
                            <label>Surface habitable (m²)</label>
                            <input type="number" min="1" placeholder="120"
                              value={form.surface} onChange={(e) => setField("surface", e.target.value)} />
                          </div>
                          <div className="field">
                            <label>État général</label>
                            <select value={form.etat} onChange={(e) => setField("etat", e.target.value)}>
                              <option value="">Choisir</option>
                              <option value="À rénover">À rénover</option>
                              <option value="À rafraîchir">À rafraîchir</option>
                              <option value="Bon état">Bon état</option>
                              <option value="Excellent état">Excellent état</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="step-fade">
                        <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Localisation du bien</h2>
                        <p style={{ fontSize: 13, color: "#888780", marginBottom: 24, lineHeight: 1.6 }}>
                          L&apos;adresse exacte permet au professionnel de préparer son analyse du marché local.
                        </p>
                        <div className="grid-2">
                          <div className="field">
                            <label>Rue</label>
                            <input type="text" placeholder="Rue de la Gare"
                              value={form.rue} onChange={(e) => setField("rue", e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Numéro</label>
                            <input type="text" placeholder="12"
                              value={form.numero} onChange={(e) => setField("numero", e.target.value)} />
                          </div>
                        </div>
                        <div className="grid-2">
                          <div className="field">
                            <label>Code postal</label>
                            <input type="text" placeholder="6230"
                              value={form.codePostal} onChange={(e) => setField("codePostal", e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Ville / Commune</label>
                            <input type="text" placeholder="Pont-à-Celles"
                              value={form.ville} onChange={(e) => setField("ville", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="step-fade">
                        <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Votre projet</h2>
                        <p style={{ fontSize: 13, color: "#888780", marginBottom: 24, lineHeight: 1.6 }}>
                          Ces informations permettent au professionnel de mieux adapter son approche.
                        </p>
                        <div className="field">
                          <label>Délai de vente envisagé</label>
                          <div style={{ display: "grid", gap: 8 }}>
                            {["Dès que possible", "Dans les 3 mois", "Dans les 6 mois", "Je me renseigne simplement"].map((delay) => (
                              <button key={delay} type="button"
                                className={`option-btn${form.delai === delay ? " selected" : ""}`}
                                onClick={() => setField("delai", delay)}>
                                {delay}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="field" style={{ marginTop: 16 }}>
                          <label>
                            Précisions supplémentaires <span style={{ fontWeight: 400, color: "#B4B2A9" }}>(facultatif)</span>
                          </label>
                          <textarea rows={3}
                            placeholder="Jardin, garage, rénovations récentes..."
                            value={form.message}
                            onChange={(e) => setField("message", e.target.value)}
                            style={{ resize: "vertical" }} />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="step-fade">
                        <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Vos coordonnées</h2>
                        <p style={{ fontSize: 13, color: "#888780", marginBottom: 24, lineHeight: 1.6 }}>
                          Pour que le professionnel puisse vous contacter et fixer le rendez-vous d&apos;estimation.
                        </p>
                        <div className="field">
                          <label>Prénom et nom</label>
                          <input type="text" placeholder="Jean Dupont"
                            value={form.nom} onChange={(e) => setField("nom", e.target.value)} />
                        </div>
                        <div className="field">
                          <label>Téléphone</label>
                          <input type="tel" inputMode="tel" placeholder="+32 4..."
                            value={form.telephone} onChange={(e) => setField("telephone", e.target.value)} />
                        </div>
                        <div className="field">
                          <label>E-mail</label>
                          <input type="email" placeholder="jean@exemple.be"
                            value={form.email} onChange={(e) => setField("email", e.target.value)} />
                        </div>
                        <div style={{
                          display: "flex", justifyContent: "center", gap: 20,
                          padding: "12px 0", marginBottom: 16,
                          borderTop: "1px solid #F1EFE8", borderBottom: "1px solid #F1EFE8",
                          flexWrap: "wrap",
                        }}>
                          {["Réponse sous 48h", "Aucun engagement", "Professionnel de votre secteur"].map((text) => (
                            <span key={text} style={{ fontSize: 12, color: "#888780", display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ color: "#3B6D11", fontWeight: 700 }}>✓</span> {text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      {step > 1 && (
                        <button type="button" className="btn-back" onClick={goBack} style={{ flex: "0 0 auto" }}>
                          ← Retour
                        </button>
                      )}
                      {step < 4 ? (
                        <button type="button" className="btn-primary" disabled={!canNext()} onClick={goNext}>
                          Continuer →
                        </button>
                      ) : (
                        <button type="submit" className="btn-primary" disabled={!canNext() || isSubmitting}>
                          {isSubmitting ? "Envoi en cours..." : "Demander mon estimation →"}
                        </button>
                      )}
                    </div>

                    {submitError && (
                      <p style={{ marginTop: 12, fontSize: 12, color: "#B3261E", textAlign: "center" }}>
                        {submitError}
                      </p>
                    )}

                    <p style={{ marginTop: 14, fontSize: 11, color: "#B4B2A9", lineHeight: 1.6, textAlign: "center" }}>
                      En cliquant sur « Demander mon estimation », vous acceptez la politique de confidentialité de EstimationGratuite.be et le traitement de vos données afin d&apos;être recontacté dans le cadre de votre demande d&apos;estimation.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div className="why-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>
              Pourquoi choisir un professionnel pour estimer votre bien ?
            </p>
            <h2 className="serif" style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
              Rien ne remplace le regard d&apos;un professionnel sur votre bien
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#5F5E5A", fontWeight: 300 }}>
              Un simple outil en ligne ne perçoit pas tout ce qui fait la valeur réelle d&apos;un bien. La luminosité, l&apos;agencement, l&apos;état d&apos;entretien, les finitions et l&apos;environnement immédiat influencent directement son estimation. Le regard d&apos;un professionnel permet d&apos;apprécier ces éléments avec précision, en tenant compte de tous les atouts de votre bien, afin d&apos;aboutir à une estimation juste.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Une vision plus juste du marché</h3>
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>
                Le marché immobilier ne se résume pas à des données générales. Un professionnel actif sur le terrain en comprend les évolutions et les spécificités avec une précision qu&apos;un outil en ligne ne peut offrir.
              </p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Le regard d&apos;un professionnel change tout</h3>
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>
                La visite d&apos;un professionnel permet d&apos;apprécier le bien dans tous ses aspects, d&apos;en révéler les atouts et de vous conseiller avec précision selon votre situation et votre projet.
              </p>
            </div>
            <div className="card span-2" style={{ gridColumn: "span 2" }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>L&apos;humain au centre de votre projet</h3>
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.7 }}>
                Au-delà de l&apos;estimation, un professionnel vous accompagne, vous conseille et vous aide à mieux comprendre les étapes de votre projet immobilier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: "#1a1a18", color: "#FAFAF8", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="why-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>
                Comment ça fonctionne ?
              </p>
              <h2 className="serif" style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
                Votre estimation en quelques étapes simples
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "#B4B2A9", fontWeight: 300 }}>
                Complétez votre demande d&apos;estimation en quelques instants. Un professionnel de votre secteur vous contacte ensuite et organise un rendez-vous pour en apprécier la valeur.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 16 }}>
                3 étapes simples
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { n: "1", t: "Vous introduisez votre demande", link: true },
                  { n: "2", t: "Un professionnel vous contacte", link: false },
                  { n: "3", t: "Un rendez-vous est fixé", link: false },
                ].map((item) => (
                  <div key={item.n} className="step-card" style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "18px 22px",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "#8B6A3E", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 500, flexShrink: 0,
                    }}>{item.n}</div>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{item.t}</span>
                    {item.link && (
                      <a className="step-link" href="#formulaire" style={{
                        marginLeft: "auto", padding: "7px 14px",
                        background: "#fff", color: "#1a1a18",
                        borderRadius: 8, fontSize: 13, fontWeight: 500,
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}>
                        Demander mon estimation
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ background: "#F1EFE8", borderRadius: 28, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="cta-layout">
          <div className="cta-box" style={{ padding: "56px 48px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#888780", marginBottom: 14 }}>
              Vous envisagez de vendre votre bien ?
            </p>
            <h2 className="serif" style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
              Une vente bien préparée commence par une estimation sérieuse
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#5F5E5A", fontWeight: 300, marginBottom: 32 }}>
              Dans un marché immobilier belge de plus en plus exigeant, préparer correctement sa vente est essentiel. Entre cadre administratif, informations à rassembler et positionnement du bien sur le marché, une estimation juste permet d&apos;avancer sur des bases solides.
            </p>
            <a href="#formulaire" style={{
              display: "inline-flex", padding: "16px 32px",
              background: "#1a1a18", color: "#fff",
              borderRadius: 12, fontSize: 15, fontWeight: 500,
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Je demande mon estimation gratuite
            </a>
          </div>
          <div style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80')",
            backgroundSize: "cover", backgroundPosition: "center",
            minHeight: 320,
          }} />
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #E8E6E0", background: "#fff", padding: "32px", textAlign: "center" }}>
        <span className="serif" style={{ fontSize: 16, fontWeight: 700 }}>
          EstimationGratuite<span style={{ color: "#8B6A3E" }}>.be</span>
        </span>
      </footer>

      <div className="mobile-cta">
        <a href="#formulaire">Démarrer mon estimation →</a>
      </div>
    </div>
  );
}
