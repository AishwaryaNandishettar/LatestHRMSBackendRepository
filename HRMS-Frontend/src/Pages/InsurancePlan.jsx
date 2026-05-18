// src/Pages/InsurancePlans.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PersonalInsurance.css";
import { getInsurancePlans } from "../api/insuranceApi";
// sample plans by company id (simple dataset)
const plansByCompany = {
  star: [
    { id: "s-basic", name: "Star Basic", coverage: 200000, premium: 3000, benefits: ["Hospitalization", "Pre-existing after 2 yrs"] },
    { id: "s-standard", name: "Star Standard", coverage: 500000, premium: 5500, benefits: ["OPD cover", "Cashless network"] },
    { id: "s-premium", name: "Star Premium", coverage: 1000000, premium: 12000, benefits: ["Maternity", "Health checkup every year"] },
  ],
  hdfc: [
    { id: "h-basic", name: "HDFC Basic", coverage: 200000, premium: 3200, benefits: ["Hospitalization"] },
    { id: "h-gold", name: "HDFC Gold", coverage: 750000, premium: 9800, benefits: ["OPD", "Cashless", "Ambulance"] },
  ],
  icici: [
    { id: "i-basic", name: "ICICI Protect", coverage: 300000, premium: 4200, benefits: ["Network hospitals", "No-claim bonus"] },
    { id: "i-platinum", name: "ICICI Platinum", coverage: 1500000, premium: 20000, benefits: ["Full family floater", "Maternity cover"] },
  ],
  bajaj: [
    { id: "b-standard", name: "Bajaj Standard", coverage: 500000, premium: 6000, benefits: ["OPD", "Cashless"] },
  ],
};

const InsurancePlans = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  //const plans = plansByCompany[companyId] || [];
const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(plans[0]?.id || null);

  const handleProceed = () => {
    const plan = plans.find(p => p.id === selected);
    if (!plan) return alert("Select a plan first");
    // pass plan via state (or use a store / api)
    navigate("/insurance/apply", { state: { companyId, plan } });
  };

  const loadPlans = async () => {
  const data = await getInsurancePlans(companyId);
  setPlans(data);
};
  useEffect(() => {
  loadPlans();
}, [companyId]);

  return (
    <div className="ins-page">
      <div className="ins-hero small">
        <h1>Plans</h1>
        <p className="muted">Choose a plan — price shown per year</p>
      </div>

      <div className="plans-grid">
        {plans.map((p) => (
          <div key={p.id} className={`plan-card ${selected === p.id ? "selected" : ""}`} onClick={() => setSelected(p.id)}>
            <div className="plan-top">
              <h3>{p.name}</h3>
              <div className="coverage">₹{p.coverage.toLocaleString()}</div>
            </div>
            <div className="plan-body">
              <div className="plan-body">

  <p><b>Policy No:</b> {p.policyNo}</p>

  <p><b>Insurance Type:</b> {p.insuranceType}</p>

  <div className="premium">
    Premium <span>₹{p.yearlyPremium}/yr</span>
  </div>

  <p><b>Coverage:</b> ₹{p.coverage.toLocaleString()}</p>

  <p><b>Covered For:</b></p>
  <ul>
    {p.coveredFor?.map((c, i) => (
      <li key={i}>{c}</li>
    ))}
  </ul>

  <ul className="benefits">
    {p.benefits?.map((b, i) => (
      <li key={i}>{b}</li>
    ))}
  </ul>

</div>
              <div className="premium">Premium <span>₹{p.premium.toLocaleString()}/yr</span></div>
              <ul className="benefits">
                {p.benefits.map((b,i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="plans-actions">
        <button className="btn ghost" onClick={() => navigate(-1)}>Back</button>
        <button className="btn neon" onClick={handleProceed}>Buy / Apply</button>
      </div>
    </div>
  );
};

export default InsurancePlans;
