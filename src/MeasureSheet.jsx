import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#F7941D";
const NAVY = "#003B5C";
const GRAY_BG = "#f4f6f8";
const GRAY_BORDER = "#d1d5db";
const GREEN = "#059669";

const WINDOW_TYPES = [
  { code: "DH", name: "Double Hung", pcs: 1 },
  { code: "SH", name: "Single Hung", pcs: 1 },
  { code: "CAS-L", name: "Casement LH", pcs: 1 },
  { code: "CAS-R", name: "Casement RH", pcs: 1 },
  { code: "DCAS", name: "Double Casement", pcs: 2 },
  { code: "TCAS", name: "Triple Casement", pcs: 3 },
  { code: "AWN", name: "Awning", pcs: 1 },
  { code: "DSLD", name: "Double Slider", pcs: 2 },
  { code: "3SLD", name: "Three-Light Slider", pcs: 3 },
  { code: "PIC", name: "Picture / Fixed", pcs: 1 },
  { code: "SHAPE", name: "Shape / Specialty", pcs: 1 },
  { code: "BAY", name: "Bay Window", pcs: 3 },
  { code: "BOW", name: "Bow Window", pcs: 4 },
  { code: "HOP", name: "Hopper", pcs: 1 },
  { code: "GARDEN", name: "Garden Window", pcs: 1 },
];

const SHAPE_PRESETS = [
  { code: "HALF-RND", name: "Half Round", path: (w,h) => `M0,${h} A${w/2},${h} 0 0,1 ${w},${h} L0,${h} Z` },
  { code: "QTR-RND-L", name: "Quarter Rnd L", path: (w,h) => `M0,0 A${w},${h} 0 0,1 ${w},${h} L0,${h} Z` },
  { code: "QTR-RND-R", name: "Quarter Rnd R", path: (w,h) => `M${w},0 A${w},${h} 0 0,0 0,${h} L${w},${h} Z` },
  { code: "FULL-RND", name: "Full Round", path: (w,h) => { const r=Math.min(w,h)/2; return `M${w/2-r},${h/2} A${r},${r} 0 1,1 ${w/2+r},${h/2} A${r},${r} 0 1,1 ${w/2-r},${h/2} Z`; }},
  { code: "TRIANGLE", name: "Triangle", path: (w,h) => `M${w/2},0 L${w},${h} L0,${h} Z` },
  { code: "TRAPEZOID", name: "Trapezoid", path: (w,h) => `M${w*0.2},0 L${w*0.8},0 L${w},${h} L0,${h} Z` },
  { code: "ARCH-TOP", name: "Arch Top", path: (w,h) => `M0,${h} L0,${h*0.4} A${w/2},${h*0.4} 0 0,1 ${w},${h*0.4} L${w},${h} Z` },
  { code: "OCTAGON", name: "Octagon", path: (w,h) => { const s=Math.min(w,h), o=s*0.293; return `M${o},0 L${s-o},0 L${s},${o} L${s},${s-o} L${s-o},${s} L${o},${s} L0,${s-o} L0,${o} Z`; }},
  { code: "GOTHIC", name: "Gothic Arch", path: (w,h) => `M0,${h} L0,${h*0.35} Q0,0 ${w/2},0 Q${w},0 ${w},${h*0.35} L${w},${h} Z` },
  { code: "EYEBROW", name: "Eyebrow", path: (w,h) => `M0,${h} Q${w/2},0 ${w},${h} Z` },
  { code: "PENTAGON", name: "Pentagon", path: (w,h) => `M${w/2},0 L${w},${h*0.38} L${w*0.82},${h} L${w*0.18},${h} L0,${h*0.38} Z` },
  { code: "CUSTOM", name: "Custom Shape", path: (w,h) => `M${w*0.15},${h} L0,${h*0.5} L${w*0.25},0 L${w*0.75},0 L${w},${h*0.5} L${w*0.85},${h} Z` },
];

const BAY_BOW_PANEL_TYPES = ["DH", "SH", "CAS-L", "CAS-R", "PIC"];
const GLASS_OPTIONS = ["DP LoE2 Ar", "DP LoE Ar", "TP LoE Ar", "TP LoE2 Ar", "DP Clear", "DP LoE Air", "Laminated", "Custom"];
const GLASS_TEXTURES = ["Clear", "Obscure", "Rain", "Opaque", "Glue Chip", "Reed"];
const GRID_TYPES = ["None", "SDL", "GBG"];
const GRID_PATTERNS = ["Colonial", "Prairie", "Craftsman", "Cottage", "Diamond", "Custom"];
const GRID_LOCATIONS = ["Both", "Upper Sash", "Lower Sash"];
const INSTALL_TYPES = ["Replacement", "Full Frame", "Pocket"];
const WALL_THICK = ["2x4", "2x6"];
const TEMPERED_OPTIONS = ["No", "Full", "Top Sash", "Bottom Sash"];
const SCREEN_OPTIONS = ["Full", "Half", "No Screen"];
const METAL_OPTIONS = ["", "Roll - Textured", "Roll - Smooth"];
const METAL_COLORS = ["", "White", "Almond", "Bronze", "Black", "Clay", "Custom"];
const EXT_TRIM_SIZES = ["", "1x2", "1x3", "1x4", "1x6", "1x8"];
const EXT_TRIM_TEXTURES = ["", "Textured", "Smooth"];
const WIN_WRAP_SIZES = ["", "Small", "Medium", "Large"];
const DOOR_WRAP_SIZES = ["", "Single", "Double"];
const JAMB_STOCK = [8, 10, 12];
const CASING_STOCK = [8, 10, 12];
const EXT_TRIM_STOCK = [12, 14, 16];
const WASTE_FACTOR = 1.10; // 10% waste
const JAMB_SPECIES = ["", "Pine", "Oak", "Poplar", "MDF", "PVC"];
const FINISH_TYPES = ["", "Primed", "Painted", "Stained", "Unfinished"];
const STAIN_COLORS = ["", "Natural", "Golden Oak", "Provincial", "Early American", "Special Walnut", "Dark Walnut", "Jacobean", "Ebony", "Red Mahogany", "English Chestnut", "Honey", "Weathered Gray", "Classic Gray", "Briarsmoke", "Custom"];
const DOOR_TYPES = ["", "Sliding Door", "French Door", "Entry Door", "Service Door", "Storm Door"];
const DOOR_GLASS_CONFIGS = ["", "Full Lite", "3/4 Lite", "Half Lite", "Quarter Lite", "Solid"];
const DOOR_JAMB_THICKNESS = ["", "4-9/16\"", "6-9/16\"", "7-1/4\"", "Custom"];
const DOOR_SIDELITES = ["None", "Left", "Right", "Both"];
const DOOR_THRESHOLD = ["", "Standard", "ADA", "Flush", "Custom"];
const DOOR_SCREEN = ["", "Retractable", "Sliding", "Storm/Screen Combo", "None"];
const DOOR_STD_SIZES = [
  { w: "32", h: "80" }, { w: "34", h: "80" }, { w: "36", h: "80" },
  { w: "42", h: "80" }, { w: "60", h: "80" }, { w: "72", h: "80" },
  { w: "36", h: "82" }, { w: "60", h: "82" },
  { w: "60", h: "96" }, { w: "72", h: "96" },
];
const SUPPLIERS = [
  { code: "GENERIC", name: "Generic / Custom" },
  { code: "PELLA", name: "Pella" },
  { code: "ANDERSEN", name: "Andersen" },
  { code: "MARVIN", name: "Marvin" },
  { code: "MI", name: "MI Windows" },
  { code: "PROVIA", name: "ProVia (Doors)" },
];

function parseDim(s) {
  if (!s) return 0;
  s = String(s).trim();
  const f1 = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (f1) return parseFloat(f1[1]) + parseFloat(f1[2]) / parseFloat(f1[3]);
  const f2 = s.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (f2) return parseFloat(f2[1]) + parseFloat(f2[2]) / parseFloat(f2[3]);
  const f3 = s.match(/^(\d+)\/(\d+)$/);
  if (f3) return parseFloat(f3[1]) / parseFloat(f3[2]);
  return parseFloat(s) || 0;
}
function inToFt(i) { return i / 12; }

function calcMaterials(w) {
  const width = parseDim(w.netW || w.roughW);
  const height = parseDim(w.netH || w.roughH);
  if (!width || !height) return null;
  const qty = parseInt(w.qty) || 1;
  const best = (ft, arr) => arr.find(s => s >= ft) || arr[arr.length - 1];

  // JAMB: 2 legs (height+2") + 1 head (width+2")
  const jLegIn = height + 2, jHeadIn = width + 2;
  const jLegFt = inToFt(jLegIn), jHeadFt = inToFt(jHeadIn);
  const jRawLF = (jLegFt * 2 + jHeadFt) * qty;
  const jWithWaste = jRawLF * WASTE_FACTOR;
  // Can 2 legs fit on one stock piece?
  const twoLegs = jLegFt * 2;
  const canDblJ = JAMB_STOCK.some(s => s >= twoLegs);
  const jBuyList = [];
  if (canDblJ) {
    // 1 pc for 2 legs + 1 pc for head, per opening
    for (let i = 0; i < qty; i++) { jBuyList.push(best(twoLegs, JAMB_STOCK)); jBuyList.push(best(jHeadFt, JAMB_STOCK)); }
  } else {
    // 2 pcs for legs + 1 pc for head, per opening
    for (let i = 0; i < qty; i++) { jBuyList.push(best(jLegFt, JAMB_STOCK)); jBuyList.push(best(jLegFt, JAMB_STOCK)); jBuyList.push(best(jHeadFt, JAMB_STOCK)); }
  }
  const jPcs = jBuyList.length;
  const jBuySummary = [...new Set(jBuyList)].map(l => `${jBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  // CASING: 2 legs (height+3") + 1 head (width+6") + 1 apron (width+4")
  const cLegIn = height + 3, cHeadIn = width + 6, cApronIn = width + 4;
  const cLegFt = inToFt(cLegIn), cHeadFt = inToFt(cHeadIn), cApronFt = inToFt(cApronIn);
  const cRawLF = (cLegFt * 2 + cHeadFt + cApronFt) * qty;
  const cWithWaste = cRawLF * WASTE_FACTOR;
  // Can head+apron fit on one stock piece?
  const cHA = cHeadFt + cApronFt;
  const canDblC = CASING_STOCK.some(s => s >= cHA);
  const cBuyList = [];
  if (canDblC) {
    for (let i = 0; i < qty; i++) { cBuyList.push(best(cLegFt, CASING_STOCK)); cBuyList.push(best(cLegFt, CASING_STOCK)); cBuyList.push(best(cHA, CASING_STOCK)); }
  } else {
    for (let i = 0; i < qty; i++) { cBuyList.push(best(cLegFt, CASING_STOCK)); cBuyList.push(best(cLegFt, CASING_STOCK)); cBuyList.push(best(cHeadFt, CASING_STOCK)); cBuyList.push(best(cApronFt, CASING_STOCK)); }
  }
  const cPcs = cBuyList.length;
  const cBuySummary = [...new Set(cBuyList)].map(l => `${cBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  // EXT TRIM: 2 sides (height+2") + 1 top (width+2") + 1 bottom (width+2") -- 12/14/16' stock
  const eSideIn = height + 2, eTopIn = width + 2;
  const eSideFt = inToFt(eSideIn), eTopFt = inToFt(eTopIn);
  const eRawLF = (eSideFt * 2 + eTopFt * 2) * qty;
  const eWithWaste = eRawLF * WASTE_FACTOR;
  const eBuyList = [];
  for (let i = 0; i < qty; i++) {
    // Try to pair side+top on one piece
    const pair1 = eSideFt + eTopFt;
    const pair2 = eSideFt + eTopFt;
    if (EXT_TRIM_STOCK.some(s => s >= pair1)) {
      eBuyList.push(best(pair1, EXT_TRIM_STOCK));
      eBuyList.push(best(pair2, EXT_TRIM_STOCK));
    } else {
      eBuyList.push(best(eSideFt, EXT_TRIM_STOCK));
      eBuyList.push(best(eSideFt, EXT_TRIM_STOCK));
      eBuyList.push(best(eTopFt, EXT_TRIM_STOCK));
      eBuyList.push(best(eTopFt, EXT_TRIM_STOCK));
    }
  }
  const ePcs = eBuyList.length;
  const eBuySummary = [...new Set(eBuyList)].map(l => `${eBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  return {
    jambLF: jWithWaste.toFixed(1), jambRawLF: jRawLF.toFixed(1), jambPcs: jPcs, jambDetail: `Buy: ${jBuySummary} (${jRawLF.toFixed(1)} LF + 10% waste)`,
    casingLF: cWithWaste.toFixed(1), casingRawLF: cRawLF.toFixed(1), casingPcs: cPcs, casingDetail: `Buy: ${cBuySummary} (${cRawLF.toFixed(1)} LF + 10% waste)`,
    extLF: eWithWaste.toFixed(1), extRawLF: eRawLF.toFixed(1), extPcs: ePcs, extDetail: `Buy: ${eBuySummary} (${eRawLF.toFixed(1)} LF + 10% waste)`,
    width, height,
  };
}

function calcDoorMaterials(d) {
  const width = parseDim(d.netW || d.roughW);
  const height = parseDim(d.netH || d.roughH);
  if (!width || !height) return null;
  const qty = parseInt(d.qty) || 1;
  const best = (ft, arr) => arr.find(s => s >= ft) || arr[arr.length - 1];

  // JAMB: 2 legs (height+2") + 1 head (width+2")
  const jLegFt = inToFt(height + 2), jHeadFt = inToFt(width + 2);
  const jRawLF = (jLegFt * 2 + jHeadFt) * qty;
  const jWithWaste = jRawLF * WASTE_FACTOR;
  const twoLegs = jLegFt * 2;
  const canDblJ = JAMB_STOCK.some(s => s >= twoLegs);
  const jBuyList = [];
  for (let i = 0; i < qty; i++) {
    if (canDblJ) { jBuyList.push(best(twoLegs, JAMB_STOCK)); jBuyList.push(best(jHeadFt, JAMB_STOCK)); }
    else { jBuyList.push(best(jLegFt, JAMB_STOCK)); jBuyList.push(best(jLegFt, JAMB_STOCK)); jBuyList.push(best(jHeadFt, JAMB_STOCK)); }
  }
  const jPcs = jBuyList.length;
  const jBuySummary = [...new Set(jBuyList)].map(l => `${jBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  // CASING: BOTH sides -- 2 legs (height+3") + 1 head (width+6") per side = x2
  const cLegFt = inToFt(height + 3), cHeadFt = inToFt(width + 6);
  const cRawLF = (cLegFt * 2 + cHeadFt) * 2 * qty;
  const cWithWaste = cRawLF * WASTE_FACTOR;
  const cBuyList = [];
  for (let i = 0; i < qty; i++) {
    for (let side = 0; side < 2; side++) {
      cBuyList.push(best(cLegFt, CASING_STOCK));
      cBuyList.push(best(cLegFt, CASING_STOCK));
      cBuyList.push(best(cHeadFt, CASING_STOCK));
    }
  }
  const cPcs = cBuyList.length;
  const cBuySummary = [...new Set(cBuyList)].map(l => `${cBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  // EXT TRIM: 2 legs (height+2") + 1 head (width+2") -- no bottom on doors -- 12/14/16' stock
  const eSideFt = inToFt(height + 2), eTopFt = inToFt(width + 2);
  let eRawLF = (eSideFt * 2 + eTopFt) * qty;
  const eBuyList = [];
  for (let i = 0; i < qty; i++) {
    // Try to pair one side + head
    const pair = eSideFt + eTopFt;
    if (EXT_TRIM_STOCK.some(s => s >= pair)) {
      eBuyList.push(best(pair, EXT_TRIM_STOCK));
      eBuyList.push(best(eSideFt, EXT_TRIM_STOCK));
    } else {
      eBuyList.push(best(eSideFt, EXT_TRIM_STOCK));
      eBuyList.push(best(eSideFt, EXT_TRIM_STOCK));
      eBuyList.push(best(eTopFt, EXT_TRIM_STOCK));
    }
  }
  // Sidelite extra trim
  let slExtra = 0;
  if (d.sidelites === "Left" || d.sidelites === "Right") {
    const slW = parseDim(d.sideliteW) || 14;
    slExtra = (inToFt(height + 2) + inToFt(slW + 2)) * qty;
    for (let i = 0; i < qty; i++) eBuyList.push(best(inToFt(height + 2) + inToFt(slW + 2), EXT_TRIM_STOCK));
  } else if (d.sidelites === "Both") {
    const slW = parseDim(d.sideliteW) || 14;
    slExtra = (inToFt(height + 2) * 2 + inToFt(slW + 2) * 2) * qty;
    for (let i = 0; i < qty; i++) { eBuyList.push(best(inToFt(height + 2) + inToFt(slW + 2), EXT_TRIM_STOCK)); eBuyList.push(best(inToFt(height + 2) + inToFt(slW + 2), EXT_TRIM_STOCK)); }
  }
  eRawLF += slExtra;
  const eWithWaste = eRawLF * WASTE_FACTOR;
  const ePcs = eBuyList.length;
  const eBuySummary = [...new Set(eBuyList)].map(l => `${eBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  return {
    jambLF: jWithWaste.toFixed(1), jambRawLF: jRawLF.toFixed(1), jambPcs: jPcs, jambDetail: `Buy: ${jBuySummary} (${jRawLF.toFixed(1)} LF + 10% waste)`,
    casingLF: cWithWaste.toFixed(1), casingRawLF: cRawLF.toFixed(1), casingPcs: cPcs, casingDetail: `Buy: ${cBuySummary} (${cRawLF.toFixed(1)} LF + 10% waste)`,
    extLF: eWithWaste.toFixed(1), extRawLF: eRawLF.toFixed(1), extPcs: ePcs, extDetail: `Buy: ${eBuySummary} (${eRawLF.toFixed(1)} LF + 10% waste)`,
    sideliteExtra: slExtra > 0 ? `Incl. ${slExtra.toFixed(1)} LF sidelite trim` : "",
    width, height,
  };
}

function getPcs(t) { return WINDOW_TYPES.find(x => x.code === t)?.pcs || 1; }

const mkWin = () => ({ id: Date.now() + Math.random(), location: "", qty: 1, type: "DH", config: "", netW: "", netH: "", roughW: "", roughH: "", gridType: "None", gridPattern: "", gridLocation: "Both", litesW: "", litesH: "", tempered: "No", glass: "DP LoE2 Ar", glassTexture: "Clear", screen: "Full", casing: false, jamb: false, stools: false, wrapTrim: false, extTrim: false, extTrimSize: "", extTrimTexture: "", winWrap: "", metalRoll: "", metalColor: "", shapeCode: "", shapeNotes: "", baySeatDepth: "", bayProjection: "", bayPanels: "", bowPanelCount: "4", notes: "", expanded: true });
const mkDoor = () => ({ id: Date.now() + Math.random(), type: "", location: "", qty: 1, handing: "", operation: "", netW: "", netH: "", roughW: "", roughH: "", glassConfig: "", glass: "DP LoE2 Ar", glassTexture: "Clear", hardwareColor: "", hardwareType: "", jambThickness: "", sidelites: "None", sideliteW: "", transom: false, transomH: "", threshold: "", doorScreen: "", jamb: false, casing: false, wrapTrim: false, extTrim: false, extTrimSize: "", extTrimTexture: "", doorWrap: "", notes: "", expanded: true });
const mkProj = () => ({ customer: "", address: "", date: new Date().toISOString().split("T")[0], installType: "Replacement", brand: "", series: "", supplier: "GENERIC", brickmould: "", jChannel: "", wallThick: "2x4", winIntColor: "White", winExtColor: "White", doorIntColor: "White", doorExtColor: "White", specialColor: "", stoolColor: "", jambSpecies: "", jambFinish: "", jambColor: "", jambStainColor: "", casingSpecies: "", casingFinish: "", casingColor: "", casingStainColor: "", zapierUrl: "" });

function ShapeCanvas({ win, onChange }) {
  const pw = 200, ph = 160;
  const uid = useRef(`sc_${Math.random().toString(36).slice(2,8)}`).current;
  const selected = SHAPE_PRESETS.find(s => s.code === win.shapeCode);
  return (
    <div style={{ marginTop: 10, padding: 12, background: `${NAVY}06`, border: `1px solid ${NAVY}20`, borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>SPECIALTY SHAPE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {SHAPE_PRESETS.map(sp => (
          <button key={sp.code} onClick={() => onChange("shapeCode", sp.code)}
            style={{ padding: "4px 2px", border: win.shapeCode === sp.code ? `2px solid ${ORANGE}` : `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: win.shapeCode === sp.code ? `${ORANGE}12` : "#fff", cursor: "pointer", width: 72, textAlign: "center" }}>
            <svg viewBox="-2 -2 54 44" width={50} height={36}>
              <path d={sp.path(50, 40)} fill={`${NAVY}15`} stroke={win.shapeCode === sp.code ? ORANGE : NAVY} strokeWidth={1.5} />
            </svg>
            <div style={{ fontSize: 8, color: NAVY, marginTop: 1, fontWeight: 600 }}>{sp.name}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 8, padding: 12 }}>
            <svg viewBox={`-10 -10 ${pw + 20} ${ph + 20}`} width={pw + 20} height={ph + 20}>
              <defs>
                <marker id={`${uid}_r`} markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L6,2.5 L0,5" fill={ORANGE} /></marker>
                <marker id={`${uid}_l`} markerWidth="6" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L6,2.5 L0,5" fill={ORANGE} /></marker>
              </defs>
              <path d={selected.path(pw, ph)} fill={`${NAVY}10`} stroke={NAVY} strokeWidth={2} />
              <line x1={0} y1={ph + 8} x2={pw} y2={ph + 8} stroke={ORANGE} strokeWidth={1} markerEnd={`url(#${uid}_r)`} markerStart={`url(#${uid}_l)`} />
              <text x={pw / 2} y={ph + 18} textAnchor="middle" fontSize={11} fill={ORANGE} fontWeight={700}>{win.netW || "W"}"</text>
              <line x1={pw + 8} y1={0} x2={pw + 8} y2={ph} stroke={ORANGE} strokeWidth={1} />
              <text x={pw + 16} y={ph / 2 + 4} fontSize={11} fill={ORANGE} fontWeight={700}>{win.netH || "H"}"</text>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{selected.name}</div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 2 }}>SHAPE NOTES</label>
            <textarea value={win.shapeNotes || ""} onChange={e => onChange("shapeNotes", e.target.value)} placeholder="Describe shape, angles, radius..." style={{ width: "100%", padding: 8, fontSize: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, minHeight: 60, boxSizing: "border-box" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function BayBowConfig({ win, onChange }) {
  const isBow = win.type === "BOW";
  const panelCount = isBow ? (parseInt(win.bowPanelCount) || 4) : 3;
  const panels = (win.bayPanels || "").split(",").map(s => s.trim());
  const setPanelType = (idx, val) => {
    const p = [...Array(panelCount)].map((_, i) => panels[i] || (i === 0 || i === panelCount - 1 ? "DH" : "PIC"));
    p[idx] = val;
    onChange("bayPanels", p.join(","));
  };
  const displayPanels = [...Array(panelCount)].map((_, i) => panels[i] || (i === 0 || i === panelCount - 1 ? "DH" : "PIC"));
  const bbInp = { width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, boxSizing: "border-box" };
  return (
    <div style={{ marginTop: 10, padding: 12, background: `${NAVY}06`, border: `1px solid ${NAVY}20`, borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{isBow ? "BOW" : "BAY"} WINDOW CONFIG</div>
      <div style={{ display: "grid", gridTemplateColumns: isBow ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><label style={{ fontSize: 10, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 2 }}>SEAT DEPTH</label><input value={win.baySeatDepth || ""} onChange={e => onChange("baySeatDepth", e.target.value)} placeholder='18"' style={bbInp} /></div>
        <div><label style={{ fontSize: 10, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 2 }}>PROJECTION</label><input value={win.bayProjection || ""} onChange={e => onChange("bayProjection", e.target.value)} placeholder='12"' style={bbInp} /></div>
        {isBow && <div><label style={{ fontSize: 10, fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 2 }}>PANEL COUNT</label><select value={win.bowPanelCount || "4"} onChange={e => onChange("bowPanelCount", e.target.value)} style={{ ...bbInp, appearance: "auto" }}>{[3,4,5,6].map(n => <option key={n} value={n}>{n} panels</option>)}</select></div>}
      </div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#4b5563", marginBottom: 4 }}>PANEL TYPES (left to right)</div>
      <div style={{ display: "flex", gap: 6 }}>
        {displayPanels.map((pt, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: ORANGE, fontWeight: 700, marginBottom: 2 }}>P{i + 1}</div>
            <select value={pt} onChange={e => setPanelType(i, e.target.value)} style={{ width: "100%", padding: "6px 4px", fontSize: 11, border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, appearance: "auto" }}>
              {BAY_BOW_PANEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoorSizeGrid({ door, onChange }) {
  return (
    <div style={{ marginTop: 8, padding: 10, background: `${NAVY}06`, borderRadius: 8, border: `1px solid ${NAVY}15` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, marginBottom: 6, textTransform: "uppercase" }}>Quick Size Select</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {DOOR_STD_SIZES.map(sz => {
          const active = door.netW === sz.w && door.netH === sz.h;
          return (
            <button key={`${sz.w}x${sz.h}`} onClick={() => { onChange("netW", sz.w); onChange("netH", sz.h); }}
              style={{ padding: "5px 10px", fontSize: 12, fontWeight: active ? 700 : 500, border: active ? `2px solid ${ORANGE}` : `1px solid ${GRAY_BORDER}`, borderRadius: 5, background: active ? `${ORANGE}15` : "#fff", color: active ? ORANGE : NAVY, cursor: "pointer", minWidth: 64 }}>
              {sz.w} x {sz.h}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WinIcon({ type, gridType, gridLocation, litesW, litesH }) {
  const w = 48, h = 40;
  const s = { stroke: NAVY, strokeWidth: 1.5, fill: "none" };
  const a = { stroke: ORANGE, strokeWidth: 1.5, fill: "none" };
  const gS = { stroke: `${NAVY}60`, strokeWidth: 0.7 };
  const hasGrid = gridType && gridType !== "None";
  const lW = parseInt(litesW) || 2, lH = parseInt(litesH) || 2;
  const renderGridLines = (x, y, gw, gh) => {
    const lines = [];
    for (let i = 1; i < lW; i++) lines.push(<line key={`gv${i}`} x1={x + (gw / lW) * i} y1={y} x2={x + (gw / lW) * i} y2={y + gh} {...gS} />);
    for (let i = 1; i < lH; i++) lines.push(<line key={`gh${i}`} x1={x} y1={y + (gh / lH) * i} x2={x + gw} y2={y + (gh / lH) * i} {...gS} />);
    return lines;
  };
  const showUpper = hasGrid && (gridLocation === "Both" || gridLocation === "Upper Sash");
  const showLower = hasGrid && (gridLocation === "Both" || gridLocation === "Lower Sash");
  return (<svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
    <defs><marker id="wiah" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L6,2.5 L0,5" fill={ORANGE} /></marker></defs>
    {type === "DH" && <><rect x="8" y="2" width="32" height="17" rx="1" {...s} />{showUpper && renderGridLines(8, 2, 32, 17)}<rect x="8" y="21" width="32" height="17" rx="1" {...s} />{showLower && renderGridLines(8, 21, 32, 17)}<line x1="4" y1="28" x2="4" y2="6" {...a} markerEnd="url(#wiah)" /><line x1="44" y1="12" x2="44" y2="34" {...a} markerEnd="url(#wiah)" /></>}
    {type === "SH" && <><rect x="8" y="2" width="32" height="17" rx="1" {...s} fill={GRAY_BG} />{showUpper && renderGridLines(8, 2, 32, 17)}<rect x="8" y="21" width="32" height="17" rx="1" {...s} />{showLower && renderGridLines(8, 21, 32, 17)}<line x1="4" y1="34" x2="4" y2="12" {...a} markerEnd="url(#wiah)" /></>}
    {type === "CAS-L" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="40" y1="2" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="34" y1="20" x2="12" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "CAS-R" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="8" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="14" y1="20" x2="36" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "DCAS" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="22" y1="2" x2="22" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="26" y1="2" x2="26" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="18" y1="20" x2="6" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="30" y1="20" x2="42" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "TCAS" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="12" y1="20" x2="4" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="36" y1="20" x2="44" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "AWN" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="40" y2="2" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="42" {...a} markerEnd="url(#wiah)" /></>}
    {type === "DSLD" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="8" y1="20" x2="18" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="40" y1="20" x2="30" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "3SLD" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} fill={GRAY_BG} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="4" y1="20" x2="12" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="44" y1="20" x2="36" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "PIC" && <><rect x="8" y="2" width="32" height="36" rx="2" {...s} fill={`${NAVY}11`} />{hasGrid ? renderGridLines(8, 2, 32, 36) : <><line x1="8" y1="20" x2="40" y2="20" stroke={GRAY_BORDER} strokeWidth="0.5" /><line x1="24" y1="2" x2="24" y2="38" stroke={GRAY_BORDER} strokeWidth="0.5" /></>}</>}
    {type === "SHAPE" && <path d="M24,4 L40,16 L36,36 L12,36 L8,16 Z" {...s} fill={`${NAVY}11`} />}
    {type === "BAY" && <><line x1="8" y1="2" x2="8" y2="38" {...s} /><line x1="8" y1="2" x2="18" y2="8" {...s} /><line x1="8" y1="38" x2="18" y2="32" {...s} /><rect x="18" y="8" width="12" height="24" rx="1" {...s} /><line x1="30" y1="8" x2="40" y2="2" {...s} /><line x1="30" y1="32" x2="40" y2="38" {...s} /><line x1="40" y1="2" x2="40" y2="38" {...s} /></>}
    {type === "BOW" && <><path d="M4,20 Q14,4 24,4 Q34,4 44,20 Q34,36 24,36 Q14,36 4,20" {...s} fill={`${NAVY}08`} /><line x1="14" y1="6" x2="14" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="24" y1="4" x2="24" y2="36" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="34" y1="6" x2="34" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /></>}
    {type === "HOP" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} /><line x1="8" y1="38" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="8" x2="24" y2="-2" {...a} markerEnd="url(#wiah)" /></>}
    {type === "GARDEN" && <><path d="M6,38 L6,10 L14,2 L34,2 L42,10 L42,38 Z" {...s} fill={`${NAVY}08`} /><line x1="6" y1="10" x2="42" y2="10" {...s} /></>}
  </svg>);
}

function getSupplierLabels(code) {
  const base = { netW: "Net Width", netH: "Net Height", roughW: "Rough Width", roughH: "Rough Height", glass: "Glass", config: "Config" };
  switch (code) {
    case "PELLA": return { ...base, netW: "Unit Width", netH: "Unit Height", roughW: "R.O. Width", roughH: "R.O. Height", glass: "Glass Package" };
    case "ANDERSEN": return { ...base, netW: "Frame Width", netH: "Frame Height", roughW: "R.O. Width", roughH: "R.O. Height", glass: "Glass Type" };
    case "MARVIN": return { ...base, netW: "Daylight W", netH: "Daylight H", roughW: "Rough Open W", roughH: "Rough Open H", glass: "Glazing" };
    case "MI": return { ...base, netW: "Order Width", netH: "Order Height" };
    case "PROVIA": return { ...base, netW: "Door Width", netH: "Door Height", roughW: "Masonry W", roughH: "Masonry H" };
    default: return base;
  }
}

export default function App() {
  const [proj, setProj] = useState(mkProj());
  const [wins, setWins] = useState([mkWin()]);
  const [doors, setDoors] = useState([]);
  const [view, setView] = useState("form");
  const [saved, setSaved] = useState(false);
  const [jobList, setJobList] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [hdrOpen, setHdrOpen] = useState(true);
  const [matOpen, setMatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zapStatus, setZapStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => { (async () => { try { const r = await window.storage.list("uws-job:"); if (r?.keys) setJobList(r.keys); } catch (e) {} })(); }, []);
  useEffect(() => { (async () => { try { const r = await window.storage.get("uws-zapier-url"); if (r?.value) setProj(p => ({ ...p, zapierUrl: r.value })); } catch (e) {} })(); }, []);

  const tQty = wins.reduce((s, w) => s + (parseInt(w.qty) || 0), 0);
  const tPcs = wins.reduce((s, w) => s + (parseInt(w.qty) || 0) * getPcs(w.type), 0);

  const up = (f, v) => { setProj(p => ({ ...p, [f]: v })); setSaved(false); };
  const uw = (id, f, v) => { setWins(ws => ws.map(w => w.id === id ? { ...w, [f]: v } : w)); setSaved(false); };
  const ud = (id, f, v) => { setDoors(ds => ds.map(d => d.id === id ? { ...d, [f]: v } : d)); setSaved(false); };

  const addWin = () => setWins(ws => [...ws, mkWin()]);
  const rmWin = id => { setWins(ws => ws.filter(w => w.id !== id)); setSaved(false); };
  const dupWin = id => { setWins(ws => { const i = ws.findIndex(w => w.id === id); if (i === -1) return ws; const d = { ...ws[i], id: Date.now() + Math.random(), expanded: true }; const n = [...ws]; n.splice(i + 1, 0, d); return n; }); setSaved(false); };
  const addDoor = () => setDoors(ds => [...ds, mkDoor()]);
  const rmDoor = id => { setDoors(ds => ds.filter(d => d.id !== id)); setSaved(false); };
  const dupDoor = id => { setDoors(ds => { const i = ds.findIndex(d => d.id === id); if (i === -1) return ds; const c = { ...ds[i], id: Date.now() + Math.random(), expanded: true }; const n = [...ds]; n.splice(i + 1, 0, c); return n; }); setSaved(false); };

  const saveJob = async () => { const safeName = (proj.customer || "unnamed").replace(/[\s\/\\'"]+/g, "_"); const k = `uws-job:${safeName}-${proj.date}`; try { await window.storage.set(k, JSON.stringify({ proj, wins, doors })); setSaved(true); setTimeout(() => setSaved(false), 3000); const r = await window.storage.list("uws-job:"); if (r?.keys) setJobList(r.keys); } catch (e) { alert("Save failed: " + e.message); } };
  const loadJob = async k => { try { const r = await window.storage.get(k); if (r?.value) { const d = JSON.parse(r.value); setProj(p => ({ ...mkProj(), ...d.proj })); setWins((d.wins || []).map(w => ({ ...mkWin(), ...w, expanded: false }))); setDoors((d.doors || []).map(x => ({ ...mkDoor(), ...x, expanded: false }))); setShowJobs(false); } } catch (e) { alert("Load failed"); } };
  const delJob = async k => { try { await window.storage.delete(k); setJobList(j => j.filter(x => x !== k)); } catch (e) {} };
  const newJob = () => { setProj(p => ({ ...mkProj(), zapierUrl: p.zapierUrl })); setWins([mkWin()]); setDoors([]); setSaved(false); setView("form"); };
  const saveZapierUrl = async (url) => { try { await window.storage.set("uws-zapier-url", url); } catch (e) {} };

  const moveWin = (id, dir) => { setWins(ws => { const i = ws.findIndex(w => w.id === id); if (i === -1) return ws; const j = i + dir; if (j < 0 || j >= ws.length) return ws; const n = [...ws]; [n[i], n[j]] = [n[j], n[i]]; return n; }); setSaved(false); };
  const moveDoor = (id, dir) => { setDoors(ds => { const i = ds.findIndex(d => d.id === id); if (i === -1) return ds; const j = i + dir; if (j < 0 || j >= ds.length) return ds; const n = [...ds]; [n[i], n[j]] = [n[j], n[i]]; return n; }); setSaved(false); };

  const sendToZapier = async () => {
    if (!proj.zapierUrl) { setZapStatus("No webhook URL configured"); return; }
    setZapStatus("Sending...");
    try {
      const payload = {
        project: { customer: proj.customer, address: proj.address, date: proj.date, installType: proj.installType, brand: proj.brand, series: proj.series, supplier: proj.supplier },
        windows: wins.map((w, i) => ({ num: i + 1, location: w.location, qty: w.qty, type: w.type, config: w.config, netW: w.netW, netH: w.netH, roughW: w.roughW, roughH: w.roughH, glass: w.glass, gridType: w.gridType, tempered: w.tempered, screen: w.screen, notes: w.notes, shape: w.type === "SHAPE" ? w.shapeCode : "" })),
        doors: doors.map((d, i) => ({ num: i + 1, location: d.location, type: d.type, qty: d.qty, handing: d.handing, netW: d.netW, netH: d.netH, glassConfig: d.glassConfig, sidelites: d.sidelites, notes: d.notes })),
        totals: { windowQty: tQty, windowPcs: tPcs, doorCount: doors.length },
        sentAt: new Date().toISOString(),
      };
      await fetch(proj.zapierUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), mode: "no-cors" });
      setZapStatus("Sent to JobNimbus OK");
      setTimeout(() => setZapStatus(""), 4000);
    } catch (e) { setZapStatus("Failed -- check webhook URL"); setTimeout(() => setZapStatus(""), 5000); }
  };

  const matSum = (() => { let jLF = 0, cLF = 0, eLF = 0, jP = 0, cP = 0; wins.forEach(w => { const m = calcMaterials(w); if (!m) return; if (w.jamb) { jLF += parseFloat(m.jambLF); jP += m.jambPcs; } if (w.casing) { cLF += parseFloat(m.casingLF); cP += m.casingPcs; } if (w.extTrim) { eLF += parseFloat(m.extLF); } }); return { jLF: jLF.toFixed(1), cLF: cLF.toFixed(1), eLF: eLF.toFixed(1), jP, cP }; })();
  const doorMatSum = (() => { let jLF = 0, cLF = 0, eLF = 0, jP = 0, cP = 0, slE = ""; doors.forEach(d => { const m = calcDoorMaterials(d); if (!m) return; if (d.jamb) { jLF += parseFloat(m.jambLF); jP += m.jambPcs; } if (d.casing) { cLF += parseFloat(m.casingLF); cP += m.casingPcs; } if (d.extTrim) { eLF += parseFloat(m.extLF); if (m.sideliteExtra) slE += (slE ? ", " : "") + m.sideliteExtra; } }); return { jLF: jLF.toFixed(1), cLF: cLF.toFixed(1), eLF: eLF.toFixed(1), jP, cP, slE }; })();

  const inp = { width: "100%", padding: "10px 12px", fontSize: 15, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: "#fff", color: "#1a1a1a", boxSizing: "border-box" };
  const sel = { ...inp, appearance: "auto" };
  const lbl = { fontSize: 11, fontWeight: 600, color: "#4b5563", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: 0.3 };
  const sec = { fontSize: 14, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 6 };
  const bP = { background: ORANGE, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" };
  const bS = { background: "#fff", color: NAVY, border: `2px solid ${NAVY}`, padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const chk = { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", fontSize: 13, color: "#374151" };
  const sLbl = getSupplierLabels(proj.supplier);
  const bayBowSummary = (w) => { if (w.type !== "BAY" && w.type !== "BOW") return ""; const parts = []; if (w.baySeatDepth) parts.push(`Seat: ${w.baySeatDepth}`); if (w.bayProjection) parts.push(`Proj: ${w.bayProjection}`); if (w.bayPanels) parts.push(`Panels: ${w.bayPanels}`); return parts.join(" | "); };

  // ====== PRINT VIEW ======
  if (view === "print") return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div data-noprint style={{ padding: "12px 20px", background: NAVY, display: "flex", gap: 12, alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setView("form")} style={{ ...bS, color: "#fff", borderColor: "#fff", padding: "8px 16px", fontSize: 13 }}>{"<< Back"}</button>
        <button onClick={() => window.print()} style={{ ...bP, padding: "8px 20px", fontSize: 13 }}>Export PDF</button>
        {proj.zapierUrl && <button onClick={sendToZapier} style={{ ...bS, color: "#fff", borderColor: ORANGE, padding: "8px 16px", fontSize: 12 }}>{zapStatus || "Send to JobNimbus"}</button>}
      </div>
      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: `3px solid ${NAVY}`, paddingBottom: 10 }}>
          <div><div style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: 1 }}>UNITED WINDOWS & SIDING</div><div style={{ fontSize: 15, fontWeight: 700, color: ORANGE, marginTop: 2 }}>WINDOW & DOOR MEASURE SHEET</div></div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#666" }}><div>(319) 259-6464</div><div style={{ fontStyle: "italic" }}>Uniting the community one customer at a time.</div>{proj.supplier !== "GENERIC" && <div style={{ fontWeight: 700, color: NAVY, marginTop: 2 }}>Supplier: {SUPPLIERS.find(s => s.code === proj.supplier)?.name}</div>}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
          <div><strong>Customer:</strong> {proj.customer}</div><div><strong>Address:</strong> {proj.address}</div><div><strong>Date:</strong> {proj.date}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, fontSize: 11, marginBottom: 8, padding: "8px 10px", background: GRAY_BG, borderRadius: 6 }}>
          <div><strong>Install:</strong> {proj.installType}</div><div><strong>Brand:</strong> {proj.brand} {proj.series}</div><div><strong>Wall:</strong> {proj.wallThick}</div><div><strong>BM:</strong> {proj.brickmould} | <strong>J-Ch:</strong> {proj.jChannel}</div>
          <div><strong>Win Int:</strong> {proj.winIntColor}</div><div><strong>Win Ext:</strong> {proj.winExtColor}</div><div><strong>Door Int:</strong> {proj.doorIntColor}</div><div><strong>Door Ext:</strong> {proj.doorExtColor}</div>
        </div>
        {(proj.jambSpecies || proj.casingSpecies) && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 8, padding: "6px 10px", background: GRAY_BG, borderRadius: 6 }}>
          {proj.jambSpecies && <div><strong>Jamb:</strong> {proj.jambSpecies} {"|"} {proj.jambFinish}{proj.jambFinish === "Stained" && proj.jambStainColor ? ` (${proj.jambStainColor})` : ""} {proj.jambColor}</div>}
          {proj.casingSpecies && <div><strong>Casing:</strong> {proj.casingSpecies} {"|"} {proj.casingFinish}{proj.casingFinish === "Stained" && proj.casingStainColor ? ` (${proj.casingStainColor})` : ""} {proj.casingColor}</div>}
        </div>}
        {proj.specialColor && <div style={{ fontSize: 11, marginBottom: 4 }}><strong>Special Color:</strong> {proj.specialColor}</div>}
        {proj.stoolColor && <div style={{ fontSize: 11, marginBottom: 10 }}><strong>Stool Color:</strong> {proj.stoolColor}</div>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead><tr style={{ background: NAVY, color: "#fff" }}>
              {["#", "Location", "Qty", "Type", sLbl.config, sLbl.netW, sLbl.netH, sLbl.roughW, sLbl.roughH, sLbl.glass, "Texture", "Grid", "Lites", "Tempered", "Screen", "Metal", "Ext Trim", "Wrap", "Notes", "Pcs"].map((h, i) =>
                <th key={i} style={{ padding: "5px 3px", textAlign: "left", fontWeight: 600, fontSize: 9, whiteSpace: "nowrap", borderRight: "1px solid #1a5a7a" }}>{h}</th>
              )}
            </tr></thead>
            <tbody>{wins.map((w, i) => {
              const bb = bayBowSummary(w);
              const shapeName = w.type === "SHAPE" && w.shapeCode ? ` (${SHAPE_PRESETS.find(sp => sp.code === w.shapeCode)?.name || w.shapeCode})` : "";
              return (
                <tr key={w.id} style={{ borderBottom: "1px solid #ddd", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={{ padding: "4px 3px", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: "4px 3px" }}>{w.location}</td>
                  <td style={{ padding: "4px 3px", textAlign: "center" }}>{w.qty}</td>
                  <td style={{ padding: "4px 3px", fontWeight: 600 }}>{w.type}{shapeName}</td>
                  <td style={{ padding: "4px 3px" }}>{w.config}</td>
                  <td style={{ padding: "4px 3px" }}>{w.netW}</td><td style={{ padding: "4px 3px" }}>{w.netH}</td>
                  <td style={{ padding: "4px 3px" }}>{w.roughW}</td><td style={{ padding: "4px 3px" }}>{w.roughH}</td>
                  <td style={{ padding: "4px 3px" }}>{w.glass}</td>
                  <td style={{ padding: "4px 3px" }}>{w.glassTexture !== "Clear" ? w.glassTexture : ""}</td>
                  <td style={{ padding: "4px 3px" }}>{w.gridType !== "None" ? `${w.gridType}${w.gridPattern ? ` ${w.gridPattern}` : ""}${w.gridLocation && w.gridLocation !== "Both" ? ` (${w.gridLocation})` : ""}` : "--"}</td>
                  <td style={{ padding: "4px 3px" }}>{w.litesW && w.litesH ? `${w.litesW}x${w.litesH}` : "--"}</td>
                  <td style={{ padding: "4px 3px" }}>{w.tempered !== "No" ? w.tempered : ""}</td>
                  <td style={{ padding: "4px 3px" }}>{w.screen}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9 }}>{w.metalRoll}{w.metalColor ? ` ${w.metalColor}` : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9 }}>{w.extTrim ? `${w.extTrimSize || ""}${w.extTrimTexture ? ` ${w.extTrimTexture}` : ""}` : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9 }}>{w.winWrap}{w.wrapTrim ? " | Wrap" : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>{[w.notes, w.type === "SHAPE" && w.shapeNotes ? `Shape: ${w.shapeNotes}` : "", bb].filter(Boolean).join(" | ")}</td>
                  <td style={{ padding: "4px 3px", textAlign: "center", fontWeight: 700, color: ORANGE }}>{(parseInt(w.qty) || 0) * getPcs(w.type)}</td>
                </tr>);
            })}</tbody>
            <tfoot><tr style={{ background: NAVY, color: "#fff", fontWeight: 700 }}><td colSpan="2" style={{ padding: "5px 6px" }}>TOTALS</td><td style={{ padding: "5px 3px", textAlign: "center" }}>{tQty}</td><td colSpan="16" /><td style={{ padding: "5px 3px", textAlign: "center", color: ORANGE, fontSize: 12 }}>{tPcs}</td></tr></tfoot>
          </table>
        </div>
        {(parseFloat(matSum.jLF) > 0 || parseFloat(matSum.cLF) > 0 || parseFloat(matSum.eLF) > 0) && (
          <div style={{ marginTop: 16, padding: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: GRAY_BG }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>WINDOW MATERIAL ESTIMATE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 11 }}>
              {parseFloat(matSum.jLF) > 0 && <div><strong>Interior Jamb:</strong> {matSum.jLF} LF ({matSum.jP} pcs)</div>}
              {parseFloat(matSum.cLF) > 0 && <div><strong>Interior Casing:</strong> {matSum.cLF} LF ({matSum.cP} pcs)</div>}
              {parseFloat(matSum.eLF) > 0 && <div><strong>Exterior Trim:</strong> {matSum.eLF} LF</div>}
            </div>
          </div>
        )}
        {wins.some(w => w.type === "SHAPE" && w.shapeCode) && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 4 }}>SPECIALTY WINDOW SHAPES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {wins.filter(w => w.type === "SHAPE" && w.shapeCode).map((w) => {
                const sp = SHAPE_PRESETS.find(s => s.code === w.shapeCode);
                if (!sp) return null;
                return (<div key={w.id} style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <svg viewBox="-4 -4 108 88" width={100} height={80}><path d={sp.path(100, 80)} fill={`${NAVY}10`} stroke={NAVY} strokeWidth={1.5} /></svg>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NAVY }}>{w.location || `Win #${wins.indexOf(w) + 1}`}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{sp.name} {"|"} {w.netW}" {"x"} {w.netH}"</div>
                  {w.shapeNotes && <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>{w.shapeNotes}</div>}
                </div>);
              })}
            </div>
          </div>
        )}
        {doors.length > 0 && (<div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 4 }}>DOOR SELECTION</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead><tr style={{ background: NAVY, color: "#fff" }}>
              {["#", "Location", "Type", "Qty", "Hand", "Op", sLbl.netW, sLbl.netH, "R.O. W", "R.O. H", "Glass Cfg", "Glass", "Jamb Thk", "Sidelites", "Threshold", "Screen", "Hardware", "Wrap", "Notes"].map((h, i) =>
                <th key={i} style={{ padding: "5px 3px", textAlign: "left", fontWeight: 600, fontSize: 8, borderRight: "1px solid #1a5a7a", whiteSpace: "nowrap" }}>{h}</th>
              )}
            </tr></thead>
            <tbody>{doors.map((d, i) => <tr key={d.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "4px 3px", fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "4px 3px" }}>{d.location}</td><td style={{ padding: "4px 3px" }}>{d.type}</td>
              <td style={{ padding: "4px 3px", textAlign: "center" }}>{d.qty}</td><td style={{ padding: "4px 3px" }}>{d.handing}</td><td style={{ padding: "4px 3px" }}>{d.operation}</td>
              <td style={{ padding: "4px 3px" }}>{d.netW}</td><td style={{ padding: "4px 3px" }}>{d.netH}</td><td style={{ padding: "4px 3px" }}>{d.roughW}</td><td style={{ padding: "4px 3px" }}>{d.roughH}</td>
              <td style={{ padding: "4px 3px" }}>{d.glassConfig}</td><td style={{ padding: "4px 3px" }}>{d.glass}{d.glassTexture !== "Clear" ? ` ${d.glassTexture}` : ""}</td>
              <td style={{ padding: "4px 3px" }}>{d.jambThickness}</td><td style={{ padding: "4px 3px" }}>{d.sidelites !== "None" ? `${d.sidelites}${d.sideliteW ? ` ${d.sideliteW}"` : ""}` : ""}</td>
              <td style={{ padding: "4px 3px" }}>{d.threshold}</td><td style={{ padding: "4px 3px" }}>{d.doorScreen}</td>
              <td style={{ padding: "4px 3px", fontSize: 9 }}>{d.hardwareColor} {d.hardwareType}</td><td style={{ padding: "4px 3px" }}>{d.doorWrap}</td><td style={{ padding: "4px 3px", fontSize: 9 }}>{d.notes}</td>
            </tr>)}</tbody>
          </table>
          {(parseFloat(doorMatSum.jLF) > 0 || parseFloat(doorMatSum.cLF) > 0 || parseFloat(doorMatSum.eLF) > 0) && (
            <div style={{ marginTop: 10, padding: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: GRAY_BG }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>DOOR MATERIAL ESTIMATE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 11 }}>
                {parseFloat(doorMatSum.jLF) > 0 && <div><strong>Jamb Ext:</strong> {doorMatSum.jLF} LF ({doorMatSum.jP} pcs)</div>}
                {parseFloat(doorMatSum.cLF) > 0 && <div><strong>Casing (both sides):</strong> {doorMatSum.cLF} LF ({doorMatSum.cP} pcs)</div>}
                {parseFloat(doorMatSum.eLF) > 0 && <div><strong>Ext Trim:</strong> {doorMatSum.eLF} LF{doorMatSum.slE ? ` ${doorMatSum.slE}` : ""}</div>}
              </div>
            </div>
          )}
        </div>)}
      </div>
      <style>{"@media print{[data-noprint]{display:none!important;}body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}table{page-break-inside:auto;}tr{page-break-inside:avoid;}}"}</style>
    </div>
  );

  // ====== FORM VIEW ======
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: GRAY_BG, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ background: NAVY, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>UWS</div><div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.3)" }} /><div style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>MEASURE SHEET</div></div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setSettingsOpen(!settingsOpen)} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}> Settings</button>
          <button onClick={() => setShowJobs(!showJobs)} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>Jobs</button>
          <button onClick={newJob} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>+ New</button>
          <button onClick={() => navigate("/final-measure")} style={{ ...bP, padding: "5px 10px", fontSize: 11 }}>Final Measure</button>
        </div>
      </div>
      {settingsOpen && <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, margin: "0 12px", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Settings — Zapier / JobNimbus</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input style={{ ...inp, flex: 1, fontSize: 12, padding: "8px 10px" }} value={proj.zapierUrl} onChange={e => up("zapierUrl", e.target.value)} placeholder="https://hooks.zapier.com/hooks/catch/..." />
          <button onClick={() => saveZapierUrl(proj.zapierUrl)} style={{ ...bS, padding: "8px 14px", fontSize: 11, whiteSpace: "nowrap" }}>Save URL</button>
        </div>
        <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Paste your Zapier webhook URL. Job data POSTs as JSON when you click Send to JobNimbus.</div>
      </div>}
      {showJobs && <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, margin: "0 12px", borderRadius: "0 0 8px 8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 220, overflowY: "auto" }}>
        {jobList.length === 0 ? <div style={{ padding: 14, color: "#999", fontSize: 12 }}>No saved jobs</div> : jobList.map(k => <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <span onClick={() => loadJob(k)} style={{ cursor: "pointer", fontSize: 12, color: NAVY, fontWeight: 500 }}>{k.replace("uws-job:", "")}</span>
          <button onClick={() => delJob(k)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, cursor: "pointer" }}> X</button>
        </div>)}
      </div>}
      <div style={{ padding: "14px 12px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div onClick={() => setHdrOpen(!hdrOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}><div style={sec}>Project Details</div><span style={{ fontSize: 16, color: NAVY }}>{hdrOpen ? "v" : ">"}</span></div>
          {hdrOpen && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lbl}>Customer</label><input style={inp} value={proj.customer} onChange={e => up("customer", e.target.value)} placeholder="Customer name" /></div>
              <div><label style={lbl}>Date</label><input style={inp} type="date" value={proj.date} onChange={e => up("date", e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 10 }}><label style={lbl}>Address</label><input style={inp} value={proj.address} onChange={e => up("address", e.target.value)} placeholder="Street, City, State" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
              <div><label style={lbl}>Install Type</label><select style={sel} value={proj.installType} onChange={e => up("installType", e.target.value)}>{INSTALL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>Supplier</label><select style={sel} value={proj.supplier} onChange={e => up("supplier", e.target.value)}>{SUPPLIERS.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</select></div>
              <div><label style={lbl}>Brand</label><input style={inp} value={proj.brand} onChange={e => up("brand", e.target.value)} placeholder="Pella" /></div>
              <div><label style={lbl}>Series</label><input style={inp} value={proj.series} onChange={e => up("series", e.target.value)} placeholder="250" /></div>
              <div><label style={lbl}>Wall Thickness</label><select style={sel} value={proj.wallThick} onChange={e => up("wallThick", e.target.value)}>{WALL_THICK.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div><label style={lbl}>Brickmould</label><input style={inp} value={proj.brickmould} onChange={e => up("brickmould", e.target.value)} placeholder="Yes / No / Size" /></div>
              <div><label style={lbl}>J-Channel</label><input style={inp} value={proj.jChannel} onChange={e => up("jChannel", e.target.value)} placeholder="Yes / No / Size" /></div>
            </div>
            <div style={{ ...sec, marginTop: 18, marginBottom: 8 }}>Color Selection</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              <div><label style={lbl}>Win Interior</label><input style={inp} value={proj.winIntColor} onChange={e => up("winIntColor", e.target.value)} /></div>
              <div><label style={lbl}>Win Exterior</label><input style={inp} value={proj.winExtColor} onChange={e => up("winExtColor", e.target.value)} /></div>
              <div><label style={lbl}>Door Interior</label><input style={inp} value={proj.doorIntColor} onChange={e => up("doorIntColor", e.target.value)} /></div>
              <div><label style={lbl}>Door Exterior</label><input style={inp} value={proj.doorExtColor} onChange={e => up("doorExtColor", e.target.value)} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div><label style={lbl}>Stool Color</label><input style={inp} value={proj.stoolColor} onChange={e => up("stoolColor", e.target.value)} placeholder="White" /></div>
              <div><label style={lbl}>Special Color & Location</label><input style={inp} value={proj.specialColor} onChange={e => up("specialColor", e.target.value)} placeholder="Black exterior on front only" /></div>
            </div>
            <div style={{ ...sec, marginTop: 18, marginBottom: 8 }}>Interior Trim Materials</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div><label style={lbl}>Jamb Species</label><select style={sel} value={proj.jambSpecies} onChange={e => up("jambSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
              <div><label style={lbl}>Jamb Finish</label><select style={sel} value={proj.jambFinish} onChange={e => up("jambFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
              {proj.jambFinish === "Stained" ? <div><label style={lbl}>Stain Color</label><select style={sel} value={proj.jambStainColor} onChange={e => up("jambStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select></div> : <div><label style={lbl}>Jamb Color</label><input style={inp} value={proj.jambColor} onChange={e => up("jambColor", e.target.value)} placeholder="Color" /></div>}
              {proj.jambFinish === "Stained" && proj.jambStainColor === "Custom" ? <div><label style={lbl}>Custom Stain</label><input style={inp} value={proj.jambColor} onChange={e => up("jambColor", e.target.value)} placeholder="Custom stain name" /></div> : <div />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
              <div><label style={lbl}>Casing Species</label><select style={sel} value={proj.casingSpecies} onChange={e => up("casingSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
              <div><label style={lbl}>Casing Finish</label><select style={sel} value={proj.casingFinish} onChange={e => up("casingFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
              {proj.casingFinish === "Stained" ? <div><label style={lbl}>Stain Color</label><select style={sel} value={proj.casingStainColor} onChange={e => up("casingStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select></div> : <div><label style={lbl}>Casing Color</label><input style={inp} value={proj.casingColor} onChange={e => up("casingColor", e.target.value)} placeholder="Color" /></div>}
              {proj.casingFinish === "Stained" && proj.casingStainColor === "Custom" ? <div><label style={lbl}>Custom Stain</label><input style={inp} value={proj.casingColor} onChange={e => up("casingColor", e.target.value)} placeholder="Custom stain name" /></div> : <div />}
            </div>
          </>}
        </div>

        <div style={{ ...sec, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>Windows ({wins.length})</span><div style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 600 }}><span style={{ color: NAVY }}>QTY: {tQty}</span><span style={{ color: ORANGE }}>PCS: {tPcs}</span></div></div>
        {wins.map((w, idx) => { const mats = calcMaterials(w); const isBayBow = w.type === "BAY" || w.type === "BOW"; return (
          <div key={w.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: w.expanded ? `2px solid ${NAVY}22` : "2px solid transparent" }}>
            <div onClick={() => uw(w.id, "expanded", !w.expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: w.expanded ? `${NAVY}08` : "transparent" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE, width: 24, textAlign: "center" }}>{idx + 1}</div>
              <WinIcon type={w.type} gridType={w.gridType} gridLocation={w.gridLocation} litesW={w.litesW} litesH={w.litesH} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{w.location || "--"}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{WINDOW_TYPES.find(t => t.code === w.type)?.name}{w.type === "SHAPE" && w.shapeCode ? ` (${SHAPE_PRESETS.find(sp => sp.code === w.shapeCode)?.name || w.shapeCode})` : ""}{w.config ? ` | ${w.config}` : ""}{w.netW && w.netH ? ` | ${w.netW} x ${w.netH}` : ""}</div>
              </div>
              {!w.expanded && (w.casing || w.jamb || w.stools || w.extTrim || w.wrapTrim) && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 100 }}>
                  {w.jamb && <span style={{ fontSize: 9, background: `${NAVY}15`, color: NAVY, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>JAMB</span>}
                  {w.casing && <span style={{ fontSize: 9, background: `${GREEN}20`, color: GREEN, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>CSG</span>}
                  {w.stools && <span style={{ fontSize: 9, background: `${ORANGE}20`, color: ORANGE, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>STLS</span>}
                  {w.extTrim && <span style={{ fontSize: 9, background: `${ORANGE}20`, color: ORANGE, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>EXT</span>}
                  {w.wrapTrim && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>WRAP</span>}
                </div>
              )}
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Qty: {w.qty}</div><div style={{ fontSize: 11, color: ORANGE, fontWeight: 600 }}>{(parseInt(w.qty) || 0) * getPcs(w.type)} pcs</div></div>
              <span style={{ fontSize: 14, color: NAVY, marginLeft: 2 }}>{w.expanded ? "v" : ">"}</span>
            </div>
            {w.expanded && <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${GRAY_BORDER}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 2fr 1.2fr", gap: 8, marginTop: 10 }}>
                <div><label style={lbl}>Location</label><input style={inp} value={w.location} onChange={e => uw(w.id, "location", e.target.value)} placeholder="Master Bed" /></div>
                <div><label style={lbl}>Qty</label><input style={inp} type="number" min="1" value={w.qty} onChange={e => uw(w.id, "qty", e.target.value)} /></div>
                <div><label style={lbl}>Window Type</label><select style={sel} value={w.type} onChange={e => uw(w.id, "type", e.target.value)}>{WINDOW_TYPES.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}</select></div>
                <div><label style={lbl}>Config / Handing</label><input style={inp} value={w.config} onChange={e => uw(w.id, "config", e.target.value)} placeholder="LH, RH, XO" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>{sLbl.netW}</label><input style={inp} value={w.netW} onChange={e => uw(w.id, "netW", e.target.value)} placeholder="35 1/2" /></div>
                <div><label style={lbl}>{sLbl.netH}</label><input style={inp} value={w.netH} onChange={e => uw(w.id, "netH", e.target.value)} placeholder="59 1/2" /></div>
                <div><label style={lbl}>{sLbl.roughW}</label><input style={inp} value={w.roughW} onChange={e => uw(w.id, "roughW", e.target.value)} placeholder="36" /></div>
                <div><label style={lbl}>{sLbl.roughH}</label><input style={inp} value={w.roughH} onChange={e => uw(w.id, "roughH", e.target.value)} placeholder="60" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 0.8fr 0.8fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>{sLbl.glass}</label><select style={sel} value={w.glass} onChange={e => uw(w.id, "glass", e.target.value)}>{GLASS_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Texture</label><select style={sel} value={w.glassTexture} onChange={e => uw(w.id, "glassTexture", e.target.value)}>{GLASS_TEXTURES.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Tempered</label><select style={sel} value={w.tempered} onChange={e => uw(w.id, "tempered", e.target.value)}>{TEMPERED_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Screen</label><select style={sel} value={w.screen} onChange={e => uw(w.id, "screen", e.target.value)}>{SCREEN_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Grid Type</label><select style={sel} value={w.gridType} onChange={e => uw(w.id, "gridType", e.target.value)}>{GRID_TYPES.map(g => <option key={g}>{g}</option>)}</select></div>
                {w.gridType !== "None" ? <div><label style={lbl}>Pattern</label><select style={sel} value={w.gridPattern} onChange={e => uw(w.id, "gridPattern", e.target.value)}><option value="">"--"</option>{GRID_PATTERNS.map(g => <option key={g}>{g}</option>)}</select></div> : <div />}
              </div>
              {w.gridType !== "None" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 3fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>Location</label><select style={sel} value={w.gridLocation || "Both"} onChange={e => uw(w.id, "gridLocation", e.target.value)}>{GRID_LOCATIONS.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Lites W</label><input style={inp} value={w.litesW} onChange={e => uw(w.id, "litesW", e.target.value)} placeholder="2" /></div>
                <div><label style={lbl}>Lites H</label><input style={inp} value={w.litesH} onChange={e => uw(w.id, "litesH", e.target.value)} placeholder="3" /></div><div />
              </div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>Metal Roll</label><select style={sel} value={w.metalRoll} onChange={e => uw(w.id, "metalRoll", e.target.value)}>{METAL_OPTIONS.map(m => <option key={m} value={m}>{m || "-- None --"}</option>)}</select></div>
                <div><label style={lbl}>Metal Color</label><select style={sel} value={w.metalColor} onChange={e => uw(w.id, "metalColor", e.target.value)}>{METAL_COLORS.map(c => <option key={c} value={c}>{c || "--"}</option>)}</select></div>
                <div><label style={lbl}>Win Wrap</label><select style={sel} value={w.winWrap} onChange={e => uw(w.id, "winWrap", e.target.value)}>{WIN_WRAP_SIZES.map(s => <option key={s} value={s}>{s || "-- None --"}</option>)}</select></div>
                <div />
              </div>
              <div style={{ marginTop: 8 }}><label style={lbl}>Notes</label><input style={inp} value={w.notes} onChange={e => uw(w.id, "notes", e.target.value)} placeholder="Additional notes..." /></div>
              {w.type === "SHAPE" && <ShapeCanvas win={w} onChange={(f, v) => uw(w.id, f, v)} />}
              {isBayBow && <BayBowConfig win={w} onChange={(f, v) => uw(w.id, f, v)} />}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 8 }}>
                {[["casing", "Casing"], ["jamb", "Jamb Ext"], ["stools", "Stools"], ["wrapTrim", "Wrap"]].map(([f, l]) =>
                  <label key={f} style={chk}><input type="checkbox" checked={w[f]} onChange={e => uw(w.id, f, e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />{l}</label>
                )}
                <label style={chk}><input type="checkbox" checked={w.extTrim} onChange={e => uw(w.id, "extTrim", e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />Exterior Trim</label>
              </div>
              {w.extTrim && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginTop: 6 }}>
                <div><label style={lbl}>Ext Trim Size</label><select style={sel} value={w.extTrimSize} onChange={e => uw(w.id, "extTrimSize", e.target.value)}>{EXT_TRIM_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Ext Trim Texture</label><select style={sel} value={w.extTrimTexture} onChange={e => uw(w.id, "extTrimTexture", e.target.value)}>{EXT_TRIM_TEXTURES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                <div />
              </div>}
              {mats && (w.jamb || w.casing || w.extTrim) && <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 8, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4, fontSize: 12 }}>Material Calc ({mats.width}" {"x"} {mats.height}" {"x"} {w.qty})</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {w.jamb && <div><strong>Jamb:</strong> {mats.jambLF} LF {"|"} {mats.jambPcs} pcs<br /><span style={{ color: "#666" }}>{mats.jambDetail}</span></div>}
                  {w.casing && <div><strong>Casing:</strong> {mats.casingLF} LF {"|"} {mats.casingPcs} pcs<br /><span style={{ color: "#666" }}>{mats.casingDetail}</span></div>}
                  {w.extTrim && <div><strong>Ext Trim:</strong> {mats.extLF} LF{w.extTrimSize ? ` (${w.extTrimSize}${w.extTrimTexture ? ` ${w.extTrimTexture}` : ""})` : ""}<br /><span style={{ color: "#666" }}>{mats.extDetail}</span></div>}
                </div>
              </div>}
              <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
                {idx > 0 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, -1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↑</button>}
                {idx < wins.length - 1 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, 1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↓</button>}
                <button onClick={() => dupWin(w.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11 }}>Duplicate</button>
                {wins.length > 1 && <button onClick={() => rmWin(w.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11, color: "#ef4444", borderColor: "#ef4444" }}>Remove</button>}
              </div>
            </div>}
          </div>
        ); })}
        <button onClick={addWin} style={{ ...bP, width: "100%", marginTop: 6, padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10 }}>+ Add Window</button>
        {(parseFloat(matSum.jLF) > 0 || parseFloat(matSum.cLF) > 0 || parseFloat(matSum.eLF) > 0) && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: `2px solid ${GREEN}20` }}>
            <div onClick={() => setMatOpen(!matOpen)} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}><div style={{ ...sec, color: GREEN, borderColor: GREEN }}>Material Summary</div><span style={{ fontSize: 14, color: GREEN }}>{matOpen ? "v" : ">"}</span></div>
            {matOpen && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 13 }}>
              {parseFloat(matSum.jLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Interior Jamb</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{matSum.jLF} LF</div><div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{matSum.jP} stock pcs</div></div>}
              {parseFloat(matSum.cLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Interior Casing</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{matSum.cLF} LF</div><div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{matSum.cP} stock pcs</div></div>}
              {parseFloat(matSum.eLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Exterior Trim</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{matSum.eLF} LF</div></div>}
            </div>}
          </div>
        )}

        <div style={{ ...sec, marginTop: 16, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>Doors ({doors.length})</span>{doors.length > 0 && <div style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 600 }}><span style={{ color: "#666" }}>QTY: {doors.reduce((s, d) => s + (parseInt(d.qty) || 0), 0)}</span></div>}</div>
        {doors.map((d, idx) => { const dMats = calcDoorMaterials(d); return (
          <div key={d.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: d.expanded ? `2px solid ${NAVY}22` : "2px solid transparent" }}>
            <div onClick={() => ud(d.id, "expanded", !d.expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: d.expanded ? `${NAVY}08` : "transparent" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE, width: 24, textAlign: "center" }}>D{idx + 1}</div>
              <svg viewBox="0 0 48 40" width={48} height={40}><rect x="10" y="2" width="28" height="36" rx="2" stroke={NAVY} strokeWidth="1.5" fill="none" /><circle cx="33" cy="22" r="2" fill={ORANGE} /><line x1="10" y1="2" x2="10" y2="38" stroke={NAVY} strokeWidth="2.5" /></svg>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{d.location || d.type || "--"}</div><div style={{ fontSize: 11, color: "#666" }}>{d.type}{d.handing ? ` | ${d.handing}` : ""}{d.netW && d.netH ? ` | ${d.netW} x ${d.netH}` : ""}{d.glassConfig ? ` | ${d.glassConfig}` : ""}</div></div>
              <span style={{ fontSize: 14, color: NAVY }}>{d.expanded ? "v" : ">"}</span>
            </div>
            {d.expanded && <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${GRAY_BORDER}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 0.7fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                <div><label style={lbl}>Location</label><input style={inp} value={d.location} onChange={e => ud(d.id, "location", e.target.value)} placeholder="Front Entry" /></div>
                <div><label style={lbl}>Door Type</label><select style={sel} value={d.type} onChange={e => ud(d.id, "type", e.target.value)}>{DOOR_TYPES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Qty</label><input style={inp} type="number" min="1" value={d.qty} onChange={e => ud(d.id, "qty", e.target.value)} /></div>
                <div><label style={lbl}>Handing</label><select style={sel} value={d.handing} onChange={e => ud(d.id, "handing", e.target.value)}><option value="">"--"</option><option>Left</option><option>Right</option></select></div>
                <div><label style={lbl}>Operation</label><select style={sel} value={d.operation} onChange={e => ud(d.id, "operation", e.target.value)}><option value="">"--"</option><option>Inswing</option><option>Outswing</option></select></div>
              </div>
              <DoorSizeGrid door={d} onChange={(f, v) => ud(d.id, f, v)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>{sLbl.netW}</label><input style={inp} value={d.netW} onChange={e => ud(d.id, "netW", e.target.value)} placeholder="36" /></div>
                <div><label style={lbl}>{sLbl.netH}</label><input style={inp} value={d.netH} onChange={e => ud(d.id, "netH", e.target.value)} placeholder="80" /></div>
                <div><label style={lbl}>{sLbl.roughW}</label><input style={inp} value={d.roughW} onChange={e => ud(d.id, "roughW", e.target.value)} /></div>
                <div><label style={lbl}>{sLbl.roughH}</label><input style={inp} value={d.roughH} onChange={e => ud(d.id, "roughH", e.target.value)} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>Glass Config</label><select style={sel} value={d.glassConfig} onChange={e => ud(d.id, "glassConfig", e.target.value)}>{DOOR_GLASS_CONFIGS.map(g => <option key={g} value={g}>{g || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>{sLbl.glass}</label><select style={sel} value={d.glass} onChange={e => ud(d.id, "glass", e.target.value)}>{GLASS_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Glass Texture</label><select style={sel} value={d.glassTexture} onChange={e => ud(d.id, "glassTexture", e.target.value)}>{GLASS_TEXTURES.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label style={lbl}>Jamb Thickness</label><select style={sel} value={d.jambThickness} onChange={e => ud(d.id, "jambThickness", e.target.value)}>{DOOR_JAMB_THICKNESS.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>Hardware Color</label><input style={inp} value={d.hardwareColor} onChange={e => ud(d.id, "hardwareColor", e.target.value)} placeholder="Brushed Nickel" /></div>
                <div><label style={lbl}>Hardware Type</label><input style={inp} value={d.hardwareType} onChange={e => ud(d.id, "hardwareType", e.target.value)} placeholder="Handleset" /></div>
                <div><label style={lbl}>Sidelites</label><select style={sel} value={d.sidelites} onChange={e => ud(d.id, "sidelites", e.target.value)}>{DOOR_SIDELITES.map(s => <option key={s}>{s}</option>)}</select></div>
                {d.sidelites !== "None" ? <div><label style={lbl}>Sidelite Width</label><input style={inp} value={d.sideliteW} onChange={e => ud(d.id, "sideliteW", e.target.value)} placeholder="14" /></div> : <div />}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr", gap: 8, marginTop: 8, alignItems: "end" }}>
                <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={d.transom} onChange={e => ud(d.id, "transom", e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />Transom</label>
                {d.transom ? <div><label style={lbl}>Transom Height</label><input style={inp} value={d.transomH} onChange={e => ud(d.id, "transomH", e.target.value)} placeholder="12" /></div> : <div />}
                <div><label style={lbl}>Threshold</label><select style={sel} value={d.threshold} onChange={e => ud(d.id, "threshold", e.target.value)}>{DOOR_THRESHOLD.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Screen</label><select style={sel} value={d.doorScreen} onChange={e => ud(d.id, "doorScreen", e.target.value)}>{DOOR_SCREEN.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Door Wrap</label><select style={sel} value={d.doorWrap} onChange={e => ud(d.id, "doorWrap", e.target.value)}>{DOOR_WRAP_SIZES.map(s => <option key={s} value={s}>{s || "-- None --"}</option>)}</select></div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 8 }}>
                {[["jamb", "Jamb Ext"], ["casing", "Casing (both sides)"], ["wrapTrim", "Wrap"]].map(([f, l]) =>
                  <label key={f} style={chk}><input type="checkbox" checked={d[f]} onChange={e => ud(d.id, f, e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />{l}</label>
                )}
                <label style={chk}><input type="checkbox" checked={d.extTrim} onChange={e => ud(d.id, "extTrim", e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />Exterior Trim</label>
              </div>
              {d.extTrim && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginTop: 6 }}>
                <div><label style={lbl}>Ext Trim Size</label><select style={sel} value={d.extTrimSize} onChange={e => ud(d.id, "extTrimSize", e.target.value)}>{EXT_TRIM_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Ext Trim Texture</label><select style={sel} value={d.extTrimTexture} onChange={e => ud(d.id, "extTrimTexture", e.target.value)}>{EXT_TRIM_TEXTURES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                <div />
              </div>}
              {dMats && (d.jamb || d.casing || d.extTrim) && <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 8, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4, fontSize: 12 }}>Door Material Calc ({dMats.width}" x {dMats.height}" x {d.qty})</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {d.jamb && <div><strong>Jamb:</strong> {dMats.jambLF} LF {"|"} {dMats.jambPcs} pcs<br /><span style={{ color: "#666" }}>{dMats.jambDetail}</span></div>}
                  {d.casing && <div><strong>Casing:</strong> {dMats.casingLF} LF {"|"} {dMats.casingPcs} pcs<br /><span style={{ color: "#666" }}>{dMats.casingDetail}</span></div>}
                  {d.extTrim && <div><strong>Ext Trim:</strong> {dMats.extLF} LF{d.extTrimSize ? ` (${d.extTrimSize}${d.extTrimTexture ? ` ${d.extTrimTexture}` : ""})` : ""}<br /><span style={{ color: "#666" }}>{dMats.extDetail}</span>{dMats.sideliteExtra && <><br /><span style={{ color: ORANGE }}>{dMats.sideliteExtra}</span></>}</div>}
                </div>
              </div>}
              <div style={{ marginTop: 8 }}><label style={lbl}>Notes</label><textarea style={{ ...inp, minHeight: 50 }} value={d.notes} onChange={e => ud(d.id, "notes", e.target.value)} placeholder="Size, style, sidelites, transom..." /></div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                {idx > 0 && <button onClick={e => { e.stopPropagation(); moveDoor(d.id, -1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↑</button>}
                {idx < doors.length - 1 && <button onClick={e => { e.stopPropagation(); moveDoor(d.id, 1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↓</button>}
                <button onClick={() => dupDoor(d.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11 }}>Duplicate</button>
                <button onClick={() => rmDoor(d.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11, color: "#ef4444", borderColor: "#ef4444" }}>Remove</button>
              </div>
            </div>}
          </div>
        ); })}
        <button onClick={addDoor} style={{ ...bS, width: "100%", marginTop: 6, padding: "12px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10 }}>+ Add Door</button>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `2px solid ${NAVY}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 50, boxShadow: "0 -2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>QTY: {tQty}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>PCS: {tPcs}</div>
          {doors.length > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#666" }}>DOORS: {doors.length}</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={saveJob} style={{ ...bS, padding: "8px 14px", fontSize: 12, background: saved ? "#ecfdf5" : "#fff", color: saved ? GREEN : NAVY }}>{saved ? "Saved" : "Save"}</button>
          <button onClick={() => setView("print")} style={{ ...bP, padding: "8px 18px", fontSize: 13 }}>Generate Order</button>
        </div>
      </div>
    </div>
  );
}
