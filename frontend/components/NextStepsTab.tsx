const STEPS = [
  {
    title: "Gather Your Documents",
    body: "Collect Aadhaar card, ration card, income certificate, passport photos, hospital referral, and bill/estimate.",
  },
  {
    title: "Visit the Nearest Empanelled Hospital",
    body: 'Go to a hospital listed in your scheme\'s network. Ask for the "Ayushman Mitra" desk at the hospital.',
  },
  {
    title: "Verify Your Eligibility",
    body: "At the hospital, show your Aadhaar and ration card. They will check your eligibility on the scheme portal.",
  },
  {
    title: "Get Cashless Treatment",
    body: "If eligible, you'll receive an e-card. Treatment will be cashless — the scheme pays the hospital directly.",
  },
  {
    title: "Keep Records",
    body: "Save copies of all documents, the e-card, and discharge summary for future reference.",
  },
];

const LINKS = [
  { href: "https://pmjay.gov.in", label: "PM-JAY Official Portal" },
  { href: "https://www.aarogyasri.telangana.gov.in", label: "Telangana Aarogyasri" },
  { href: "https://abdm.gov.in", label: "Ayushman Bharat Digital Mission" },
];

export default function NextStepsTab() {
  return (
    <div className="card steps-card">
      <h3 className="steps-title">📌 What To Do Next</h3>
      <div className="steps-list">
        {STEPS.map((step, i) => (
          <div className="step-item" key={step.title}>
            <div className="step-number">{i + 1}</div>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="helpful-links">
        <h4>🔗 Helpful Links</h4>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
