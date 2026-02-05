// script.js
(function () {
  const root = document.documentElement;

  // Theme toggle
  const themeBtn = document.getElementById("toggleTheme");
  const savedTheme = localStorage.getItem("vn_theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme");
    const next = cur === "light" ? "" : "light";
    if (next) root.setAttribute("data-theme", next);
    else root.removeAttribute("data-theme");
    localStorage.setItem("vn_theme", next || "");
  });

  // Architecture diagram explanations
  const archExplain = document.getElementById("archExplain");
  const nodes = document.querySelectorAll(".node");
  const nodeText = {
    cpu: "CPU: contains the ALU (does calculations) and Control Unit (controls timing, decoding, signals).",
    mem: "Memory: stores BOTH instructions and data, each location has an address and binary contents.",
    io: "Input/Output: input converts human actions to computer signals, output converts results to humans."
  };

  nodes.forEach(btn => {
    btn.addEventListener("click", () => {
      nodes.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.dataset.node;
      archExplain.textContent = nodeText[key] || "Select a part above.";
    });
  });

  // Register explanations
  const regExplain = document.getElementById("regExplain");
  const regs = document.querySelectorAll(".reg");
  const regText = {
    PC: "PC (Program Counter): holds the address of the next instruction.",
    MAR: "MAR: holds the address in memory that the CPU wants to access.",
    MDR: "MDR: holds the data being transferred to or from memory.",
    CIR: "CIR: holds the current instruction being executed.",
    ACC: "ACC (Accumulator): stores results of arithmetic/logic operations."
  };

  regs.forEach(btn => {
    btn.addEventListener("click", () => {
      regs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      regExplain.textContent = regText[btn.dataset.reg] || "Pick a register.";
    });
  });

  // Memory read/write demos
  const readOut = document.getElementById("readOut");
  const writeOut = document.getElementById("writeOut");
  const demoRead = document.getElementById("demoRead");
  const demoWrite = document.getElementById("demoWrite");

  demoRead.addEventListener("click", () => {
    const addr = "11010000";
    const data = "10010001";
    readOut.textContent =
      "READ demo\n" +
      "1) MAR ← " + addr + "\n" +
      "2) Control bus: READ signal sent\n" +
      "3) Memory[" + addr + "] → MDR\n" +
      "4) MDR ← " + data + "\n" +
      "CPU uses MDR contents";
  });

  demoWrite.addEventListener("click", () => {
    const addr = "11101110";
    const data = "10111011";
    writeOut.textContent =
      "WRITE demo\n" +
      "1) MDR ← " + data + "\n" +
      "2) MAR ← " + addr + "\n" +
      "3) Control bus: WRITE signal sent\n" +
      "4) Memory[" + addr + "] ← MDR\n" +
      "Memory location updated";
  });

  // Fetch-decode-execute simulator
  let simStep = 0;
  let pc = 2000;
  let mar = "----";
  let mdr = "----";
  let cir = "----";
  let acc = 0;
  const mem = {
    2000: { bytes: "A1 22", asm: "MOV AX, 22h" },
    2002: { bytes: "33 15", asm: "SUB AX, 15h" },
    2004: { bytes: "F4", asm: "HLT" }
  };

  const pcVal = document.getElementById("pcVal");
  const marVal = document.getElementById("marVal");
  const mdrVal = document.getElementById("mdrVal");
  const cirVal = document.getElementById("cirVal");
  const accVal = document.getElementById("accVal");
  const simExplain = document.getElementById("simExplain");

  const pFetch = document.getElementById("pFetch");
  const pDecode = document.getElementById("pDecode");
  const pExecute = document.getElementById("pExecute");

  function setPill(active) {
    [pFetch, pDecode, pExecute].forEach(p => p.classList.remove("active"));
    if (active === "fetch") pFetch.classList.add("active");
    if (active === "decode") pDecode.classList.add("active");
    if (active === "execute") pExecute.classList.add("active");
  }

  function renderRegs() {
    pcVal.textContent = String(pc);
    marVal.textContent = String(mar);
    mdrVal.textContent = String(mdr);
    cirVal.textContent = String(cir);
    accVal.textContent = String(acc);
  }

  function resetSim() {
    simStep = 0;
    pc = 2000;
    mar = "----";
    mdr = "----";
    cir = "----";
    acc = 0;
    setPill(null);
    simExplain.textContent = 'Press "Next Step" to begin.';
    renderRegs();
  }

  const stepBtn = document.getElementById("stepBtn");
  const resetBtn = document.getElementById("resetBtn");

  stepBtn.addEventListener("click", () => {
    // Steps: 0 fetch1, 1 fetch2, 2 fetch3, 3 decode, 4 execute, then loop next instruction
    const instr = mem[pc];

    if (!instr) {
      simExplain.textContent = "No instruction at PC. Simulation stops.";
      return;
    }

    if (simStep === 0) {
      setPill("fetch");
      mar = pc;
      simExplain.textContent = "FETCH: PC → MAR (CPU puts next instruction address into MAR).";
      simStep++;
      renderRegs();
      return;
    }

    if (simStep === 1) {
      setPill("fetch");
      mdr = instr.bytes;
      simExplain.textContent = "FETCH: Memory → MDR (instruction bytes are fetched into MDR).";
      simStep++;
      renderRegs();
      return;
    }

    if (simStep === 2) {
      setPill("fetch");
      cir = mdr;
      pc = pc + 2; // using 2-byte steps for this sample (2000, 2002, 2004)
      simExplain.textContent = "FETCH: MDR → CIR, then PC increments to the next instruction address.";
      simStep++;
      renderRegs();
      return;
    }

    if (simStep === 3) {
      setPill("decode");
      simExplain.textContent = "DECODE: Control Unit interprets what the instruction in CIR means.";
      simStep++;
      renderRegs();
      return;
    }

    if (simStep === 4) {
      setPill("execute");
      // Execute based on CIR content for demo
      if (cir.startsWith("A1")) {
        acc = 0x22;
        simExplain.textContent = "EXECUTE: MOV loads 22h into ACC (demo result).";
      } else if (cir.startsWith("33")) {
        acc = (acc - 0x15);
        simExplain.textContent = "EXECUTE: SUB subtracts 15h from ACC (demo result).";
      } else if (cir.startsWith("F4")) {
        simExplain.textContent = "EXECUTE: HLT stops the program.";
        renderRegs();
        return;
      } else {
        simExplain.textContent = "EXECUTE: instruction executed (demo).";
      }

      simStep = 0;
      mar = "----";
      mdr = "----";
      // cir stays to show what was last executed
      renderRegs();
      return;
    }
  });

  resetBtn.addEventListener("click", resetSim);
  resetSim();

  // Quiz logic + drag reorder
  const quizForm = document.getElementById("quizForm");
  const quizResult = document.getElementById("quizResult");
  const quizReset = document.getElementById("quizReset");

  function getOrder() {
    const items = [...document.querySelectorAll("#dragArea .chip")].map(el => el.textContent.trim());
    return items;
  }

  function scoreOrder(order) {
    const correct = ["PC → MAR", "Memory → MDR", "MDR → CIR", "PC increments"];
    let points = 0;
    for (let i = 0; i < correct.length; i++) {
      if (order[i] === correct[i]) points++;
    }
    return points;
  }

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    const q1 = quizForm.querySelector('input[name="q1"]:checked')?.value;
    const q2 = quizForm.querySelector('input[name="q2"]:checked')?.value;

    if (q1 === "b") score++;
    if (q2 === "b") score++;

    const order = getOrder();
    score += scoreOrder(order); // out of 4

    const total = 6;
    quizResult.textContent = `Score: ${score}/${total}. ` +
      (score === total ? "Perfect." : "Fix the ones you missed and try again.");
  });

  quizReset.addEventListener("click", () => {
    quizForm.reset();
    quizResult.textContent = "Score will show here.";
    // reset drag items to original order
    const area = document.getElementById("dragArea");
    const items = [...area.querySelectorAll(".chip")];
    const original = ["PC → MAR", "Memory → MDR", "MDR → CIR", "PC increments"];
    items.sort((a, b) => original.indexOf(a.textContent.trim()) - original.indexOf(b.textContent.trim()));
    items.forEach(i => area.appendChild(i));
  });

  // Simple drag and drop reorder
  const dragArea = document.getElementById("dragArea");
  let dragged = null;

  dragArea.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!target.classList.contains("drag")) return;
    dragged = target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", target.textContent);
  });

  dragArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    const target = e.target;
    if (!dragged) return;
    if (target.classList.contains("drag") && target !== dragged) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) > (rect.height / 2);
      dragArea.insertBefore(dragged, next ? target.nextSibling : target);
    }
  });

  dragArea.addEventListener("dragend", () => {
    dragged = null;
  });
})();
