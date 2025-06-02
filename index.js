let caseData = [];
let selectedCase = null;
let activeZone = null;


const orImage = document.getElementById("or-image");
const tooltip = document.getElementById("tooltip");

// const bodyImage = document.getElementById("bodyImage");
const bodyZones = document.getElementById("body-zones");
// const zoneInfo = document.getElementById("zone-info");

// Hide on initial load
// bodyZones.style.display = "none";
// zoneInfo.style.display = "none";

async function loadData() {
  const res = await fetch(`patient.json?nocache=${Date.now()}`);
  caseData = await res.json();
  populateDropdown(caseData);
}

function populateDropdown(data) {
  const dropdown = document.getElementById("caseDropdown");

  data.forEach(d => {
    const option = document.createElement("option");
    option.value = d.caseid;
    option.textContent = `Case ${d.caseid}`;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", () => {
    const selectedId = parseInt(dropdown.value);
    selectedCase = caseData.find(d => d.caseid === selectedId);
    renderSurgeryInfo(selectedId);
    // updateZoneInfo(); 

  const orImage = document.getElementById("or-image");
  if (orImage && selectedCase) {
    const sex = selectedCase.sex?.toLowerCase();
    if (sex === "f" || sex === "female") {
      orImage.src = "images/table-female.png";
    } else if (sex === "m" || sex === "male") {
      orImage.src = "images/table-male.png";
    } else {
      orImage.src = "images/table-male.png"; // fallback image
    }
  }


  const gif = document.getElementById("postOpGif");
  if (gif && selectedCase) {
    const isDead = selectedCase.death_inhosp === 1;
    const sex = selectedCase.sex?.toLowerCase();

    if (isDead) {
      gif.src = "images/death.gif";
    } else if (sex === "m" || sex === "male") {
      gif.src = "images/recovered-men-new.gif";
    } else if (sex === "f" || sex === "female") {
      gif.src = "images/recovered-female-new.gif";
    } else {
      gif.src = "images/recovered-men-new.gif"; // fallback
    }
  }
  });
}

function renderSurgeryInfo(caseid) {
    const surgery = caseData.find(d => Number(d.caseid) === Number(caseid));
    const container = document.getElementById("surgeryInfo");
  
    if (!surgery) {
      container.innerHTML = "<p>No surgery data available.</p>";
      return;
    }

    container.innerHTML = `
        <h2>PATIENT CARD</h2>

        <div class="surgery-section">
            <div class="surgery-section-title">Case Summary</div>
            <p><strong>Case ID:</strong> ${surgery.caseid}</p>
            <p><strong>Department:</strong> ${surgery.department}</p>
        </div>

        <div class="surgery-section">
            <div class="surgery-section-title">Surgery Details</div>
            <p><strong>Operation Name:</strong> ${surgery.opname}</p>
            <p><strong>Operation Type:</strong> ${surgery.optype}</p>
            <p><strong>Approach:</strong> ${surgery.approach}</p>
            <p><strong>Patient Position:</strong> ${surgery.position}</p>
        </div>

        <div class="surgery-section">
            <div class="surgery-section-title">Medical Context</div>
            <p><strong>Emergency:</strong> ${surgery.emop || 'N/A'}</p>
            <p><strong>Diagnosis:</strong> ${surgery.dx}</p>
            <p><strong>ASA:</strong> ${surgery.asa}</p>
        </div>
        `;

}

orImage.addEventListener("mousemove", (e) => {
  if (selectedCase) {
    tooltip.style.left = `${e.offsetX + 20}px`;
    tooltip.style.top = `${e.offsetY + 20}px`;
  }
});

orImage.addEventListener("mouseenter", () => {
  if (selectedCase) {
    tooltip.innerHTML = `
      <strong>Case ${selectedCase.caseid}</strong><br>
      Age: ${selectedCase.age}<br>
      Sex: ${selectedCase.sex}<br>
      BMI: ${selectedCase.bmi}<br>
      Height ${selectedCase.height}
    `;
    tooltip.style.display = "block";
  }
});

orImage.addEventListener("mouseleave", () => {
  tooltip.style.display = "none";
});

const zoneInfoMap = {
  brain: (data) => `
    <h3>🧠 Brain / Airway</h3>
    <p><strong>Airway:</strong> ${data.airway || "N/A"}</p>
    <p><strong>Cormack Grade:</strong> ${data.cormack || "N/A"}</p>
    <p><strong>Midazolam:</strong> ${data.intraop_mdz || "0"} mg</p>
  `,
  heart: (data) => `
    <h3>❤️ Heart</h3>
    <p><strong>Hypertension:</strong> ${data.preop_htn ? "Yes" : "No"}</p>
    <p><strong>ECG:</strong> ${data.preop_ecg || "N/A"}</p>
    <p><strong>Hemoglobin:</strong> ${data.preop_hb || "N/A"} g/dL</p>
    <p><strong>Platelets:</strong> ${data.preop_plt || "N/A"} ×1000/mcL</p>
  `,
  lungs: (data) => `
    <h3>🫁 Lungs</h3>
    <p><strong>SpO2:</strong> ${data.preop_sao2 || "N/A"}%</p>
    <p><strong>PaO2:</strong> ${data.preop_pao2 || "N/A"} mmHg</p>
    <p><strong>Pulmonary Function:</strong> ${data.preop_pft || "N/A"}</p>
    <p><strong>Surgical Approach:</strong> ${data.approach || "N/A"}</p>
  `,
  abdomen: (data) => `
    <h3>🍽️ Abdomen / Metabolic</h3>
    <p><strong>Creatinine:</strong> ${data.preop_cr || "N/A"} mg/dL</p>
    <p><strong>BUN:</strong> ${data.preop_bun || "N/A"} mg/dL</p>
    <p><strong>Glucose:</strong> ${data.preop_gluc || "N/A"} mg/dL</p>
    <p><strong>Electrolytes:</strong> Na: ${data.preop_na || "?"} / K: ${data.preop_k || "?"}</p>
  `
};
   
document.querySelectorAll(".zone-btn").forEach(button => {
    button.addEventListener("click", () => {
      const zone = button.dataset.zone;
      activeZone = zone;
  
      document.querySelectorAll(".zone-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
  
      zoneInfo.style.display = "block";
  
      updateZoneInfo();
    });
  });
  
function updateZoneInfo() {
    const display = document.getElementById("zone-info");
  
    if (!selectedCase) {
      display.innerHTML = `<p style="color: red;">Please select a patient case first.</p>`;
    } else if (activeZone && zoneInfoMap[activeZone]) {
      display.innerHTML = zoneInfoMap[activeZone](selectedCase);
    } else {
      display.innerHTML = `<p>No data available for this zone.</p>`;
    }
  }

  const WINDOW_SIZE = 600;

  let playInterval = null;
  
  let playSpeed = 100;
  const NORMAL_SPEED = 10;
  
  const margin = { top: 40, right: 20, bottom: 40, left: 60 };
  
  const RIGHT_PADDING = 30;
  const totalWidth = 1000;
  const totalHeight = 400;
  const chartWidth = totalWidth - margin.left - margin.right;
  const chartHeight = totalHeight - margin.top - margin.bottom;
  const interChartHeight = totalHeight - margin.top - margin.bottom;

  
  const effectiveChartWidth = chartWidth - RIGHT_PADDING;
  
  const vitalColor = d3.scaleOrdinal(d3.schemeTableau10);
  const interColor = d3.scaleOrdinal(d3.schemeSet2);
  
  const liveValuesContainer = d3.select("#live-values");
  const caseSelect = d3.select("#case-select");
  const playBtn = d3.select("#play-btn");
  const pauseBtn = d3.select("#pause-btn");
  const slider = d3.select("#time-slider");
  
  let allVitalData = {};
  let allInterData = {};
  let currentCaseID = null;
  let currentVitals = [];
  let currentInters = [];
  let duration = 0;
  let currentTime = 0;
  
  let xScaleVitals, yScaleVitals, xAxisVitals, yAxisVitals, xGridVitals, yGridVitals;
  let xScaleInter, yScaleInter, xAxisInter, yAxisInter, xGridInter, yGridInter;
  
  const vitalSVG = d3
    .select("#vital-chart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const interSVG = d3
    .select("#intervention-chart")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", interChartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  function sanitizeParam(str) {
    return str.replace(/[^a-zA-Z0-9]/g, "_");
  }
  
  function formatHMS(d) {
    const hours = Math.floor(d / 3600);
    const mins = Math.floor((d % 3600) / 60);
    const secs = d % 60;
    const hh = hours < 10 ? "0" + hours : hours;
    const mm = mins < 10 ? "0" + mins : mins;
    const ss = secs < 10 ? "0" + secs : secs;
    return `${hh}:${mm}:${ss}`;
  }
  
  Promise.all([d3.json("vital_data.json"), d3.json("proxy_drug_data.json")])
    .then(([vitalDataJSON, interDataJSON]) => {
      allVitalData = vitalDataJSON;
      allInterData = interDataJSON;
  
      const caseIDs = Object.keys(allVitalData).sort((a, b) => +a - +b);

    const dropdowns = [d3.select("#case-select"), d3.select("#caseDropdown")];

    dropdowns.forEach((dropdown) => {
      dropdown
        .selectAll("option")
        .data(caseIDs)
        .enter()
        .append("option")
        .attr("value", (d) => d)
        .text((d) => "Case " + d);
    });

      currentCaseID = caseIDs[0];
      caseSelect.property("value", currentCaseID);

      caseSelect.on("change", () => {
        currentCaseID = caseSelect.property("value");
        d3.select("#caseDropdown").property("value", currentCaseID);
        resetAndDrawForCase(currentCaseID);
      });

      d3.select("#caseDropdown").on("change", function () {
        currentCaseID = this.value;
        caseSelect.property("value", currentCaseID);
        resetAndDrawForCase(currentCaseID);
      });
      
  
    })
    .catch((error) => {
      console.error("Error loading data:", error);
    });
  
  function resetAndDrawForCase(caseID) {
    stopAnimation();
    vitalSVG.selectAll("*").remove();
    interSVG.selectAll("*").remove();
    liveValuesContainer.selectAll("*").remove();
  
    currentVitals = Object.entries(allVitalData[caseID]).map(([param, arr]) => ({
      param: param,
      values: arr.map((d) => ({ time: +d.time, value: +d.value })),
    }));
  
    currentInters = Object.entries(allInterData[caseID]).map(([param, arr]) => ({
      param: param,
      values: arr.map((d) => ({ time: +d.time, value: +d.value })),
    }));
  
    duration = d3.max(currentVitals, (d) => d3.max(d.values, (v) => v.time));
    currentTime = 0;
  
    slider.attr("min", 0).attr("max", Math.max(0, duration - WINDOW_SIZE)).attr("step", 1).property("value", 0);
  
    slider.on("input", () => {
      currentTime = +slider.property("value");
      updateCharts(currentTime);
    });
  
    configureVitalScales();
    configureInterScales();
  
    drawLegendAndLiveValues();
    drawCharts();
    updateCharts(currentTime);
  }
  
  function configureVitalScales() {
    xScaleVitals = d3.scaleLinear().domain([0, WINDOW_SIZE]).range([0, effectiveChartWidth]);
  
    const allVals = currentVitals.flatMap((d) => d.values.map((v) => v.value));
    const yMin = d3.min(allVals) * 0.9;
    const yMax = d3.max(allVals) * 1.1;
  
    yScaleVitals = d3.scaleLinear().domain([yMin, yMax]).range([chartHeight, 0]);
  
    xAxisVitals = d3.axisBottom(xScaleVitals).ticks(6).tickFormat(formatHMS);
  
    yAxisVitals = d3.axisLeft(yScaleVitals).ticks(6);
  
    xGridVitals = d3.axisBottom(xScaleVitals).tickSize(-chartHeight).tickFormat("").ticks(6);
  
    yGridVitals = d3.axisLeft(yScaleVitals).tickSize(-effectiveChartWidth).tickFormat("").ticks(6);
  }
  
  function configureInterScales() {
    xScaleInter = d3.scaleLinear().domain([0, WINDOW_SIZE]).range([0, effectiveChartWidth]);
  
    const allVals = currentInters.flatMap((d) => d.values.map((v) => v.value));
    const yMax = d3.max(allVals) * 1.1;
  
    yScaleInter = d3.scaleLinear().domain([0, yMax]).range([interChartHeight, 0]);
  
    xAxisInter = d3.axisBottom(xScaleInter).ticks(6).tickFormat(formatHMS);
  
    yAxisInter = d3.axisLeft(yScaleInter).ticks(6);
  
    xGridInter = d3.axisBottom(xScaleInter).tickSize(-interChartHeight).tickFormat("").ticks(6);
  
    yGridInter = d3.axisLeft(yScaleInter).tickSize(-effectiveChartWidth).tickFormat("").ticks(6);
  }
  
  function drawLegendAndLiveValues() {
    const legendContainer = d3.select("#legend");
    legendContainer.selectAll("*").remove();
  
    legendContainer.append("div").html("<strong>Vitals:</strong>");
    const vitalLegend = legendContainer.append("ul").attr("class", "legend-list");
    currentVitals.forEach((d, i) => {
      const li = vitalLegend.append("li");
      li.append("span")
        .style("display", "inline-block")
        .style("width", "12px")
        .style("height", "12px")
        .style("background-color", vitalColor(i))
        .style("margin-right", "6px");
      li.append("span").text(d.param);
    });
  
    legendContainer.append("div").style("margin-top", "12px").html("<strong>Interventions:</strong>");
    const interLegend = legendContainer.append("ul").attr("class", "legend-list");
    currentInters.forEach((d, i) => {
      const li = interLegend.append("li");
      li.append("span")
        .style("display", "inline-block")
        .style("width", "12px")
        .style("height", "12px")
        .style("background-color", interColor(i))
        .style("margin-right", "6px");
      li.append("span").text(d.param);
    });
  
    liveValuesContainer
      .append("div")
      .attr("id", "live-time-display")
      .style("margin-bottom", "8px")
      .html("<strong>Current Time: --:--:--</strong>");
  
    const liveVitals = liveValuesContainer.append("div").attr("class", "live-section").html("<strong>Live Values (Vitals):</strong>");
    currentVitals.forEach((d) => {
      liveVitals.append("div").attr("id", `live-${sanitizeParam(d.param)}`).text(`${d.param}: –`);
    });
  
    const liveInters = liveValuesContainer.append("div").attr("class", "live-section").style("margin-top", "12px").html("<strong>Live Values (Interventions):</strong>");
    currentInters.forEach((d) => {
      liveInters.append("div").attr("id", `live-inter-${sanitizeParam(d.param)}`).text(`${d.param}: –`);
    });
  }
  
  function drawCharts() {
    vitalSVG.append("g").attr("class", "x grid").attr("transform", `translate(0, ${chartHeight})`).call(xGridVitals);
  
    vitalSVG.append("g").attr("class", "y grid").call(yGridVitals);
  
    vitalSVG.append("g").attr("class", "x axis").attr("transform", `translate(0, ${chartHeight})`).call(xAxisVitals);
  
    vitalSVG.append("g").attr("class", "y axis").call(yAxisVitals);
  
    vitalSVG
      .append("line")
      .attr("id", "vital-time-indicator")
      .attr("x1", effectiveChartWidth)
      .attr("x2", effectiveChartWidth)
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    vitalSVG
      .append("text")
      .attr("class", "chart-title")
      .attr("x", effectiveChartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Vitals");
  
    currentVitals.forEach((d, i) => {
      vitalSVG
        .append("path")
        .datum(d.values)
        .attr("class", "vital-line")
        .attr("id", `vital-path-${sanitizeParam(d.param)}`)
        .attr("fill", "none")
        .attr("stroke", vitalColor(i))
        .attr("stroke-width", 2);
    });
  
    vitalSVG
      .append("rect")
      .attr("class", "ekg-border")
      .attr("x", -margin.left + 5)
      .attr("y", -margin.top + 5)
      .attr("width", chartWidth + margin.left + margin.right - 10)
      .attr("height", chartHeight + margin.top + margin.bottom - 10)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  
    interSVG.append("g").attr("class", "x grid").attr("transform", `translate(0, ${interChartHeight})`).call(xGridInter);
  
    interSVG.append("g").attr("class", "y grid").call(yGridInter);
  
    interSVG.append("g").attr("class", "x axis").attr("transform", `translate(0, ${interChartHeight})`).call(xAxisInter);
  
    interSVG.append("g").attr("class", "y axis").call(yAxisInter);
  
    interSVG
      .append("line")
      .attr("id", "inter-time-indicator")
      .attr("x1", effectiveChartWidth)
      .attr("x2", effectiveChartWidth)
      .attr("y1", 0)
      .attr("y2", interChartHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    interSVG
      .append("text")
      .attr("class", "chart-title")
      .attr("x", effectiveChartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Interventions");
  
    currentInters.forEach((d, i) => {
      interSVG
        .append("path")
        .datum(d.values)
        .attr("class", "inter-line")
        .attr("id", `inter-path-${sanitizeParam(d.param)}`)
        .attr("fill", "none")
        .attr("stroke", interColor(i))
        .attr("stroke-width", 2);
    });
  
    interSVG
      .append("rect")
      .attr("class", "ekg-border")
      .attr("x", -margin.left + 5)
      .attr("y", -margin.top + 5)
      .attr("width", chartWidth + margin.left + margin.right - 10)
      .attr("height", interChartHeight + margin.top + margin.bottom - 10)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  }
  
  function updateCharts(startTime) {
    const windowStart = startTime;
    const windowEnd = startTime + WINDOW_SIZE;
  
    xScaleVitals.domain([windowStart, windowEnd]);
    xScaleInter.domain([windowStart, windowEnd]);
  
    vitalSVG.select(".x.axis").call(xAxisVitals);
    vitalSVG.select(".y.axis").call(yAxisVitals);
    vitalSVG.select(".x.grid").call(xGridVitals);
    vitalSVG.select(".y.grid").call(yGridVitals);
  
    interSVG.select(".x.axis").call(xAxisInter);
    interSVG.select(".y.axis").call(yAxisInter);
    interSVG.select(".x.grid").call(xGridInter);
    interSVG.select(".y.grid").call(yGridInter);
  
    vitalSVG
      .select("#vital-time-indicator")
      .attr("x1", xScaleVitals(windowStart))
      .attr("x2", xScaleVitals(windowStart));
  
    interSVG
      .select("#inter-time-indicator")
      .attr("x1", xScaleInter(windowStart))
      .attr("x2", xScaleInter(windowStart));
  
    currentVitals.forEach((d) => {
      const filtered = d.values.filter((v) => v.time >= windowStart && v.time <= windowEnd);
      const lineGen = d3
        .line()
        .x((v) => xScaleVitals(v.time))
        .y((v) => yScaleVitals(v.value))
        .curve(d3.curveMonotoneX);
  
      vitalSVG.select(`#vital-path-${sanitizeParam(d.param)}`).datum(filtered).attr("d", lineGen);
    });
  
    currentInters.forEach((d) => {
      const filtered = d.values.filter((v) => v.time >= windowStart && v.time <= windowEnd);
      const lineGen = d3
        .line()
        .x((v) => xScaleInter(v.time))
        .y((v) => yScaleInter(v.value))
        .curve(d3.curveStepAfter);
  
      interSVG.select(`#inter-path-${sanitizeParam(d.param)}`).datum(filtered).attr("d", lineGen);
    });
  
    currentVitals.forEach((d) => {
      const upToWindow = d.values.filter((v) => v.time <= windowEnd);
      const lastPoint = upToWindow.length ? upToWindow[upToWindow.length - 1] : null;
      const text = lastPoint ? lastPoint.value.toFixed(1) : "–";
      d3.select(`#live-${sanitizeParam(d.param)}`).text(`${d.param}: ${text}`);
    });
  
    currentInters.forEach((d) => {
      const upToWindow = d.values.filter((v) => v.time <= windowEnd);
      const lastPoint = upToWindow.length ? upToWindow[upToWindow.length - 1] : null;
      const text = lastPoint ? lastPoint.value : "–";
      d3.select(`#live-inter-${sanitizeParam(d.param)}`).text(`${d.param}: ${text}`);
    });
  
    const timeStr = formatHMS(windowStart);
    d3.select("#live-time-display").html(`<strong>Current Time: ${timeStr}</strong>`);
  
    slider.property("value", windowStart);
  }
  
  playBtn.on("click", () => {
    if (playInterval) return;
  
    playBtn.property("disabled", true);
    pauseBtn.property("disabled", false);
  
    playInterval = setInterval(() => {
      currentTime += playSpeed;
      if (currentTime > duration - WINDOW_SIZE) {
        currentTime = duration - WINDOW_SIZE;
        stopAnimation();
      }
      updateCharts(currentTime);
    }, 1000);
  });
  
  pauseBtn.on("click", () => {
    stopAnimation();
  });
  
  function stopAnimation() {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
      playBtn.property("disabled", false);
      pauseBtn.property("disabled", true);
    }
  }
  
document.addEventListener("DOMContentLoaded", () => {
  const gif = document.getElementById("postOpGif");
  const summaryBox = document.getElementById("dischargeSummary");

  if (gif && summaryBox) {
    gif.addEventListener("click", () => {
      if (!selectedCase) {
        summaryBox.classList.remove("hidden");
        summaryBox.classList.add("visible");
        summaryBox.textContent = "Please select a case first.";
        return;
      }

      summaryBox.classList.remove("hidden");
      summaryBox.classList.add("visible");
      summaryBox.innerHTML = "";

      const admDays = (selectedCase.adm / (60 * 60 * 24)).toFixed(1);
      const disDays = (selectedCase.dis / (60 * 60 * 24)).toFixed(1);

      const outcomeText = selectedCase.death_inhosp
        ? "❌ Patient did not survive the hospital stay."
        : "✅ Patient discharged in stable condition.";

        const dischargeText = `
        <h3 class="summary-title">📋 Discharge Summary</h3>
        <div class="summary-row"><strong>🕐 Admission:</strong> ${admDays} days from surgery start</div>
        <div class="summary-row"><strong>📤 Discharge:</strong> ${disDays} days from surgery start</div>
        <div class="summary-row"><strong>🏥 Post-op Stay:</strong> ${selectedCase.los_postop ?? "N/A"} days</div>
        <div class="summary-row"><strong>🛌 ICU Stay:</strong> ${selectedCase.icu_days ?? "N/A"} days</div>
      `;

    const outcomeDiv = document.getElementById("outcome-text");
    outcomeDiv.textContent = outcomeText;

      summaryBox.innerHTML = dischargeText;

    });
  }
});

// Initialize
loadData();


