import { useEffect, useRef, useState } from "react";

/* === TYPES === */
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

/* === CONFIG === */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhdY9p_l8F1i-XMqZs93_wWZnazlOkEKygFZXB-Ke33kqkZWcHwQ16ObfWFrOfgjCE/exec";

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

export default function RealEstateLeadPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 1) return !!form.codePostal;
    if (step === 2) return !!form.projet && !!form.delai;
    if (step === 3) return !!form.typeBien && !!form.chambres && !!form.etat;
    if (step === 4) return !!form.nom && !!form.telephone && !!form.email;
    return false;
  };

  const goNext = () => canNext() && setStep((s) => (s + 1) as Step);
  const goBack = () => setStep((s) => (s - 1) as Step);

  /* ✅ FIX BUG SUBMIT */
  const handleSubmit = (e: any) => {
    if (step !== 4) {
      e.preventDefault();
      return;
    }

    if (!canNext() || isSubmitting) {
      e.preventDefault();
      return;
    }

    setIsSubmitting(true);
  };

  const handleIframeLoad = () => {
    if (!isSubmitting) return;
    setIsSubmitting(false);
    setSubmitted(true);
  };

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ maxWidth: 400, margin: "auto" }}>

        <iframe
          ref={iframeRef}
          name="hidden_iframe"
          style={{ display: "none" }}
          onLoad={handleIframeLoad}
        />

        {submitted ? (
          <div>✅ Votre demande a bien été envoyée</div>
        ) : (
          <form
            action={SCRIPT_URL}
            method="POST"
            target="hidden_iframe"
            onSubmit={handleSubmit}
            noValidate
          >

            <div ref={formTopRef} />

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2>Code postal</h2>
                <input
                  value={form.codePostal}
                  onChange={(e) => setField("codePostal", e.target.value)}
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2>Votre projet</h2>

                {/* ❌ supprimé "je me renseigne simplement" */}
                {[
                  "Je souhaite vendre mon bien",
                  "Je prépare une vente dans les prochains mois",
                  "Je souhaite connaître la valeur de mon bien",
                ].map((project) => (
                  <button
                    key={project}
                    type="button"
                    onClick={() => setField("projet", project)}
                  >
                    {project}
                  </button>
                ))}

                {/* ✅ délai affiché après choix */}
                {form.projet && (
                  <>
                    <h3>Délai</h3>

                    {[
                      "Dès que possible",
                      "Dans les 3 mois",
                      "Dans les 6 mois",
                      "Plus de 6 mois",
                    ].map((delay) => (
                      <button
                        key={delay}
                        type="button"
                        onClick={() => setField("delai", delay)}
                      >
                        {delay}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h2>Votre bien</h2>

                <button type="button" onClick={() => setField("typeBien", "Maison")}>
                  Maison
                </button>

                <button type="button" onClick={() => setField("chambres", "3")}>
                  3 chambres
                </button>

                <select onChange={(e) => setField("etat", e.target.value)}>
                  <option value="">Etat</option>
                  <option>Bon état</option>
                </select>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <h2>Vos coordonnées</h2>

                <input
                  autoComplete="name"
                  placeholder="Nom"
                  onChange={(e) => setField("nom", e.target.value)}
                />

                <input
                  autoComplete="tel"
                  placeholder="Téléphone"
                  onChange={(e) => setField("telephone", e.target.value)}
                />

                <input
                  autoComplete="email"
                  placeholder="Email"
                  onChange={(e) => setField("email", e.target.value)}
                />
              </>
            )}

            {/* NAVIGATION */}
            <div style={{ marginTop: 20 }}>
              {step > 1 && (
                <button type="button" onClick={goBack}>
                  ← Retour
                </button>
              )}

              {step < 4 ? (
                <button type="button" onClick={goNext} disabled={!canNext()}>
                  Continuer →
                </button>
              ) : (
                <button type="submit">
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
