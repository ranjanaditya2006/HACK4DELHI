/* =========================================================
   STAKEHOLDER DATA MODEL
   ========================================================= */

const stakeholders = [
  {
    key: "national",
    name: "National political parties",
    reach: 1.0,
    costSensitivity: 0.7,
    description: "Benefit from unified national campaigns and scale efficiencies."
  },
  {
    key: "regional",
    name: "Regional political parties",
    reach: 0.65,
    costSensitivity: 1.0,
    description: "Face higher coordination and visibility challenges."
  },
  {
    key: "wealthy",
    name: "Wealthier states",
    reach: 0.9,
    costSensitivity: 0.8,
    description: "Better positioned to absorb administrative and logistical shocks."
  },
  {
    key: "lowcap",
    name: "Lower-capacity states",
    reach: 0.8,
    costSensitivity: 1.2,
    description: "More exposed to cost overruns and administrative strain."
  }
];

/* =========================================================
   STATE VARIABLES (CONTROLLED BY SLIDERS)
   ========================================================= */

let costFactor = 0.9;
let turnoutFactor = 1.0;

/* =========================================================
   DOM HOOKS
   ========================================================= */

const kpiGrid = document.getElementById("stakeholder-kpis");
const chartRoot = document.getElementById("stakeholder-chart");
const verdict = document.getElementById("stakeholder-verdict");

const costSlider = document.getElementById("costSlider");
const turnoutSlider = document.getElementById("turnoutSlider");
const costVal = document.getElementById("costVal");
const turnoutVal = document.getElementById("turnoutVal");

/* =========================================================
   CORE COMPUTATION
   ========================================================= */

function computePressure(s) {
  const costComponent = costFactor * s.costSensitivity * 50;
  const turnoutComponent = turnoutFactor * (1 - s.reach) * 50;
  return costComponent + turnoutComponent;
}

/* =========================================================
   RENDER FUNCTION (REBUILDS DOM EVERY TIME)
   ========================================================= */

function render() {
  kpiGrid.innerHTML = "";
  chartRoot.innerHTML = "";

  const computed = stakeholders.map(s => ({
    ...s,
    pressure: computePressure(s)
  }));

  const maxPressure = Math.max(...computed.map(s => s.pressure));

  /* KPI cards */
  computed.forEach(s => {
    const card = document.createElement("div");
    card.className = "kpi-card";
    card.innerHTML = `
      <div class="kpi-label">${s.name}</div>
      <div class="kpi-value">${s.pressure.toFixed(1)}</div>
      <div class="kpi-delta">${s.description}</div>
    `;
    kpiGrid.appendChild(card);
  });

  /* Dynamic bar chart */
  computed.forEach(s => {
    const row = document.createElement("div");
    row.className = "stakeholder-row";

    const widthPct = (s.pressure / maxPressure) * 100;

    row.innerHTML = `
      <div class="stakeholder-label">${s.name}</div>
      <div class="stakeholder-bar-track">
        <div class="stakeholder-bar-fill"
             style="width:${widthPct}%"></div>
      </div>
      <div class="stakeholder-score">${s.pressure.toFixed(0)}</div>
    `;

    chartRoot.appendChild(row);
  });

  verdict.textContent =
    "Stakeholder pressure shifts significantly as assumptions change. " +
    "Higher values indicate greater coordination, cost, and turnout stress under synchronized elections.";
}

/* =========================================================
   SLIDER EVENTS (LIVE RECOMPUTE)
   ========================================================= */

costSlider.addEventListener("input", e => {
  costFactor = parseFloat(e.target.value);
  costVal.textContent = costFactor.toFixed(2);
  render();
});

turnoutSlider.addEventListener("input", e => {
  turnoutFactor = parseFloat(e.target.value);
  turnoutVal.textContent = turnoutFactor.toFixed(2);
  render();
});

/* =========================================================
   INITIAL RENDER
   ========================================================= */

render();