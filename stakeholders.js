/* ===========================
   STAKEHOLDER DATA
   =========================== */

const stakeholders = [
  {
    key: "national",
    name: "National parties",
    reach: 1.0,
    costSensitivity: 0.7,
    tooltip:
      "Low pressure in Sweden-style cycles; strongest when LS and VS are synchronized and costs stay contained. ",
    description:
      "Gain from a single national narrative and reduced need for constant elections."
  },
  {
    key: "regional",
    name: "Regional parties",
    reach: 0.65,
    costSensitivity: 1.15,
    tooltip:
      "Pressure rises quickly as ballots get longer and national contests dominate, similar to Philippine mega elections.",
    description:
      "Depend on state-specific visibility; vulnerable when LS, VS, and local polls converge."
  },
  {
    key: "wealthy_states",
    name: "Wealthier states",
    reach: 0.9,
    costSensitivity: 0.85,
    tooltip:
      "Better able to finance extra EVMs and manage CAPF/logistics in a synchronized cycle.",
    description:
      "Higher administrative and fiscal capacity keeps pressure moderate even under tighter cycles."
  },
  {
    key: "lowcap_states",
    name: "Lower‑capacity states",
    reach: 0.8,
    costSensitivity: 1.35,
    tooltip:
      "Face the sharpest strain from MCC freezes, security deployment, and logistics if ONOE resembles the Philippine model.",
    description:
      "Need staggered implementation and support when LS/VS/local polls bunch together."
  }
];

/* ===========================
   STATE + DOM
   =========================== */

let costFactor = 0.9;
let turnoutFactor = 1.0;

const kpiGrid = document.getElementById("stakeholder-kpis");
const chartRoot = document.getElementById("stakeholder-chart");
const verdict = document.getElementById("stakeholder-verdict");

const costSlider = document.getElementById("costSlider");
const turnoutSlider = document.getElementById("turnoutSlider");
const costVal = document.getElementById("costVal");
const turnoutVal = document.getElementById("turnoutVal");

const tooltip = document.getElementById("chart-tooltip");
const tooltipTitle = document.getElementById("tooltip-title");
const tooltipValue = document.getElementById("tooltip-value");
const tooltipText = document.getElementById("tooltip-text");

/* ===========================
   METRIC CALC
   =========================== */

function computePressure(s) {
  const costComponent = costFactor * s.costSensitivity * 50;
  const turnoutComponent = turnoutFactor * (1 - s.reach) * 50;
  return Math.max(0, Math.min(100, costComponent + turnoutComponent));
}

/* ===========================
   RENDER KPI + GRAPH
   =========================== */

function renderStakeholders() {
  const computed = stakeholders.map(s => ({
    ...s,
    pressure: computePressure(s)
  }));
  const maxPressure = Math.max(...computed.map(s => s.pressure)) || 1;

  // KPI cards (same layout as other pages)
  kpiGrid.innerHTML = "";
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

  // Horizontal bar graph (same row structure as Governance/Financial)
  chartRoot.innerHTML = "";
  computed.forEach(s => {
    const row = document.createElement("div");
    row.className = "stakeholder-row";

    const labelEl = document.createElement("div");
    labelEl.className = "stakeholder-label";
    labelEl.textContent = s.name;

    const track = document.createElement("div");
    track.className = "stakeholder-bar-track";

    const fill = document.createElement("div");
    fill.className = "stakeholder-bar-fill";
    fill.style.width = `${(s.pressure / maxPressure) * 100}%`;
    fill.dataset.name = s.name;
    fill.dataset.value = s.pressure.toFixed(1);
    fill.dataset.text = s.tooltip;

    const scoreEl = document.createElement("div");
    scoreEl.className = "stakeholder-score";
    scoreEl.textContent = s.pressure.toFixed(0);

    track.appendChild(fill);
    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(scoreEl);
    chartRoot.appendChild(row);
  });

  verdict.textContent =
    "At low cost and disruption, national parties and wealthier states face manageable pressure, but as assumptions move towards a Philippine‑style mega election, regional parties and lower‑capacity states become the most stressed actors in India’s ONOE transition.";

  attachTooltipHandlers();
}

/* ===========================
   TOOLTIP HANDLERS
   Same pattern as other pages:
   - one tooltip div
   - mouseenter / mouseleave
   =========================== */

function attachTooltipHandlers() {
  const bars = chartRoot.querySelectorAll(".stakeholder-bar-fill");

  bars.forEach(bar => {
    bar.addEventListener("mouseenter", e => {
      const rect = e.target.getBoundingClientRect();

      tooltipTitle.textContent = e.target.dataset.name;
      tooltipValue.textContent = `${e.target.dataset.value} / 100`;
      tooltipText.textContent = e.target.dataset.text;

      const top = rect.top + window.scrollY - tooltip.offsetHeight - 8;
      const left = rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2;

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.opacity = "1";
      tooltip.style.pointerEvents = "auto";
    });

    bar.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      tooltip.style.pointerEvents = "none";
    });
  });
}

/* ===========================
   SLIDER EVENTS
   =========================== */

costSlider.addEventListener("input", e => {
  costFactor = parseFloat(e.target.value);
  costVal.textContent = costFactor.toFixed(2);
  renderStakeholders();
});

turnoutSlider.addEventListener("input", e => {
  turnoutFactor = parseFloat(e.target.value);
  turnoutVal.textContent = turnoutFactor.toFixed(2);
  renderStakeholders();
});

/* ===========================
   INITIAL RENDER
   =========================== */

renderStakeholders();
