import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ClerkProvider,
  Show,
  SignIn,
  SignUp,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Router as WouterRouter, Route, Switch, useLocation } from "wouter";
import { shadcn } from "@clerk/themes";
import "./styles.css";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const homePath = basePath || "/";

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY.");
}

const planItems = [
  { id: "contact", label: "I know who I can contact." },
  { id: "charge", label: "My phone has enough charge." },
  { id: "place", label: "I have a safe public place in mind." },
  { id: "location", label: "I reviewed my location-sharing settings." },
];

const privacyItems = [
  "Use unique passwords and enable two-factor authentication.",
  "Review who can see my live location and remove unknown access.",
  "Check logged-in devices and sign out unfamiliar sessions.",
  "Review social account privacy and who can message or tag me.",
  "If harassed, save relevant evidence safely before blocking or reporting.",
  "If impersonated, report the fake profile through the platform.",
];

const clerkAppearance = {
  theme: shadcn,
  options: {
    logoPlacement: "inside",
    logoLinkUrl: homePath,
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#503064",
    colorForeground: "#211a2c",
    colorMutedForeground: "#756d80",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#211a2c",
    colorDanger: "#9f3151",
    colorNeutral: "#e9e2ee",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: {
      width: "min(440px, calc(100vw - 32px))",
      backgroundColor: "#ffffff",
      borderRadius: "22px",
      boxShadow: "0 22px 60px rgba(45, 28, 58, .14)",
      overflow: "hidden",
    },
    card: { backgroundColor: "transparent", boxShadow: "none" },
    footer: { backgroundColor: "transparent", boxShadow: "none" },
    headerTitle: { color: "#211a2c", fontWeight: 750 },
    headerSubtitle: { color: "#756d80" },
    socialButtonsBlockButtonText: { color: "#211a2c" },
    formFieldLabel: { color: "#4f4559" },
    footerActionLink: { color: "#503064" },
    footerActionText: { color: "#756d80" },
    dividerText: { color: "#756d80" },
    identityPreviewEditButton: { color: "#503064" },
    formFieldSuccessText: { color: "#26775a" },
    alertText: { color: "#9f3151" },
    logoBox: { backgroundColor: "#f4eff7", borderRadius: "12px" },
    logoImage: { objectFit: "contain" },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      borderColor: "#e9e2ee",
      borderRadius: "10px",
    },
    formButtonPrimary: {
      backgroundColor: "#503064",
      color: "#ffffff",
      borderRadius: "10px",
    },
    formFieldInput: {
      backgroundColor: "#ffffff",
      color: "#211a2c",
      borderColor: "#e5dce9",
      borderRadius: "10px",
    },
    footerAction: { backgroundColor: "transparent" },
    dividerLine: { backgroundColor: "#e9e2ee" },
    alert: { backgroundColor: "#fdf2f5", color: "#9f3151" },
    otpCodeFieldInput: {
      backgroundColor: "#ffffff",
      color: "#211a2c",
      borderColor: "#e5dce9",
    },
    formFieldRow: { color: "#4f4559" },
    main: { backgroundColor: "#ffffff" },
  },
};

function stripBase(path) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function Brand() {
  return (
    <div className="brand">
      <div className="logo" aria-hidden="true">S</div>
      <div>
        <div className="brand-name">saheli</div>
        <div className="brand-tagline">Safety, on your terms.</div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <main className="app landing">
      <header className="top">
        <Brand />
        <div className="topright">
          <span className="pill">PRIVATE SAFETY PLANNING</span>
          <a className="quiet button-link" href={`${basePath}/sign-in`}>Sign in</a>
        </div>
      </header>
      <section className="hero">
        <div>
          <div className="eyebrow">YOUR PERSONAL SAFETY COMPANION</div>
          <h1>Feel prepared.<br />Stay in control.</h1>
          <p>
            Keep a safety plan and trusted contacts in your account. Choose what
            to save and share messages yourself, only when it feels safe.
          </p>
          <div className="hero-actions">
            <a className="button primary button-link" href={`${basePath}/sign-up`}>Create a private account</a>
            <a className="button outline button-link" href={`${basePath}/sign-in`}>Sign in</a>
          </div>
        </div>
        <aside className="hero-note">
          <strong>Your choices stay yours</strong>
          <span>
            Saved contacts and plan steps are tied to your account. Incident
            notes stay in this page session and are not saved.
          </span>
        </aside>
      </section>
      <section className="landing-details">
        <div className="landing-detail">
          <span className="detail-number">01</span>
          <div><strong>Plan privately</strong><p>Save trusted contacts and simple check-in steps to your account.</p></div>
        </div>
        <div className="landing-detail">
          <span className="detail-number">02</span>
          <div><strong>Share only by choice</strong><p>Saheli prepares a message; you choose whether and where to send it.</p></div>
        </div>
        <div className="landing-detail">
          <span className="detail-number">03</span>
          <div><strong>No false promises</strong><p>No automatic SOS, live tracking, or monitored emergency response.</p></div>
        </div>
      </section>
      <div className="privacy warning">
        <strong>Important:</strong> Saheli is not an emergency service. It does
        not send alerts or track your location. In immediate danger, contact
        local emergency services or a trusted person directly. In India, call
        112 if it is safe to do so.
      </div>
      <footer className="footer">
        <span>saheli · Safety planning</span>
        <span>Use a private device when possible. Sign out on shared devices.</span>
      </footer>
    </main>
  );
}

function Modal({ title, intro, onClose, children, actions, wide = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className={`modal${wide ? " modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-eyebrow">SAHELI SAFETY TOOL</div>
        <h2 id="modal-title">{title}</h2>
        {intro && <p className="modal-intro">{intro}</p>}
        <div className="modal-content">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
        <button className="modal-dismiss" type="button" onClick={onClose} aria-label="Close dialog">×</button>
      </section>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><SafetyApp /></Show>
      <Show when="signed-out"><HomePage /></Show>
    </>
  );
}

function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-heading"><Brand /><a href={homePath}>Back to Saheli</a></div>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-heading"><Brand /><a href={homePath}>Back to Saheli</a></div>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </main>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to open your private safety plan",
          },
        },
        signUp: {
          start: {
            title: "Create your Saheli account",
            subtitle: "Your plan is saved to your account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={HomeRedirect} />
      </Switch>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

function SafetyApp() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [contacts, setContacts] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [incidentType, setIncidentType] = useState("Unsafe situation");
  const [incidentText, setIncidentText] = useState("");
  const [incidentNotes, setIncidentNotes] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const [quickExit, setQuickExit] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/safety-plan")
      .then(async (response) => {
        if (!response.ok) throw new Error("load-failed");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setContacts(Array.isArray(data.contacts) ? data.contacts : []);
        setCheckedSteps(Array.isArray(data.checkedSteps) ? data.checkedSteps : []);
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => {
        if (active) setLoadError("Your saved plan could not be loaded. Refresh the page to try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3600);
  }

  function markChanged() {
    setHasUnsavedChanges(true);
  }

  function toggleStep(stepId) {
    setCheckedSteps((current) => current.includes(stepId)
      ? current.filter((step) => step !== stepId)
      : [...current, stepId]);
    markChanged();
  }

  function addContact(event) {
    event.preventDefault();
    const name = contactName.trim();
    const detail = contactDetail.trim();
    if (!name || !detail) {
      showToast("Add a contact name and a phone number or other contact detail.");
      return;
    }
    if (contacts.length >= 10) {
      showToast("You can save up to 10 trusted contacts.");
      return;
    }
    setContacts((current) => [...current, { name, detail }]);
    setContactName("");
    setContactDetail("");
    markChanged();
  }

  function removeContact(index) {
    setContacts((current) => current.filter((_contact, itemIndex) => itemIndex !== index));
    markChanged();
  }

  async function savePlan() {
    setIsSaving(true);
    try {
      const response = await fetch("/api/safety-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, checkedSteps }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your plan could not be saved.");
      setContacts(data.contacts);
      setCheckedSteps(data.checkedSteps);
      setUpdatedAt(data.updatedAt);
      setHasUnsavedChanges(false);
      showToast("Your safety plan was saved to your account.");
    } catch (error) {
      showToast(error.message || "Your plan could not be saved. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSavedPlan() {
    try {
      const response = await fetch("/api/safety-plan", { method: "DELETE" });
      if (!response.ok) throw new Error("Your saved plan could not be deleted.");
      setContacts([]);
      setCheckedSteps([]);
      setUpdatedAt(null);
      setHasUnsavedChanges(false);
      setModal(null);
      showToast("Your saved contacts and safety plan were deleted.");
    } catch (error) {
      showToast(error.message || "Your saved plan could not be deleted.");
    }
  }

  function saveIncidentNote() {
    const note = incidentText.trim();
    if (!note) {
      showToast("Write a short note first, or leave this optional feature unused.");
      return;
    }
    setIncidentNotes((current) => [
      { category: incidentType, note, when: new Date().toLocaleString() },
      ...current,
    ]);
    setIncidentText("");
    showToast("Note added for this page session only.");
  }

  async function shareOrCopy(text) {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Saheli safety message", text });
        showToast("Share sheet opened. Confirm the recipient and send only if safe.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          showToast("Sharing canceled. Saheli did not send the message.");
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Message copied. Send it yourself only if safe.");
    } catch {
      showToast("Copy is unavailable. Select the message and copy it manually.");
    }
  }

  function openMessage(title, intro, initialMessage, actionLabel = "Share or copy message") {
    setModal({ type: "message", title, intro, message: initialMessage, actionLabel });
  }

  function handleQuickExit() {
    setModal(null);
    setQuickExit(true);
  }

  if (quickExit) {
    return (
      <main className="quick-exit">
        <h1>Welcome</h1>
        <p>Search the web or continue browsing.</p>
        <button className="btn" type="button" onClick={() => setQuickExit(false)}>Return to Saheli</button>
        <p className="small">This changes the screen only. It does not erase browser history or close the tab.</p>
      </main>
    );
  }

  if (isLoading || !isLoaded) {
    return <main className="loading-page"><Brand /><p>Opening your private safety plan…</p></main>;
  }

  return (
    <main className="app">
      <header className="top">
        <Brand />
        <div className="topright">
          <span className="pill user-pill">{user?.firstName || user?.primaryEmailAddress?.emailAddress || "Your account"}</span>
          <button className="quiet" type="button" onClick={handleQuickExit}>Quick exit</button>
          <button className="quiet" type="button" onClick={() => signOut({ redirectUrl: homePath })}>Sign out</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">YOUR PERSONAL SAFETY COMPANION</div>
          <h1>Feel prepared.<br />Stay in control.</h1>
          <p>
            Small, practical tools for safer journeys, trusted support, and
            stronger digital privacy — without sharing more than you choose.
          </p>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={() => openMessage(
              "Emergency options",
              "If you may be in immediate danger, move toward people or a staffed public place if you can do so safely.",
              "I need support. Please call me now. If I share my location, please help me get to a safe place.",
              "Share or copy message",
            )}>Emergency options</button>
            <button className="outline" type="button" onClick={() => setModal({ type: "walk" })}>Plan a safe walk</button>
            <button className="outline" type="button" onClick={() => openMessage(
              "Silent distress alert",
              "Use only if this action is safe for your situation. Saheli does not silently notify anyone.",
              "I may be unsafe and cannot talk. Please contact me discreetly. If you believe I am in immediate danger, contact emergency services.",
            )}>Silent alert</button>
          </div>
        </div>
        <aside className="hero-note">
          <strong>Privacy comes first</strong>
          <span>Only contacts and plan steps are saved to your account. Incident notes are not saved.</span>
        </aside>
      </section>

      <div className="section-head">
        <div><h2>Your safety toolkit</h2><p>Choose the support that fits the moment.</p></div>
        <span className="pill">8 tools · account protected</span>
      </div>

      {loadError && <div className="inline-error" role="alert">{loadError}</div>}

      <section className="grid">
        <article className="card">
          <CardHead icon="SOS" title="Emergency options" subtitle="A clear next step when it matters" />
          <p>Prepare a message for a person you trust, or call emergency services directly if it is safe.</p>
          <button className="btn full" type="button" onClick={() => openMessage(
            "Emergency options",
            "In India, call 112 if it is safe and appropriate. This app cannot call for you.",
            "I need support. Please call me now. If I share my location, please help me get to a safe place.",
          )}>Prepare a support message</button>
          <a className="text-link" href="tel:112">Call 112 (India)</a>
          <div className="small">The call starts only if you choose the link on a device that supports calling.</div>
        </article>

        <article className="card card-alert">
          <CardHead icon="DS" title="Discreet SOS" subtitle="Ask for help without speaking" />
          <p>Prepare a quiet help request. You choose whether and where to share it.</p>
          <button className="btn-danger full" type="button" onClick={() => openMessage(
            "Discreet SOS",
            "Keep your screen and actions in mind if someone may be monitoring your device.",
            "I may be unsafe and cannot speak freely. Please contact me discreetly. If I share my location or details, help me reach a safe place.",
            "Share or copy discreet message",
          )}>Prepare discreet message</button>
          <div className="small">No automatic alert or location sharing.</div>
        </article>

        <article className="card">
          <CardHead icon="DS" title="Silent distress alert" subtitle="Ask for help without speaking" />
          <p>Prepare a distress message to share with someone you trust when speaking may not be safe.</p>
          <button className="btn-danger full" type="button" onClick={() => openMessage(
            "Silent distress alert",
            "Choose “Share” to open your device share sheet when supported. You must confirm the recipient and send.",
            "I may be unsafe and cannot talk. Please contact me discreetly. If you believe I am in immediate danger, contact emergency services.",
          )}>Open silent alert</button>
          <div className="small">No automatic notification, delivery confirmation, or GPS location.</div>
        </article>

        <article className="card">
          <CardHead icon="SW" title="Safe walk" subtitle="Plan a check-in" />
          <p>Set a destination and check-in time, then prepare a message to share yourself.</p>
          <button className="btn-soft full" type="button" onClick={() => setModal({ type: "walk" })}>Plan my walk</button>
        </article>

        <article className="card">
          <CardHead icon="DP" title="Digital privacy check" subtitle="Review account and device settings" />
          <p>Review practical steps for accounts, location sharing, impersonation, and evidence.</p>
          <button className="btn-soft full" type="button" onClick={() => setModal({ type: "privacy" })}>Run privacy check</button>
          <div className="small">Checklist progress is not saved or shared.</div>
        </article>

        <article className="card">
          <CardHead icon="TC" title="Trusted contacts" subtitle="People you choose" />
          <p>These contacts are saved only when you choose “Save my plan.”</p>
          <form onSubmit={addContact}>
            <div className="field">
              <label htmlFor="contactName">Contact name</label>
              <input id="contactName" value={contactName} onChange={(event) => setContactName(event.target.value)} maxLength={80} placeholder="e.g. Ayesha" />
            </div>
            <div className="field">
              <label htmlFor="contactDetail">Phone or contact detail</label>
              <input id="contactDetail" value={contactDetail} onChange={(event) => setContactDetail(event.target.value)} maxLength={120} placeholder="e.g. phone or email" />
            </div>
            <button className="btn-soft full" type="submit">+ Add trusted contact</button>
          </form>
          <div className="contact-list">
            {contacts.length ? contacts.map((contact, index) => (
              <div className="contact" key={`${contact.name}-${index}`}>
                <div><strong>{contact.name}</strong><span>{contact.detail}</span></div>
                <button className="quiet remove-button" type="button" onClick={() => removeContact(index)} aria-label={`Remove ${contact.name}`}>Remove</button>
              </div>
            )) : <div className="small">No contacts added yet.</div>}
          </div>
        </article>

        <article className="card">
          <CardHead icon="SP" title="My safety plan" subtitle="A little preparation helps" />
          <div className="checklist">
            {planItems.map((item) => (
              <label className="checkitem" key={item.id}>
                <input
                  type="checkbox"
                  checked={checkedSteps.includes(item.id)}
                  onChange={() => toggleStep(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
          <div className="progress"><div style={{ width: `${checkedSteps.length / planItems.length * 100}%` }} /></div>
          <div className="status">{checkedSteps.length} of {planItems.length} steps checked</div>
          <button className="btn full save-plan-button" type="button" onClick={savePlan} disabled={isSaving || isLoading || Boolean(loadError)}>
            {isSaving ? "Saving…" : "Save my plan"}
          </button>
          <div className="small save-status" aria-live="polite">
            {hasUnsavedChanges ? "Unsaved changes." : updatedAt ? `Saved ${new Date(updatedAt).toLocaleString()}` : "Not saved yet."}
          </div>
          <button className="text-link danger-link" type="button" onClick={() => setModal({ type: "delete" })}>Delete saved contacts and plan</button>
        </article>

        <article className="card">
          <CardHead icon="IN" title="Private incident notes" subtitle="Session only — not saved to your account" />
          <p>Record a brief note only if it feels safe. It will disappear when you leave or refresh this page.</p>
          <div className="field">
            <label htmlFor="incidentType">Note category</label>
            <select id="incidentType" value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
              <option>Unsafe situation</option>
              <option>Online harassment</option>
              <option>Impersonation / privacy</option>
              <option>Other concern</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="incidentNote">Your note (optional)</label>
            <textarea id="incidentNote" rows="3" value={incidentText} onChange={(event) => setIncidentText(event.target.value)} placeholder="Write only what you feel safe keeping on this device…" />
          </div>
          <button className="btn-soft full" type="button" onClick={saveIncidentNote}>Add note for this session</button>
          <div className="notes-list">
            {incidentNotes.map((item, index) => (
              <div className="log-item" key={`${item.when}-${index}`}>
                <strong>{item.category}</strong><span>{item.when}</span><div>{item.note}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="privacy warning">
        <strong>Important:</strong> Saheli is not a monitored emergency service.
        It does not secretly notify anyone, guarantee message delivery, or attach
        GPS. In immediate danger, contact local emergency services or a trusted
        person directly. In India, call 112 if it is safe to do so.
      </div>
      <footer className="footer">
        <span>saheli · Safety planning</span>
        <span>Sign out on shared devices. This app does not monitor your safety.</span>
      </footer>

      {modal?.type === "message" && (
        <Modal
          title={modal.title}
          intro={modal.intro}
          onClose={() => setModal(null)}
          actions={<button className="btn" type="button" onClick={() => shareOrCopy(modal.message)}>{modal.actionLabel}</button>}
        >
          <div className="field">
            <label htmlFor="preparedMessage">Edit the message if it is safe</label>
            <textarea id="preparedMessage" rows="5" value={modal.message} onChange={(event) => setModal({ ...modal, message: event.target.value })} />
          </div>
          <p className="small">Saheli does not send this message. Review the recipient and confirm sharing in your device or messaging app.</p>
        </Modal>
      )}

      {modal?.type === "walk" && (
        <Modal
          title="Plan a safe walk"
          intro="Saheli does not track your route or send reminders."
          onClose={() => setModal(null)}
        >
          <WalkPlanner
            contacts={contacts}
            onPrepare={(message) => openMessage(
              "Your check-in message",
              "Share this yourself with someone you trust. No location tracking or message sending is enabled.",
              message,
              "Share or copy message",
            )}
          />
          <div className="privacy">Choose a route with public, staffed places where possible, and share your plan only if that feels safe.</div>
        </Modal>
      )}

      {modal?.type === "privacy" && (
        <PrivacyChecklist onClose={() => setModal(null)} />
      )}

      {modal?.type === "delete" && (
        <Modal
          title="Delete saved safety data?"
          intro="This permanently deletes the trusted contacts and checked safety-plan steps saved to your account. Session-only incident notes are not included."
          onClose={() => setModal(null)}
          actions={
            <>
              <button className="quiet" type="button" onClick={() => setModal(null)}>Keep my data</button>
              <button className="btn-danger" type="button" onClick={deleteSavedPlan}>Delete saved data</button>
            </>
          }
        >
          <p className="small">This cannot be undone. Unsaved changes on this page will also be cleared.</p>
        </Modal>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function CardHead({ icon, title, subtitle }) {
  return (
    <div className="card-head">
      <div className="ico" aria-hidden="true">{icon}</div>
      <div><h2>{title}</h2><div className="sub">{subtitle}</div></div>
    </div>
  );
}

function WalkPlanner({ contacts, onPrepare }) {
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [contactName, setContactName] = useState("");

  function prepare() {
    const place = destination.trim() || "my destination";
    const time = checkin || "the agreed time";
    const contact = contactName || "you";
    onPrepare(`I'm heading to ${place}. I'll check in with ${contact} at ${time}. If you don't hear from me, please try calling me.`);
  }

  return (
    <>
      <div className="field">
        <label htmlFor="destination">Destination or meeting point</label>
        <input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Metro station" />
      </div>
      <div className="field">
        <label htmlFor="checkin">Check-in time</label>
        <input id="checkin" type="time" value={checkin} onChange={(event) => setCheckin(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="walkContact">Who will you check in with?</label>
        <select id="walkContact" value={contactName} onChange={(event) => setContactName(event.target.value)}>
          <option value="">Choose later / not listed</option>
          {contacts.map((contact, index) => <option key={`${contact.name}-${index}`} value={contact.name}>{contact.name}</option>)}
        </select>
      </div>
      <button className="btn full" type="button" onClick={prepare}>Prepare check-in message</button>
    </>
  );
}

function PrivacyChecklist({ onClose }) {
  const [checked, setChecked] = useState([]);
  const count = checked.length;

  function toggle(index) {
    setChecked((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  }

  return (
    <Modal
      title="Digital privacy check"
      intro="This checklist is not uploaded or shared."
      onClose={onClose}
      actions={<button className="btn" type="button" onClick={() => { onClose(); }}>Finish review</button>}
    >
      <div className="checklist">
        {privacyItems.map((item, index) => (
          <label className="checkitem" key={item}>
            <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <div className="progress"><div style={{ width: `${count / privacyItems.length * 100}%` }} /></div>
      <div className="status">{count} of {privacyItems.length} reviewed</div>
    </Modal>
  );
}

function ClerkProviderWithApp() {
  return <App />;
}

createRoot(document.getElementById("root")).render(<ClerkProviderWithApp />);
