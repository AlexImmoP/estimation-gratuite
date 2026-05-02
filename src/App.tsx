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

export default function RealEstateLeadPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
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
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 1) return form.codePostal;
    if (step === 2) return form.projet && form.delai;
    if (step === 3) return form.typeBien && form.chambres && form.etat;
    if (step === 4)
      return (
        form.nom &&
        form.telephone &&
        form.email &&
        form.rue &&
        form.numero &&
        form.ville
      );
  };

  const goNext = () => canNext() && setStep((s) => (s + 1) as Step);
  const goBack = () => setStep((s) => (s - 1) as Step);

  const handleSubmit = () => {
    if (!canNext()) return;
    setIsSubmitting(true);
  };

  const handleIframeLoad = () => {
    if (!isSubmitting) return;
    setIsSubmitting(false);
    setSubmitted(true);
  };

  // scroll propre
  useEffect(() => {
    const el = formTopRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [step]);

  return (
    <div style={{ fontFamily: "DM Sans", paddingBottom: 80 }}>
      <style>{`
        * { box-sizing: border-box }

        .form-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          min-height: 420px;
          transition: all 0.25s ease;
        }

        .form-body {
          flex: 1;
          padding-bottom: 110px;
        }

        .form-actions {
          position: sticky;
          bottom: 0;
          background: white;
          padding-top: 12px;
        }

        .btn {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: black;
          color: white;
          font-size: 16px;
        }

        .option-btn {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 12px;
          width: 100%;
          margin-bottom: 8px;
        }

        .option-btn.selected {
          border-color: #8B6A3E;
          background: #FAF6F1;
        }
      `}</style>

      <div className="form-card">
        <iframe
          ref={iframeRef}
          name="hidden_iframe"
          style={{ display: "none" }}
          onLoad={handleIframeLoad}
        />

        {submitted ? (
          <div>Merci, demande envoyée</div>
        ) : (
          <form
            action={SCRIPT_URL}
            method="POST"
            target="hidden_iframe"
            onSubmit={(e) => {
              if (step !== 4) {
                e.preventDefault(); // 🔥 FIX BUG
                return;
              }
              handleSubmit();
            }}
          >
            <div ref={formTopRef} />

            <div className="form-body">
              {step === 1 && (
                <>
                  <h2>Code postal</h2>
                  <input
                    value={form.codePostal}
                    onChange={(e) =>
                      setField("codePostal", e.target.value)
                    }
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Projet</h2>

                  {[
                    "Je souhaite vendre mon bien",
                    "Je prépare une vente",
                    "Je veux connaître la valeur",
                    "Je me renseigne (pas encore vendeur)",
                  ].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`option-btn ${
                        form.projet === p ? "selected" : ""
                      }`}
                      onClick={() => setField("projet", p)}
                    >
                      {p}
                    </button>
                  ))}

                  <h3>Délai</h3>

                  {[
                    "Dès que possible",
                    "3 mois",
                    "6 mois",
                    "Je ne sais pas encore",
                  ].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`option-btn ${
                        form.delai === d ? "selected" : ""
                      }`}
                      onClick={() => setField("delai", d)}
                    >
                      {d}
                    </button>
                  ))}
                </>
              )}

              {step === 3 && <div>Step 3</div>}
              {step === 4 && <div>Coordonnées</div>}
            </div>

            <div className="form-actions">
              {step > 1 && (
                <button type="button" onClick={goBack}>
                  Retour
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="btn"
                  onClick={goNext}
                  disabled={!canNext()}
                >
                  Continuer →
                </button>
              ) : (
                <button className="btn">
                  {isSubmitting ? "..." : "Envoyer"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
