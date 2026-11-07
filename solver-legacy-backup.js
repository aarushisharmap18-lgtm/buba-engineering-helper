// ============================================================
// CIRCUITMIND — COMPLETE CALCULATION ENGINE
// GR24 ECE EDITION
// ============================================================


// ============================================================
// 1. HTML ELEMENT REFERENCES
// ============================================================

const $ = id => document.getElementById(id);

const solverMode = $("solverMode");
const solverForm = $("solverForm");
const inputFields = $("inputFields");
const solverTitle = $("solverTitle");
const solverDescription = $("solverDescription");
const inputHint = $("inputHint");

const results = $("results");
const solutionContent = $("solutionContent");
const errorMessage = $("errorMessage");

const askForm = $("askForm");
const customQuestion = $("customQuestion");
const askStatus = $("askStatus");


// ============================================================
// 2. GENERAL HELPER FUNCTIONS
// ============================================================

function fmt(value, decimals = 2) {
  if (!Number.isFinite(Number(value))) {
    return String(value);
  }

  return Number(value).toFixed(decimals);
}


function card(title, content) {
  return `
    <div class="solution-card">
      <h3>${title}</h3>
      <div>${content}</div>
    </div>
  `;
}


function step(title, explanation) {
  return `
    <div class="step">
      <h4>${title}</h4>
      <div>${explanation}</div>
    </div>
  `;
}


function formula(expression) {
  return `
    <div class="formula">
      ${expression}
    </div>
  `;
}


function answer(label, value, unit = "") {
  return `
    <div class="answer-row">
      <strong>${label}</strong>
      <span class="answer">${fmt(value)} ${unit}</span>
    </div>
  `;
}


function renderSolution(title, theory, working, finalAnswer, notes = "") {
  solutionContent.innerHTML =
    card("1. Understanding the concept", theory) +
    card("2. Step-by-step derivation and calculation", working) +
    card("3. Final answers", finalAnswer) +
    (notes ? card("4. Verification and notes", notes) : "");

  results.hidden = false;
  errorMessage.hidden = true;

  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;

  results.hidden = true;
}


function getNumber(id) {
  const element = $(id);

  if (!element || element.value.trim() === "") {
    return null;
  }

  const value = Number(element.value);

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}


function requirePositive(value, name) {
  if (value === null || value <= 0) {
    throw new Error(name + " must be a positive number.");
  }
}


// ============================================================
// 3. SOLVER MODULE DEFINITIONS
// ============================================================

const modules = {

  ohm: {
    title: "Ohm's Law",
    description: "Calculate voltage, current, resistance and power using Ohm's Law.",
    hint: "Enter any TWO known values. Leave the unknown value blank.",
    fields: [
      { id: "v", label: "Voltage", unit: "V" },
      { id: "i", label: "Current", unit: "A" },
      { id: "r", label: "Resistance", unit: "Ω" }
    ]
  },

  resistors: {
    title: "Series & Parallel Networks",
    description: "Calculate equivalent resistance in series and parallel resistor networks.",
    hint: "Enter two positive resistor values and select the connection.",
    fields: [
      { id: "r1", label: "Resistor 1", unit: "Ω" },
      { id: "r2", label: "Resistor 2", unit: "Ω" },
      {
        id: "connection",
        label: "Connection",
        type: "select",
        options: [
          { value: "series", label: "Series" },
          { value: "parallel", label: "Parallel" }
        ]
      }
    ]
  },

  divider: {
    title: "Voltage Divider",
    description: "Calculate the output voltage across a resistor in a series voltage divider.",
    hint: "Enter the input voltage and both resistor values.",
    fields: [
      { id: "vin", label: "Input voltage", unit: "V" },
      { id: "r1", label: "Resistor R1", unit: "Ω" },
      { id: "r2", label: "Resistor R2", unit: "Ω" }
    ]
  },

  rc: {
    title: "RC Transient Analysis",
    description: "Calculate the time constant and capacitor voltage during charging or discharging.",
    hint: "Enter R, C, supply voltage and time. Select charging or discharging.",
    fields: [
      { id: "r", label: "Resistance", unit: "Ω" },
      { id: "c", label: "Capacitance", unit: "F" },
      { id: "vin", label: "Supply voltage", unit: "V" },
      { id: "time", label: "Time", unit: "s" },
      {
        id: "rcMode",
        label: "Operation",
        type: "select",
        options: [
          { value: "charging", label: "Charging" },
          { value: "discharging", label: "Discharging" }
        ]
      }
    ]
  },

  ac: {
    title: "Series RLC AC Analysis",
    description: "Calculate reactance, impedance, current, phase angle and power factor.",
    hint: "Enter resistance, inductance, capacitance, frequency and supply voltage.",
    fields: [
      { id: "r", label: "Resistance", unit: "Ω" },
      { id: "l", label: "Inductance", unit: "H" },
      { id: "c", label: "Capacitance", unit: "F" },
      { id: "f", label: "Frequency", unit: "Hz" },
      { id: "v", label: "Supply voltage", unit: "V" }
    ]
  },

  kcl: {
    title: "Kirchhoff's Current Law",
    description: "Calculate an unknown current using the principle that total incoming current equals total outgoing current.",
    hint: "Enter the two incoming currents and one outgoing current. The second outgoing current will be calculated.",
    fields: [
      { id: "i1", label: "Incoming current 1", unit: "A" },
      { id: "i2", label: "Incoming current 2", unit: "A" },
      { id: "i3", label: "Outgoing current 1", unit: "A" }
    ]
  }

};


// ============================================================
// 4. DYNAMIC INPUT GENERATOR
// ============================================================

function renderInputs() {
  const selected = modules[solverMode.value];

  solverTitle.textContent = selected.title;
  solverDescription.textContent = selected.description;
  inputHint.textContent = selected.hint;

  inputFields.innerHTML = selected.fields.map(field => {

    if (field.type === "select") {
      return `
        <div class="input-group">
          <label for="${field.id}">${field.label}</label>
          <select id="${field.id}">
            ${field.options.map(option =>
              `<option value="${option.value}">${option.label}</option>`
            ).join("")}
          </select>
        </div>
      `;
    }

    return `
      <div class="input-group">
        <label for="${field.id}">${field.label} (${field.unit})</label>
        <input
          type="number"
          id="${field.id}"
          step="any"
          placeholder="Enter ${field.label.toLowerCase()}"
        >
      </div>
    `;

  }).join("");
}


// ============================================================
// 5. OHM'S LAW SOLVER
// ============================================================

function solveOhm() {
  const v = getNumber("v");
  const i = getNumber("i");
  const r = getNumber("r");

  const known = [v, i, r].filter(value => value !== null);

  if (known.length !== 2) {
    throw new Error("Enter exactly two known values: voltage, current or resistance.");
  }

  let voltage = v;
  let current = i;
  let resistance = r;

  let working = "";

  if (voltage !== null && current !== null) {
    requirePositive(voltage, "Voltage");
    requirePositive(current, "Current");

    resistance = voltage / current;

    working += step(
      "Step 1: Identify the known values",
      "Voltage = " + fmt(voltage) + " V and current = " + fmt(current) + " A."
    );

    working += step(
      "Step 2: Apply Ohm's Law",
      formula("V = IR") +
      "Rearrange to calculate resistance:" +
      formula("R = V/I")
    );

    working += step(
      "Step 3: Substitute the values",
      formula("R = " + fmt(voltage) + " / " + fmt(current)) +
      formula("R = " + fmt(resistance) + " Ω")
    );

  } else if (voltage !== null && resistance !== null) {
    requirePositive(voltage, "Voltage");
    requirePositive(resistance, "Resistance");

    current = voltage / resistance;

    working += step(
      "Step 1: Identify the known values",
      "Voltage = " + fmt(voltage) + " V and resistance = " + fmt(resistance) + " Ω."
    );

    working += step(
      "Step 2: Apply Ohm's Law",
      formula("V = IR") +
      "Rearrange to calculate current:" +
      formula("I = V/R")
    );

    working += step(
      "Step 3: Substitute the values",
      formula("I = " + fmt(voltage) + " / " + fmt(resistance)) +
      formula("I = " + fmt(current) + " A")
    );

  } else {
    requirePositive(current, "Current");
    requirePositive(resistance, "Resistance");

    voltage = current * resistance;

    working += step(
      "Step 1: Identify the known values",
      "Current = " + fmt(current) + " A and resistance = " + fmt(resistance) + " Ω."
    );

    working += step(
      "Step 2: Apply Ohm's Law",
      formula("V = IR")
    );

    working += step(
      "Step 3: Substitute the values",
      formula("V = " + fmt(current) + " × " + fmt(resistance)) +
      formula("V = " + fmt(voltage) + " V")
    );
  }

  const power = voltage * current;

  working += step(
    "Step 4: Calculate electrical power",
    "Electrical power is the product of voltage and current:" +
    formula("P = VI") +
    formula("P = " + fmt(voltage) + " × " + fmt(current)) +
    formula("P = " + fmt(power) + " W")
  );

  renderSolution(
    "Ohm's Law",
    "Ohm's Law states that the current flowing through a conductor is directly proportional to the potential difference across it, provided temperature and other physical conditions remain constant.",
    working,
    answer("Voltage", voltage, "V") +
    answer("Current", current, "A") +
    answer("Resistance", resistance, "Ω") +
    answer("Power", power, "W"),
    "The fundamental relationship is V = IR. Electrical power is P = VI."
  );
}


// ============================================================
// 6. SERIES AND PARALLEL RESISTOR SOLVER
// ============================================================

function solveResistors() {
  const r1 = getNumber("r1");
  const r2 = getNumber("r2");
  const connection = $("connection").value;

  requirePositive(r1, "Resistor 1");
  requirePositive(r2, "Resistor 2");

  let equivalent;
  let working;

  if (connection === "series") {
    equivalent = r1 + r2;

    working =
      step(
        "Step 1: Understand series connection",
        "In a series circuit, resistors are connected one after another. The same current flows through each resistor."
      ) +
      step(
        "Step 2: Apply the series resistance formula",
        formula("R<sub>eq</sub> = R₁ + R₂")
      ) +
      step(
        "Step 3: Substitute values",
        formula("R<sub>eq</sub> = " + fmt(r1) + " + " + fmt(r2)) +
        formula("R<sub>eq</sub> = " + fmt(equivalent) + " Ω")
      );

  } else {
    equivalent = (r1 * r2) / (r1 + r2);

    working =
      step(
        "Step 1: Understand parallel connection",
        "In a parallel circuit, both resistors share the same voltage. Current divides between the branches."
      ) +
      step(
        "Step 2: Apply the parallel resistance formula",
        formula("1/R<sub>eq</sub> = 1/R₁ + 1/R₂") +
        "For two resistors, this simplifies to:" +
        formula("R<sub>eq</sub> = (R₁R₂)/(R₁ + R₂)")
      ) +
      step(
        "Step 3: Substitute values",
        formula("R<sub>eq</sub> = (" + fmt(r1) + " × " + fmt(r2) + ") / (" + fmt(r1) + " + " + fmt(r2) + ")") +
        formula("R<sub>eq</sub> = " + fmt(equivalent) + " Ω")
      );
  }

  renderSolution(
    "Resistor Network",
    connection === "series"
      ? "In a series network, the equivalent resistance is the sum of all individual resistances."
      : "In a parallel network, the reciprocal of equivalent resistance is the sum of the reciprocals of the individual resistances.",
    working,
    answer("Equivalent resistance", equivalent, "Ω")
  );
}


// ============================================================
// 7. VOLTAGE DIVIDER SOLVER
// ============================================================

function solveDivider() {
  const vin = getNumber("vin");
  const r1 = getNumber("r1");
  const r2 = getNumber("r2");

  requirePositive(vin, "Input voltage");
  requirePositive(r1, "R1");
  requirePositive(r2, "R2");

  const totalResistance = r1 + r2;
  const current = vin / totalResistance;
  const vout = current * r2;
  const voltageR1 = current * r1;

  const working =
    step(
      "Step 1: Understand the voltage divider",
      "Two resistors are connected in series across an input voltage. The output voltage is measured across R2."
    ) +
    step(
      "Step 2: Calculate total resistance",
      formula("R<sub>T</sub> = R₁ + R₂") +
      formula("R<sub>T</sub> = " + fmt(r1) + " + " + fmt(r2)) +
      formula("R<sub>T</sub> = " + fmt(totalResistance) + " Ω")
    ) +
    step(
      "Step 3: Calculate circuit current",
      formula("I = V<sub>in</sub>/R<sub>T</sub>") +
      formula("I = " + fmt(vin) + " / " + fmt(totalResistance)) +
      formula("I = " + fmt(current) + " A")
    ) +
    step(
      "Step 4: Calculate output voltage across R2",
      formula("V<sub>out</sub> = IR₂") +
      formula("V<sub>out</sub> = " + fmt(current) + " × " + fmt(r2)) +
      formula("V<sub>out</sub> = " + fmt(vout) + " V")
    );

  renderSolution(
    "Voltage Divider",
    "A voltage divider is a series resistor circuit used to obtain a fraction of the input voltage. The output voltage depends on the ratio of the resistors.",
    working,
    answer("Output voltage", vout, "V") +
    answer("Circuit current", current, "A") +
    answer("Voltage across R1", voltageR1, "V"),
    "Voltage divider formula: Vout = Vin × R2/(R1 + R2). This assumes no additional load connected across the output."
  );
}


// ============================================================
// 8. RC TRANSIENT ANALYSIS
// ============================================================

function solveRC() {
  const r = getNumber("r");
  const c = getNumber("c");
  const vin = getNumber("vin");
  const time = getNumber("time");
  const operation = $("rcMode").value;

  requirePositive(r, "Resistance");
  requirePositive(c, "Capacitance");

  if (vin === null || vin < 0) {
    throw new Error("Enter a valid non-negative supply voltage.");
  }

  if (time === null || time < 0) {
    throw new Error("Enter a valid non-negative time.");
  }

  const tau = r * c;
  const exponent = Math.exp(-time / tau);

  let voltage;
  let working;

  if (operation === "charging") {
    voltage = vin * (1 - exponent);

    working =
      step(
        "Step 1: Understand capacitor charging",
        "When a capacitor charges through a resistor, its voltage gradually increases towards the supply voltage."
      ) +
      step(
        "Step 2: Calculate the time constant",
        formula("τ = RC") +
        formula("τ = " + fmt(r) + " × " + fmt(c)) +
        formula("τ = " + fmt(tau) + " seconds")
      ) +
      step(
        "Step 3: Apply the charging equation",
        formula("V<sub>C</sub>(t) = V(1 - e<sup>-t/RC</sup>)")
      ) +
      step(
        "Step 4: Substitute the values",
        formula("V<sub>C</sub> = " + fmt(vin) + "(1 - e<sup>-" + fmt(time) + "/" + fmt(tau) + "</sup>)") +
        formula("V<sub>C</sub> = " + fmt(voltage) + " V")
      );

  } else {
    voltage = vin * exponent;

    working =
      step(
        "Step 1: Understand capacitor discharging",
        "During discharging, the capacitor releases its stored energy through the resistor. Its voltage decreases exponentially."
      ) +
      step(
        "Step 2: Calculate the time constant",
        formula("τ = RC") +
        formula("τ = " + fmt(r) + " × " + fmt(c)) +
        formula("τ = " + fmt(tau) + " seconds")
      ) +
      step(
        "Step 3: Apply the discharging equation",
        formula("V<sub>C</sub>(t) = V₀e<sup>-t/RC</sup>")
      ) +
      step(
        "Step 4: Substitute the values",
        formula("V<sub>C</sub> = " + fmt(vin) + "e<sup>-" + fmt(time) + "/" + fmt(tau) + "</sup>") +
        formula("V<sub>C</sub> = " + fmt(voltage) + " V")
      );
  }

  renderSolution(
    "RC Transient Analysis",
    "An RC circuit consists of a resistor and capacitor. The time constant determines how quickly the capacitor charges or discharges. It is represented by τ = RC.",
    working,
    answer("Time constant", tau, "s") +
    answer("Capacitor voltage at the given time", voltage, "V"),
    "After one time constant, a charging capacitor reaches approximately 63.2% of its final voltage. A discharging capacitor retains approximately 36.8% of its initial voltage."
  );
}


// ============================================================
// 9. SERIES RLC AC ANALYSIS
// ============================================================

function solveAC() {
  const r = getNumber("r");
  const l = getNumber("l");
  const c = getNumber("c");
  const f = getNumber("f");
  const v = getNumber("v");

  requirePositive(r, "Resistance");
  requirePositive(l, "Inductance");
  requirePositive(c, "Capacitance");
  requirePositive(f, "Frequency");
  requirePositive(v, "Supply voltage");

  const omega = 2 * Math.PI * f;
  const xl = omega * l;
  const xc = 1 / (omega * c);

  const netReactance = xl - xc;
  const impedance = Math.sqrt(r * r + netReactance * netReactance);

  const current = v / impedance;
  const phase = Math.atan2(netReactance, r) * 180 / Math.PI;
  const powerFactor = r / impedance;
  const power = v * current * powerFactor;

  const working =
    step(
      "Step 1: Calculate angular frequency",
      formula("ω = 2πf") +
      formula("ω = 2π × " + fmt(f)) +
      formula("ω = " + fmt(omega) + " rad/s")
    ) +
    step(
      "Step 2: Calculate inductive reactance",
      formula("X<sub>L</sub> = 2πfL") +
      formula("X<sub>L</sub> = 2π × " + fmt(f) + " × " + fmt(l)) +
      formula("X<sub>L</sub> = " + fmt(xl) + " Ω")
    ) +
    step(
      "Step 3: Calculate capacitive reactance",
      formula("X<sub>C</sub> = 1/(2πfC)") +
      formula("X<sub>C</sub> = 1/(2π × " + fmt(f) + " × " + fmt(c) + ")") +
      formula("X<sub>C</sub> = " + fmt(xc) + " Ω")
    ) +
    step(
      "Step 4: Calculate net reactance",
      formula("X = X<sub>L</sub> - X<sub>C</sub>") +
      formula("X = " + fmt(xl) + " - " + fmt(xc)) +
      formula("X = " + fmt(netReactance) + " Ω")
    ) +
    step(
      "Step 5: Calculate impedance",
      formula("Z = √(R² + (X<sub>L</sub> - X<sub>C</sub>)²)") +
      formula("Z = √(" + fmt(r) + "² + " + fmt(netReactance) + "²)") +
      formula("Z = " + fmt(impedance) + " Ω")
    ) +
    step(
      "Step 6: Calculate circuit current",
      formula("I = V/Z") +
      formula("I = " + fmt(v) + "/" + fmt(impedance)) +
      formula("I = " + fmt(current) + " A")
    ) +
    step(
      "Step 7: Calculate phase angle and power factor",
      formula("φ = tan⁻¹((X<sub>L</sub> - X<sub>C</sub>)/R)") +
      formula("φ = " + fmt(phase) + "°") +
      formula("Power factor = R/Z = " + fmt(powerFactor))
    );

  renderSolution(
    "Series RLC AC Analysis",
    "A series RLC circuit contains resistance, inductance and capacitance connected in series. Its impedance depends on the difference between inductive and capacitive reactance.",
    working,
    answer("Inductive reactance", xl, "Ω") +
    answer("Capacitive reactance", xc, "Ω") +
    answer("Impedance", impedance, "Ω") +
    answer("Current", current, "A") +
    answer("Phase angle", phase, "°") +
    answer("Power factor", powerFactor, "") +
    answer("Real power", power, "W"),
    netReactance > 0
      ? "The circuit is inductive because XL is greater than XC. Current lags voltage."
      : netReactance < 0
        ? "The circuit is capacitive because XC is greater than XL. Current leads voltage."
        : "The circuit is at resonance because XL equals XC."
  );
}


// ============================================================
// 10. KIRCHHOFF'S CURRENT LAW
// ============================================================

function solveKCL() {
  const i1 = getNumber("i1");
  const i2 = getNumber("i2");
  const i3 = getNumber("i3");

  requirePositive(i1, "Incoming current 1");
  requirePositive(i2, "Incoming current 2");
  requirePositive(i3, "Outgoing current 1");

  const totalIncoming = i1 + i2;
  const unknownOutgoing = totalIncoming - i3;

  if (unknownOutgoing < 0) {
    throw new Error("The given outgoing current exceeds the total incoming current. Check your values and directions.");
  }

  const working =
    step(
      "Step 1: Understand Kirchhoff's Current Law",
      "Kirchhoff's Current Law states that the total current entering a junction is equal to the total current leaving the junction."
    ) +
    step(
      "Step 2: Write the KCL equation",
      formula("ΣI<sub>in</sub> = ΣI<sub>out</sub>") +
      formula("I₁ + I₂ = I₃ + I₄")
    ) +
    step(
      "Step 3: Substitute known currents",
      formula(fmt(i1) + " + " + fmt(i2) + " = " + fmt(i3) + " + I₄")
    ) +
    step(
      "Step 4: Calculate the unknown current",
      formula("I₄ = I₁ + I₂ - I₃") +
      formula("I₄ = " + fmt(i1) + " + " + fmt(i2) + " - " + fmt(i3)) +
      formula("I₄ = " + fmt(unknownOutgoing) + " A")
    );

  renderSolution(
    "Kirchhoff's Current Law",
    "KCL is based on conservation of electric charge. Charge cannot accumulate at an ideal circuit junction, so the total current entering must equal the total current leaving.",
    working,
    answer("Total incoming current", totalIncoming, "A") +
    answer("Unknown outgoing current", unknownOutgoing, "A")
  );
}


// ============================================================
// 11. MAIN SOLVER ROUTER
// ============================================================

function solveModule() {
  errorMessage.hidden = true;

  try {
    switch (solverMode.value) {
      case "ohm":
        solveOhm();
        break;

      case "resistors":
        solveResistors();
        break;

      case "divider":
        solveDivider();
        break;

      case "rc":
        solveRC();
        break;

      case "ac":
        solveAC();
        break;

      case "kcl":
        solveKCL();
        break;

      default:
        throw new Error("Please select a valid solver module.");
    }

  } catch (error) {
    showError(error.message);
  }
}


// ============================================================
// 12. NATURAL-LANGUAGE VALUE EXTRACTION
// ============================================================

function extractQuestionValue(question, label) {
  const patterns = {

    R: /(?:\bR\s*[:=]\s*|\bresistance\s+(?:of|is)\s+|\bresistor\s+(?:of|has)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    L: /(?:\bL\s*[:=]\s*|\binductance\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    C: /(?:\bC\s*[:=]\s*|\bcapacitance\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    V: /(?:\bV\s*[:=]\s*|\bvoltage\s+(?:of|is)\s+|\bsupply\s+voltage\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    I: /(?:\bI\s*[:=]\s*|\bcurrent\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    f: /(?:\bf\s*[:=]\s*|\bfrequency\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i,

    t: /(?:\bt\s*[:=]\s*|\btime\s+(?:of|is)\s+)([\d.]+)\s*([a-zA-ZµμΩ]*)/i

  };

  const pattern = patterns[label];

  if (!pattern) return null;

  const match = question.match(pattern);

  if (!match) return null;

  let value = Number(match[1]);

  const unit = match[2]
    .replace(/μ|µ/g, "u")
    .toLowerCase();

  const multipliers = {

    "": 1,

    "ohm": 1,
    "ohms": 1,
    "ω": 1,
    "k": 1000,
    "kohm": 1000,

    "h": 1,
    "mh": 0.001,
    "uh": 0.000001,

    "f": 1,
    "mf": 0.001,
    "uf": 0.000001,
    "nf": 0.000000001,
    "pf": 0.000000000001,

    "v": 1,
    "kv": 1000,

    "a": 1,
    "ma": 0.001,
    "ua": 0.000001,

    "hz": 1,
    "khz": 1000,
    "mhz": 1000000,

    "s": 1,
    "ms": 0.001,
    "us": 0.000001

  };

  if (multipliers[unit] === undefined) {
    throw new Error("Unrecognised unit: " + unit);
  }

  return value * multipliers[unit];
}


// ============================================================
// 13. SERIES RLC RESONANCE SOLVER
// ============================================================

function solveRLCResonance(r, l, c) {
  requirePositive(r, "Resistance");
  requirePositive(l, "Inductance");
  requirePositive(c, "Capacitance");

  const omega = 1 / Math.sqrt(l * c);
  const frequency = omega / (2 * Math.PI);

  const qualityFactor = omega * l / r;
  const bandwidth = r / (2 * Math.PI * l);

  const xl = omega * l;
  const xc = 1 / (omega * c);

  const working =

    step(
      "Step 1: Understand series resonance",
      "In a series RLC circuit, resonance occurs when inductive reactance equals capacitive reactance. The two reactances cancel, leaving the circuit impedance equal to its resistance."
    ) +

    step(
      "Step 2: Derive the resonant-frequency formula",
      "At resonance:" +
      formula("X<sub>L</sub> = X<sub>C</sub>") +
      "Substitute the reactance formulas:" +
      formula("2πfL = 1/(2πfC)") +
      "Multiply both sides by 2πfC:" +
      formula("(2πf)²LC = 1") +
      "Rearrange and take the square root:" +
      formula("f₀ = 1/(2π√LC)")
    ) +

    step(
      "Step 3: Calculate resonant frequency",
      formula("f₀ = 1/(2π√(" + fmt(l) + " × " + fmt(c, 6) + "))") +
      formula("f₀ = " + fmt(frequency) + " Hz") +
      "Angular resonant frequency:" +
      formula("ω₀ = 1/√LC = " + fmt(omega) + " rad/s")
    ) +

    step(
      "Step 4: Derive the quality-factor formula",
      "Quality factor is the ratio of inductive reactance at resonance to resistance:" +
      formula("Q = X<sub>L</sub>/R") +
      "Since XL = ω₀L:" +
      formula("Q = ω₀L/R") +
      "Using ω₀ = 1/√LC:" +
      formula("Q = (1/R)√(L/C)")
    ) +

    step(
      "Step 5: Calculate quality factor",
      formula("Q = (" + fmt(omega) + " × " + fmt(l) + ") / " + fmt(r)) +
      formula("Q = " + fmt(qualityFactor))
    ) +

    step(
      "Step 6: Derive the bandwidth formula",
      "Quality factor is also defined as the ratio of resonant frequency to bandwidth:" +
      formula("Q = f₀/BW") +
      "Rearranging:" +
      formula("BW = f₀/Q") +
      "Substitute the expressions for f₀ and Q:" +
      formula("BW = R/(2πL)")
    ) +

    step(
      "Step 7: Calculate bandwidth",
      formula("BW = " + fmt(r) + " / (2π × " + fmt(l) + ")") +
      formula("BW = " + fmt(bandwidth) + " Hz")
    ) +

    step(
      "Step 8: Verify the result",
      "At resonance, inductive reactance and capacitive reactance must be equal." +
      formula("X<sub>L</sub> = " + fmt(xl) + " Ω") +
      formula("X<sub>C</sub> = " + fmt(xc) + " Ω") +
      "The values agree, confirming the resonance condition."
    );

  renderSolution(
    "Series RLC Resonance",
    "A series RLC circuit contains a resistor, inductor and capacitor connected in one path. At resonance, XL = XC. The net reactance becomes zero, the impedance is minimum and equal to R, and current is maximum for a fixed supply voltage.",
    working,
    answer("Resonant frequency", frequency, "Hz") +
    answer("Quality factor", qualityFactor, "") +
    answer("Bandwidth", bandwidth, "Hz"),
    "Assumptions: ideal series RLC circuit, with R representing the total series resistance. Bandwidth is the half-power (3 dB) bandwidth."
  );
}


// ============================================================
// 14. ASK CIRCUITMIND QUESTION ROUTER
// ============================================================

function askCircuitMind(question) {
  const q = question.toLowerCase();

  // SERIES RLC RESONANCE

  if (
    q.includes("resonan") ||
    q.includes("quality factor") ||
    q.includes("bandwidth")
  ) {
    const r = extractQuestionValue(question, "R");
    const l = extractQuestionValue(question, "L");
    const c = extractQuestionValue(question, "C");

    if (r !== null && l !== null && c !== null) {
      solveRLCResonance(r, l, c);
      return "Your series RLC resonance problem has been solved.";
    }
  }


  // SERIES RLC AC ANALYSIS

  if (q.includes("rlc") || q.includes("impedance")) {
    const r = extractQuestionValue(question, "R");
    const l = extractQuestionValue(question, "L");
    const c = extractQuestionValue(question, "C");
    const f = extractQuestionValue(question, "f");
    const v = extractQuestionValue(question, "V");

    if (
      r !== null &&
      l !== null &&
      c !== null &&
      f !== null &&
      v !== null
    ) {
      solverMode.value = "ac";
      renderInputs();

      $("r").value = r;
      $("l").value = l;
      $("c").value = c;
      $("f").value = f;
      $("v").value = v;

      solveAC();

      return "Your series RLC AC problem has been solved.";
    }
  }


  // RC TRANSIENT ANALYSIS

  if (
    q.includes("rc circuit") ||
    q.includes("time constant") ||
    q.includes("capacitor charging") ||
    q.includes("capacitor discharging")
  ) {
    const r = extractQuestionValue(question, "R");
    const c = extractQuestionValue(question, "C");
    const v = extractQuestionValue(question, "V");
    const t = extractQuestionValue(question, "t");

    if (r !== null && c !== null && v !== null && t !== null) {
      solverMode.value = "rc";
      renderInputs();

      $("r").value = r;
      $("c").value = c;
      $("vin").value = v;
      $("time").value = t;

      $("rcMode").value = q.includes("discharg")
        ? "discharging"
        : "charging";

      solveRC();

      return "Your RC transient problem has been solved.";
    }
  }


  // OHM'S LAW

  if (
    q.includes("ohm") ||
    q.includes("voltage") ||
    q.includes("current") ||
    q.includes("resistance")
  ) {
    const v = extractQuestionValue(question, "V");
    const i = extractQuestionValue(question, "I");
    const r = extractQuestionValue(question, "R");

    const known = [v, i, r].filter(value => value !== null);

    if (known.length === 2) {
      solverMode.value = "ohm";
      renderInputs();

      if (v !== null) $("v").value = v;
      if (i !== null) $("i").value = i;
      if (r !== null) $("r").value = r;

      solveOhm();

      return "Your Ohm's Law problem has been solved.";
    }
  }


  throw new Error(
    "I couldn't recognise all the required values in your question. " +
    "Currently, Ask CircuitMind supports Ohm's Law, RC transient analysis, " +
    "series RLC AC analysis and series RLC resonance. " +
    "Please include the known values and their units clearly."
  );
}


// ============================================================
// 15. EVENT LISTENERS
// ============================================================

// Change solver module

solverMode.addEventListener("change", () => {
  renderInputs();
  errorMessage.hidden = true;
  results.hidden = true;
});


// Submit normal solver form

solverForm.addEventListener("submit", event => {
  event.preventDefault();
  solveModule();
});


// Submit Ask CircuitMind form

askForm.addEventListener("submit", event => {
  event.preventDefault();

  const question = customQuestion.value.trim();

  if (!question) {
    askStatus.textContent = "Please enter a question first.";
    return;
  }

  try {
    askStatus.textContent = "Analysing your question...";

    const message = askCircuitMind(question);

    askStatus.textContent = message;

    errorMessage.hidden = true;

  } catch (error) {
    askStatus.textContent = "Unable to solve this question.";

    showError(error.message);
  }
});


// Print solution

$("printButton").addEventListener("click", () => {
  window.print();
});


// ============================================================
// 16. INITIALISE CIRCUITMIND
// ============================================================

renderInputs();

console.log("CIRCUITMIND calculation engine loaded successfully.");