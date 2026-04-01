import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#F7941D";
const NAVY = "#003B5C";
const GRAY_BG = "#f4f6f8";
const GRAY_BORDER = "#d1d5db";
const GREEN = "#059669";
const RED = "#ef4444";

const TRIM_BRAND_COLORS = {
  "James Hardie":  "#C0392B",
  "True Wood":     "#6D4C41",
  "LP Smart":      "#1565C0",
  "Syed":          "#6A1B9A",
  "Diamond Coat":  "#00838F",
  "PVC":           "#546E7A",
  "Azek":          "#E64A19",
  "Miratec":       "#2E7D32",
  "Custom":        "#F7941D",
};
const getTrimBrandColor = (brand) => TRIM_BRAND_COLORS[brand] || NAVY;

const FRAME_CONDITIONS = ["Good", "Fair", "Poor", "Replace"];
const ACCESS_TYPES = ["", "Ground Level", "Ladder Required", "Scaffolding", "Interior Only", "Restricted"];
const SHAPE_PRESETS = [
  { code: "HALF-RND",  path: (w,h) => `M0,${h} A${w/2},${h} 0 0,1 ${w},${h} L0,${h} Z` },
  { code: "QTR-RND-L", path: (w,h) => `M0,0 A${w},${h} 0 0,1 ${w},${h} L0,${h} Z` },
  { code: "QTR-RND-R", path: (w,h) => `M${w},0 A${w},${h} 0 0,0 0,${h} L${w},${h} Z` },
  { code: "FULL-RND",  path: (w,h) => { const r=Math.min(w,h)/2; return `M${w/2-r},${h/2} A${r},${r} 0 1,1 ${w/2+r},${h/2} A${r},${r} 0 1,1 ${w/2-r},${h/2} Z`; }},
  { code: "TRIANGLE",  path: (w,h) => `M${w/2},0 L${w},${h} L0,${h} Z` },
  { code: "TRAPEZOID", path: (w,h) => `M${w*0.2},0 L${w*0.8},0 L${w},${h} L0,${h} Z` },
  { code: "ARCH-TOP",  path: (w,h) => `M0,${h} L0,${h*0.4} A${w/2},${h*0.4} 0 0,1 ${w},${h*0.4} L${w},${h} Z` },
  { code: "OCTAGON",   path: (w,h) => { const s=Math.min(w,h), o=s*0.293; return `M${o},0 L${s-o},0 L${s},${o} L${s},${s-o} L${s-o},${s} L${o},${s} L0,${s-o} L0,${o} Z`; }},
  { code: "GOTHIC",    path: (w,h) => `M0,${h} L0,${h*0.35} Q0,0 ${w/2},0 Q${w},0 ${w},${h*0.35} L${w},${h} Z` },
  { code: "EYEBROW",   path: (w,h) => `M0,${h} Q${w/2},0 ${w},${h} Z` },
  { code: "PENTAGON",  path: (w,h) => `M${w/2},0 L${w},${h*0.38} L${w*0.82},${h} L${w*0.18},${h} L0,${h*0.38} Z` },
  { code: "CUSTOM",    path: (w,h) => `M${w*0.15},${h} L0,${h*0.5} L${w*0.25},0 L${w*0.75},0 L${w},${h*0.5} L${w*0.85},${h} Z` },
];

const mkMeasure = (item, idx, prefix, proj = {}) => ({
  key: `${prefix}${idx}`,
  location: item.location || "",
  type: item.type || "",
  qty: item.qty || 1,
  origW: item.netW || "",
  origH: item.netH || "",
  // Quote specs (for field reference)
  glass: item.glass || "",
  glassTexture: item.glassTexture || "Clear",
  gridType: item.gridType || "None",
  gridPattern: item.gridPattern || "",
  litesW: item.litesW || "",
  litesH: item.litesH || "",
  tempered: item.tempered || "No",
  screen: item.screen || "",
  glassConfig: item.glassConfig || "",
  config: item.config || "",
  winLine: item.winLine || "1",
  mullMode: item.mullMode || false,
  mullUnits: item.mullUnits || "[]",
  shapeCode: item.shapeCode || "",
  sashSplit: item.sashSplit || "50",
  hasTransom: item.hasTransom || false,
  transomType: item.transomType || "PIC",
  hasBottomLight: item.hasBottomLight || false,
  bottomLightH: item.bottomLightH || "",
  bottomLightType: item.bottomLightType || "AWN",
  hardwareColor: item.hardwareColor === "Custom" ? (item.hardwareColorCustom || "Custom") : (item.hardwareColor || ""),
  hardwareType: item.hardwareType === "Custom" ? (item.hardwareTypeCustom || "Custom") : (item.hardwareType || ""),
  sidelites: item.sidelites || "None",
  sideliteW: item.sideliteW || "",
  sideliteGlassTexture: item.sideliteGlassTexture || "",
  transom: item.transom || false,
  transomH: item.transomH || "",
  doorShape: item.doorShape || "Square Top",
  // Material specs (per-window override → project default)
  jambSize: item.oJambSize || (proj.jambSize === "Custom" ? proj.jambSizeCustom : proj.jambSize) || "",
  jambSpecies: item.oJambSpecies || proj.jambSpecies || "",
  jambFinish: item.oJambFinish || proj.jambFinish || "",
  jambColor: item.oJambColor || (proj.jambFinish === "Stained" ? proj.jambStainColor : proj.jambColor) || "",
  casingSpecies: item.oCasingSpecies || proj.casingSpecies || "",
  casingFinish: item.oCasingFinish || proj.casingFinish || "",
  casingColor: item.oCasingColor || (proj.casingFinish === "Stained" ? proj.casingStainColor : proj.casingColor) || "",
  hasCasing: !!(item.casing),
  hasJamb: !!(item.jamb),
  hasExtTrim: !!(item.extTrim),
  hasWrap: !!(item.wrapTrim),
  stoolIncluded: !!(item.stools),
  stoolSize: item.oStoolSize || (proj.stoolSize === "Custom" ? proj.stoolSizeCustom : proj.stoolSize) || "",
  stoolColor: proj.stoolColor || "",
  metalRoll: item.metalRoll || "",
  metalColor: item.metalColor || "",
  extTrimSize: item.extTrimSize || "",
  extTrimTexture: item.extTrimTexture || "",
  extTrimBrand: (item.extTrimBrand === "Custom" ? item.extTrimBrandCustom : item.extTrimBrand) || proj.extTrimBrand || "",
  // Field measure fields
  verifiedW: "",
  verifiedH: "",
  roughW: "",
  roughH: "",
  plumb: false,
  plumbDev: "",
  level: false,
  levelDev: "",
  square: false,
  squareDev: "",
  frameCondition: "Good",
  modNeeded: false,
  modNotes: "",
  flashingReq: false,
  intObstruction: "",
  extObstruction: "",
  shimDepth: "",
  photoRef: "",
  installNotes: "",
  materialConfirmed: false,
  verified: false,
  expanded: true,
});

const mkProjMeasure = () => ({
  techName: "",
  techDate: new Date().toISOString().split("T")[0],
  leadPaint: false,
  asbestos: false,
  accessNotes: "",
  colorConfirmed: false,
  colorNotes: "",
  generalNotes: "",
  installSequence: "",
});

function WinIcon({ type, shapeCode, gridType, gridLocation, litesW, litesH, gridPattern, sashSplit, hasTransom, transomH, transomType, hasBottomLight, bottomLightH, bottomLightType }) {
  const w = 48, h = 40;
  const s = { stroke: NAVY, strokeWidth: 1.5, fill: "none" };
  const a = { stroke: ORANGE, strokeWidth: 1.5, fill: "none" };
  const gS = { stroke: `${NAVY}60`, strokeWidth: 0.7 };
  const transomPx = (hasTransom && transomH) ? 12 : 0;
  const bottomPx = (hasBottomLight && bottomLightH) ? 10 : 0;
  const totalH = h + transomPx + bottomPx;
  const splitPct = Math.max(25, Math.min(75, parseInt(sashSplit) || 50));
  const totalSashH = 36;
  const topSashH = Math.round(totalSashH * splitPct / 100);
  const botSashH = totalSashH - topSashH;
  const midY = 2 + topSashH;
  const hasGrid = gridType && gridType !== "None";
  const lW = parseInt(litesW) || 0, lH = parseInt(litesH) || 0;
  const renderGridLines = (x, y, gw, gh, pat) => {
    const lines = [];
    if (!lW && !lH) return lines;
    const p = pat || gridPattern || "Colonial";
    if (p === "Prairie") {
      lines.push(<line key="pv1" x1={x+gw/3} y1={y} x2={x+gw/3} y2={y+gh} {...gS} />);
      lines.push(<line key="pv2" x1={x+gw*2/3} y1={y} x2={x+gw*2/3} y2={y+gh} {...gS} />);
      lines.push(<line key="ph1" x1={x} y1={y+gh/3} x2={x+gw} y2={y+gh/3} {...gS} />);
      lines.push(<line key="ph2" x1={x} y1={y+gh*2/3} x2={x+gw} y2={y+gh*2/3} {...gS} />);
    } else if (p === "Craftsman") {
      const topH = gh * 0.28;
      [1,2,3].forEach(i => lines.push(<line key={`cv${i}`} x1={x+gw*i/4} y1={y} x2={x+gw*i/4} y2={y+topH} {...gS} />));
      lines.push(<line key="ch" x1={x} y1={y+topH} x2={x+gw} y2={y+topH} {...gS} />);
    } else if (p === "Diamond") {
      lines.push(<line key="d1" x1={x} y1={y} x2={x+gw} y2={y+gh} {...gS} />);
      lines.push(<line key="d2" x1={x+gw} y1={y} x2={x} y2={y+gh} {...gS} />);
      if ((lW||2) > 2) {
        lines.push(<line key="d3" x1={x+gw/2} y1={y} x2={x+gw} y2={y+gh/2} {...gS} />);
        lines.push(<line key="d4" x1={x} y1={y+gh/2} x2={x+gw/2} y2={y+gh} {...gS} />);
        lines.push(<line key="d5" x1={x+gw/2} y1={y} x2={x} y2={y+gh/2} {...gS} />);
        lines.push(<line key="d6" x1={x+gw} y1={y+gh/2} x2={x+gw/2} y2={y+gh} {...gS} />);
      }
    } else {
      const cW = lW || 2, cH = lH || 2;
      for (let i = 1; i < cW; i++) lines.push(<line key={`gv${i}`} x1={x+(gw/cW)*i} y1={y} x2={x+(gw/cW)*i} y2={y+gh} {...gS} />);
      for (let i = 1; i < cH; i++) lines.push(<line key={`gh${i}`} x1={x} y1={y+(gh/cH)*i} x2={x+gw} y2={y+(gh/cH)*i} {...gS} />);
    }
    return lines;
  };
  const showUpper = hasGrid && (gridLocation === "Both" || gridLocation === "Upper Sash");
  const showLower = hasGrid && (gridLocation === "Both" || gridLocation === "Lower Sash");
  return (<svg viewBox={`0 ${-transomPx} ${w} ${totalH}`} width={w} height={totalH}>
    <defs><marker id="fwiah" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L6,2.5 L0,5" fill={ORANGE} /></marker></defs>
    {transomPx > 0 && (() => { const tSP = SHAPE_PRESETS.find(sp => sp.code === transomType); return <><rect x="8" y={-transomPx} width="32" height={transomPx - 1} rx="1" stroke={NAVY} strokeWidth="1.5" fill={`${NAVY}10`} />{tSP ? <path d={tSP.path(32, transomPx - 2)} fill={`${NAVY}22`} stroke={NAVY} strokeWidth={0.8} transform={`translate(8,${-transomPx + 1})`} /> : <text x="24" y={-transomPx + 7} fontSize="5" fill={NAVY} textAnchor="middle" fontWeight="700">{transomType || "TRN"}</text>}<text x="24" y={-1} fontSize="4" fill={NAVY} textAnchor="middle">{transomH}"</text></>; })()}
    {bottomPx > 0 && (() => { const bSP = SHAPE_PRESETS.find(sp => sp.code === bottomLightType); return <><rect x="8" y={h + 1} width="32" height={bottomPx - 2} rx="1" stroke={NAVY} strokeWidth="1.5" fill={`${NAVY}10`} />{bSP ? <path d={bSP.path(32, bottomPx - 3)} fill={`${NAVY}22`} stroke={NAVY} strokeWidth={0.8} transform={`translate(8,${h + 1})`} /> : <text x="24" y={h + 1 + (bottomPx - 2) / 2 + 2} fontSize="5" fill={NAVY} textAnchor="middle" fontWeight="700">{bottomLightType || "AWN"}</text>}<text x="24" y={h + bottomPx - 2} fontSize="4" fill={NAVY} textAnchor="middle">{bottomLightH}"</text></>; })()}
    {type === "DH" && <><rect x="8" y="2" width="32" height={topSashH} rx="1" {...s} />{showUpper && renderGridLines(8, 2, 32, topSashH)}<rect x="8" y={midY + 2} width="32" height={botSashH - 2} rx="1" {...s} />{showLower && renderGridLines(8, midY + 2, 32, botSashH - 2)}<line x1="4" y1={midY + botSashH - 4} x2="4" y2="6" {...a} markerEnd="url(#fwiah)" /><line x1="44" y1="12" x2="44" y2={midY + botSashH - 4} {...a} markerEnd="url(#fwiah)" /></>}
    {type === "SH" && <><rect x="8" y="2" width="32" height={topSashH} rx="1" {...s} fill={GRAY_BG} />{showUpper && renderGridLines(8, 2, 32, topSashH)}<rect x="8" y={midY + 2} width="32" height={botSashH - 2} rx="1" {...s} />{showLower && renderGridLines(8, midY + 2, 32, botSashH - 2)}<line x1="4" y1={midY + botSashH - 2} x2="4" y2="12" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "SLD" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} fill={GRAY_BG} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} />{hasGrid && renderGridLines(26, 2, 20, 36)}<line x1="38" y1="20" x2="30" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "CAS-L" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="40" y1="2" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="34" y1="20" x2="12" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "CAS-R" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="8" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="14" y1="20" x2="36" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "DCAS" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="22" y1="2" x2="22" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="26" y1="2" x2="26" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="18" y1="20" x2="6" y2="20" {...a} markerEnd="url(#fwiah)" /><line x1="30" y1="20" x2="42" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "TCAS" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="12" y1="20" x2="4" y2="20" {...a} markerEnd="url(#fwiah)" /><line x1="36" y1="20" x2="44" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "AWN" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="40" y2="2" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="42" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "DSLD" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="8" y1="20" x2="18" y2="20" {...a} markerEnd="url(#fwiah)" /><line x1="40" y1="20" x2="30" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "3SLD" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} fill={GRAY_BG} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="4" y1="20" x2="12" y2="20" {...a} markerEnd="url(#fwiah)" /><line x1="44" y1="20" x2="36" y2="20" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "PIC" && <><rect x="8" y="2" width="32" height="36" rx="2" {...s} fill={`${NAVY}11`} />{hasGrid ? renderGridLines(8, 2, 32, 36) : <><line x1="8" y1="20" x2="40" y2="20" stroke={GRAY_BORDER} strokeWidth="0.5" /><line x1="24" y1="2" x2="24" y2="38" stroke={GRAY_BORDER} strokeWidth="0.5" /></>}</>}
    {type === "SHAPE" && (() => { const sp = SHAPE_PRESETS.find(p => p.code === shapeCode); return sp ? <path d={sp.path(32, 36)} fill={`${NAVY}15`} stroke={NAVY} strokeWidth={1.5} transform="translate(8,2)" /> : <path d="M24,4 L40,16 L36,36 L12,36 L8,16 Z" {...s} fill={`${NAVY}11`} />; })()}
    {type === "BAY" && <><line x1="8" y1="2" x2="8" y2="38" {...s} /><line x1="8" y1="2" x2="18" y2="8" {...s} /><line x1="8" y1="38" x2="18" y2="32" {...s} /><rect x="18" y="8" width="12" height="24" rx="1" {...s} /><line x1="30" y1="8" x2="40" y2="2" {...s} /><line x1="30" y1="32" x2="40" y2="38" {...s} /><line x1="40" y1="2" x2="40" y2="38" {...s} /></>}
    {type === "BOW" && <><path d="M4,20 Q14,4 24,4 Q34,4 44,20 Q34,36 24,36 Q14,36 4,20" {...s} fill={`${NAVY}08`} /><line x1="14" y1="6" x2="14" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="24" y1="4" x2="24" y2="36" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="34" y1="6" x2="34" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /></>}
    {type === "HOP" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} /><line x1="8" y1="38" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="8" x2="24" y2="-2" {...a} markerEnd="url(#fwiah)" /></>}
    {type === "GARDEN" && <><path d="M6,38 L6,10 L14,2 L34,2 L42,10 L42,38 Z" {...s} fill={`${NAVY}08`} /><line x1="6" y1="10" x2="42" y2="10" {...s} /></>}
  </svg>);
}

export default function App() {
  const [jobList, setJobList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [measures, setMeasures] = useState([]);
  const [projMeasure, setProjMeasure] = useState(mkProjMeasure());
  const navigate = useNavigate();
  const [view, setView] = useState("select");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.list("uws-job:");
        if (r?.keys) setJobList(r.keys);
      } catch (e) {}
    })();
  }, []);

  const loadJob = async (k) => {
    try {
      const r = await window.storage.get(k);
      if (r?.value) {
        const d = JSON.parse(r.value);
        setJobData(d);
        setSelectedJob(k);
        // Try to load existing measure data
        try {
          const mr = await window.storage.get(`uws-measure:${k.replace("uws-job:", "")}`);
          if (mr?.value) {
            const md = JSON.parse(mr.value);
            setMeasures(md.measures || []);
            setProjMeasure(p => ({ ...mkProjMeasure(), ...md.projMeasure }));
            setView("form");
            return;
          }
        } catch (e) {}
        // Build fresh measure entries from job data
        const winMs = (d.wins || []).map((w, i) => mkMeasure(w, i + 1, "W", d.proj));
        const doorMs = (d.doors || []).map((dr, i) => mkMeasure(dr, i + 1, "D", d.proj));
        setMeasures([...winMs, ...doorMs]);
        setProjMeasure(mkProjMeasure());
        setView("form");
      }
    } catch (e) { alert("Load failed"); }
  };

  const saveMeasure = async () => {
    if (!selectedJob) return;
    const k = `uws-measure:${selectedJob.replace("uws-job:", "")}`;
    try {
      await window.storage.set(k, JSON.stringify({ measures, projMeasure }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert("Save failed"); }
  };

  const um = (key, field, val) => {
    setMeasures(ms => ms.map(m => m.key === key ? { ...m, [field]: val } : m));
    setSaved(false);
  };
  const up = (f, v) => { setProjMeasure(p => ({ ...p, [f]: v })); setSaved(false); };

  const totalOpenings = measures.length;
  const verifiedCount = measures.filter(m => m.verified).length;
  const allVerified = totalOpenings > 0 && verifiedCount === totalOpenings;

  const inp = { width: "100%", padding: "10px 12px", fontSize: 15, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: "#fff", color: "#1a1a1a", boxSizing: "border-box" };
  const sel = { ...inp, appearance: "auto" };
  const lbl = { fontSize: 11, fontWeight: 600, color: "#4b5563", marginBottom: 3, display: "block", textTransform: "uppercase", letterSpacing: 0.3 };
  const sec = { fontSize: 14, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 6 };
  const bP = { background: ORANGE, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" };
  const bS = { background: "#fff", color: NAVY, border: `2px solid ${NAVY}`, padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };
  const chk = { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", fontSize: 13, color: "#374151" };
  const proj = jobData?.proj || {};

  // ====== PRINT VIEW ======
  if (view === "print") return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div data-noprint style={{ padding: "12px 20px", background: NAVY, display: "flex", gap: 12, alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setView("form")} style={{ ...bS, color: "#fff", borderColor: "#fff", padding: "8px 16px", fontSize: 13 }}>Back</button>
        <button onClick={() => window.print()} style={{ ...bP, padding: "8px 20px", fontSize: 13 }}>Export PDF</button>
      </div>
      <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: `3px solid ${NAVY}`, paddingBottom: 10 }}>
          <div><div style={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: 1 }}>UNITED WINDOWS & SIDING</div><div style={{ fontSize: 15, fontWeight: 700, color: ORANGE, marginTop: 2 }}>FINAL MEASUREMENT VERIFICATION</div></div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#666" }}><div>(319) 259-6464</div><div style={{ fontStyle: "italic" }}>Uniting the community one customer at a time.</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
          <div><strong>Customer:</strong> {proj.customer}</div><div><strong>Address:</strong> {proj.address}</div>
          <div><strong>Measure Tech:</strong> {projMeasure.techName}</div><div><strong>Date:</strong> {projMeasure.techDate}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, fontSize: 11, marginBottom: 12, padding: "8px 10px", background: GRAY_BG, borderRadius: 6 }}>
          <div><strong>Install:</strong> {proj.installType}</div>
          <div><strong>Brand:</strong> {proj.brand} {proj.series}{proj.showBrand2 && proj.brand2 ? ` | L2: ${proj.brand2} ${proj.series2 || ""}` : ""}</div>
          <div><strong>Wall:</strong> {proj.wallThick}</div>
          <div>{projMeasure.leadPaint && <span style={{ color: RED, fontWeight: 700 }}>! LEAD PAINT</span>}{projMeasure.asbestos && <span style={{ color: RED, fontWeight: 700, marginLeft: 8 }}>! ASBESTOS</span>}</div>
          <div><strong>Win Int:</strong> {proj.winIntFinish === "Stained" ? `Stained — ${proj.winIntStainColor || "--"}` : proj.winIntFinish === "Painted" ? `Painted ${proj.winIntColor}` : (proj.winIntFinish || proj.winIntColor)}</div>
          <div><strong>Win Ext:</strong> {proj.winExtColor}</div>
          {proj.showBrand2 && proj.brand2 && <><div><strong>L2 Int:</strong> {proj.winInt2Finish === "Stained" ? `Stained — ${proj.winInt2StainColor || "--"}` : proj.winInt2Finish === "Painted" ? `Painted ${proj.winInt2Color}` : (proj.winInt2Finish || proj.winInt2Color || "—")}</div><div><strong>L2 Ext:</strong> {proj.winExt2Color || "—"}</div></>}
        </div>
        {projMeasure.colorConfirmed && <div style={{ fontSize: 11, marginBottom: 8, padding: "6px 10px", background: `${GREEN}10`, borderRadius: 4, border: `1px solid ${GREEN}30` }}><strong style={{ color: GREEN }}>OK Colors Confirmed</strong>{projMeasure.colorNotes ? `: ${projMeasure.colorNotes}` : ""}</div>}
        {projMeasure.accessNotes && <div style={{ fontSize: 11, marginBottom: 8 }}><strong>Access:</strong> {projMeasure.accessNotes}</div>}
        {projMeasure.installSequence && <div style={{ fontSize: 11, marginBottom: 8 }}><strong>Install Sequence:</strong> {projMeasure.installSequence}</div>}
        {projMeasure.generalNotes && <div style={{ fontSize: 11, marginBottom: 12 }}><strong>General Notes:</strong> {projMeasure.generalNotes}</div>}

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9, marginBottom: 16 }}>
          <thead><tr style={{ background: NAVY, color: "#fff" }}>
            {["#", "Location", "Type", "Orig W", "Orig H", "Verified W", "Verified H", "R.O. W", "R.O. H", "P", "L", "S", "Frame", "Mod", "Flash", "Shim", "Photo", "Notes"].map((h, i) =>
              <th key={i} style={{ padding: "5px 3px", textAlign: "left", fontWeight: 600, fontSize: 8, borderRight: "1px solid #1a5a7a", whiteSpace: "nowrap" }}>{h}</th>
            )}
          </tr></thead>
          <tbody>{measures.map((m, i) => {
            const wMatch = m.verifiedW && m.origW && m.verifiedW === m.origW;
            const hMatch = m.verifiedH && m.origH && m.verifiedH === m.origH;
            return (
              <tr key={m.key} style={{ borderBottom: "1px solid #ddd", background: m.verified ? `${GREEN}08` : i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "4px 3px", fontWeight: 700, color: m.key.startsWith("D") ? ORANGE : NAVY }}>{m.key}</td>
                <td style={{ padding: "4px 3px" }}>{m.location}</td>
                <td style={{ padding: "4px 3px", fontWeight: 600 }}>{m.type}{m.doorShape && m.doorShape !== "Square Top" ? ` (${m.doorShape})` : ""}{m.mullMode ? " [M]" : ""}</td>
                <td style={{ padding: "4px 3px" }}>{m.origW}</td><td style={{ padding: "4px 3px" }}>{m.origH}</td>
                <td style={{ padding: "4px 3px", fontWeight: 700, color: wMatch ? GREEN : m.verifiedW ? RED : "#666" }}>{m.verifiedW || "--"}</td>
                <td style={{ padding: "4px 3px", fontWeight: 700, color: hMatch ? GREEN : m.verifiedH ? RED : "#666" }}>{m.verifiedH || "--"}</td>
                <td style={{ padding: "4px 3px" }}>{m.roughW}</td><td style={{ padding: "4px 3px" }}>{m.roughH}</td>
                <td style={{ padding: "4px 3px", textAlign: "center" }}>{m.plumb ? "OK" : ""}{m.plumbDev ? ` ${m.plumbDev}` : ""}</td>
                <td style={{ padding: "4px 3px", textAlign: "center" }}>{m.level ? "OK" : ""}{m.levelDev ? ` ${m.levelDev}` : ""}</td>
                <td style={{ padding: "4px 3px", textAlign: "center" }}>{m.square ? "OK" : ""}{m.squareDev ? ` ${m.squareDev}` : ""}</td>
                <td style={{ padding: "4px 3px", color: m.frameCondition === "Poor" || m.frameCondition === "Replace" ? RED : "inherit" }}>{m.frameCondition}</td>
                <td style={{ padding: "4px 3px" }}>{m.modNeeded ? `Y: ${m.modNotes}` : ""}</td>
                <td style={{ padding: "4px 3px", textAlign: "center" }}>{m.flashingReq ? "Y" : ""}</td>
                <td style={{ padding: "4px 3px" }}>{m.shimDepth}</td>
                <td style={{ padding: "4px 3px" }}>{m.photoRef}</td>
                <td style={{ padding: "4px 3px", fontSize: 8, maxWidth: 80, overflow: "hidden" }}>{[m.intObstruction ? `Int: ${m.intObstruction}` : "", m.extObstruction ? `Ext: ${m.extObstruction}` : "", m.installNotes, (m.type === "DH" || m.type === "SH") && parseInt(m.sashSplit) !== 50 ? `Sash ${m.sashSplit}/${100-parseInt(m.sashSplit||50)}` : "", m.hasTransom && m.transomH ? `Trnsm: ${m.transomType} ${m.transomH}"` : "", m.hasBottomLight && m.bottomLightH ? `Bot: ${m.bottomLightType} ${m.bottomLightH}"` : ""].filter(Boolean).join(" | ")}</td>
              </tr>
            );
          })}</tbody>
        </table>

        {/* Materials to Order */}
        {(() => {
          const wins = measures.filter(m => m.key.startsWith("W"));
          const drs = measures.filter(m => m.key.startsWith("D"));
          const anyMat = measures.some(m => m.hasJamb || m.hasCasing || m.hasExtTrim || m.stoolIncluded || m.metalRoll || m.hardwareColor);
          if (!anyMat) return null;
          const chip = (label, val, color) => val ? <span key={label} style={{ fontSize: 8, background: `${color}15`, color, padding: "1px 5px", borderRadius: 6, fontWeight: 600, marginRight: 3 }}>{label}: {val}</span> : null;
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 4, marginBottom: 8 }}>MATERIALS TO ORDER</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                <thead><tr style={{ background: GRAY_BG }}>
                  {["#", "Location", "Glass / Grid", "Jamb", "Casing", "Stool", "Ext Trim", "Metal Wrap", "Hardware", "Special"].map((h, i) =>
                    <th key={i} style={{ padding: "4px 3px", textAlign: "left", fontWeight: 700, fontSize: 8, borderBottom: `1px solid ${GRAY_BORDER}`, color: NAVY }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>{measures.map((m, i) => (
                  <tr key={m.key} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={{ padding: "3px 3px", fontWeight: 700, color: m.key.startsWith("D") ? ORANGE : NAVY }}>{m.key}</td>
                    <td style={{ padding: "3px 3px" }}>{m.location}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{[m.glass, m.glassTexture !== "Clear" ? m.glassTexture : "", m.tempered !== "No" ? `Tempered:${m.tempered}` : "", m.gridType !== "None" ? `${m.gridType}${m.gridPattern ? ` ${m.gridPattern}` : ""}${m.litesW && m.litesH ? ` ${m.litesW}×${m.litesH}` : ""}` : ""].filter(Boolean).join(" | ")}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{m.hasJamb ? [m.jambSize, m.jambSpecies, m.jambFinish, m.jambColor].filter(Boolean).join(" ") : "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{m.hasCasing ? [m.casingSpecies, m.casingFinish, m.casingColor].filter(Boolean).join(" ") || "✓" : "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{m.stoolIncluded ? `${m.stoolSize}${m.stoolColor ? ` ${m.stoolColor}` : ""}` : "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{m.hasExtTrim ? (() => { const parts = [m.extTrimSize, m.extTrimTexture].filter(Boolean).join(" "); return <><span style={{ color: getTrimBrandColor(m.extTrimBrand), fontWeight: 700 }}>{m.extTrimBrand || ""}</span>{parts ? ` ${parts}` : !m.extTrimBrand ? "✓" : ""}</>; })() : "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{m.metalRoll ? `${m.metalRoll.replace("Roll - ", "")} ${m.metalColor || ""}`.trim() : "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{[m.hardwareColor, m.hardwareType].filter(Boolean).join(" / ") || "--"}</td>
                    <td style={{ padding: "3px 3px", fontSize: 8 }}>{[m.doorShape && m.doorShape !== "Square Top" ? m.doorShape : "", m.sidelites && m.sidelites !== "None" ? `SL:${m.sidelites} ${m.sideliteW}"` : "", m.transom ? `Transom ${m.transomH}"` : "", m.hasTransom && m.transomH ? `Win Trnsm: ${m.transomType} ${m.transomH}"` : "", (m.type === "DH" || m.type === "SH") && parseInt(m.sashSplit) !== 50 ? `Sash ${m.sashSplit}/${100-parseInt(m.sashSplit||50)}` : "", m.hasBottomLight && m.bottomLightH ? `Bot: ${m.bottomLightType} ${m.bottomLightH}"` : ""].filter(Boolean).join(" | ") || ""}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          );
        })()}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 30, fontSize: 11 }}>
          <div><div style={{ borderTop: `1px solid ${NAVY}`, paddingTop: 6, marginTop: 30 }}><strong>Measure Tech Signature</strong><br />{projMeasure.techName} {"--"} {projMeasure.techDate}</div></div>
          <div><div style={{ borderTop: `1px solid ${NAVY}`, paddingTop: 6, marginTop: 30 }}><strong>Customer Confirmation</strong><br />Colors and scope verified</div></div>
        </div>
      </div>
      <style>{"@media print{[data-noprint]{display:none!important;}body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}tr{page-break-inside:avoid;}}"}</style>
    </div>
  );

  // ====== JOB SELECT ======
  if (view === "select") return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: GRAY_BG, minHeight: "100vh" }}>
      <div style={{ background: NAVY, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>UWS <span style={{ color: ORANGE }}>FINAL MEASURE</span></div>
        <button onClick={() => navigate("/")} style={{ background: "none", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.35)", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>← Quote Sheet</button>
      </div>
      <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>
        <div style={sec}>Select Job to Measure</div>
        {jobList.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#999" }}>No saved jobs found. Create a quote first.</div> :
          jobList.map(k => (
            <div key={k} onClick={() => loadJob(k)} style={{ background: "#fff", padding: "14px 16px", marginBottom: 6, borderRadius: 8, cursor: "pointer", border: `1px solid ${GRAY_BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{k.replace("uws-job:", "")}</div></div>
              <span style={{ color: ORANGE, fontWeight: 700 }}>{">>"}  </span>
            </div>
          ))
        }
      </div>
    </div>
  );

  // ====== FORM VIEW ======
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: GRAY_BG, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ background: NAVY, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>UWS</div>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ fontSize: 12, color: ORANGE, fontWeight: 600 }}>FINAL MEASURE</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: allVerified ? GREEN : "#fff", fontWeight: 700, marginRight: 8 }}>{verifiedCount}/{totalOpenings} Verified</div>
          <button onClick={() => navigate("/")} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>← Sheet</button>
          <button onClick={() => setView("select")} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>Jobs</button>
        </div>
      </div>
      <div style={{ padding: "14px 12px", maxWidth: 900, margin: "0 auto" }}>
        {/* Project Header */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={sec}>Job: {proj.customer} {"--"} {proj.address}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 6 }}>
            <div><strong>Install:</strong> {proj.installType}</div>
            <div><strong>Brand:</strong> {proj.brand} {proj.series}{proj.showBrand2 && proj.brand2 ? ` | L2: ${proj.brand2} ${proj.series2 || ""}` : ""}</div>
            <div><strong>Wall:</strong> {proj.wallThick}</div>
            <div><strong>Win Int:</strong> {proj.winIntFinish === "Stained" ? `Stained — ${proj.winIntStainColor || "--"}` : proj.winIntFinish === "Painted" ? `Painted ${proj.winIntColor}` : (proj.winIntFinish || proj.winIntColor)} / <strong>Ext:</strong> {proj.winExtColor}</div>
            {proj.showBrand2 && proj.brand2 && <div><strong>L2 Int:</strong> {proj.winInt2Finish === "Stained" ? `Stained — ${proj.winInt2StainColor || "--"}` : proj.winInt2Finish === "Painted" ? `Painted ${proj.winInt2Color}` : (proj.winInt2Finish || proj.winInt2Color || "—")} / <strong>Ext:</strong> {proj.winExt2Color || "—"}</div>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>Measure Tech</label><input style={inp} value={projMeasure.techName} onChange={e => up("techName", e.target.value)} placeholder="Tech name" /></div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={projMeasure.techDate} onChange={e => up("techDate", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 8 }}>
            <label style={{ ...chk, color: projMeasure.leadPaint ? RED : "#374151" }}><input type="checkbox" checked={projMeasure.leadPaint} onChange={e => up("leadPaint", e.target.checked)} style={{ width: 20, height: 20, accentColor: RED }} />! Lead Paint (Pre-1978)</label>
            <label style={{ ...chk, color: projMeasure.asbestos ? RED : "#374151" }}><input type="checkbox" checked={projMeasure.asbestos} onChange={e => up("asbestos", e.target.checked)} style={{ width: 20, height: 20, accentColor: RED }} />! Asbestos Concern</label>
            <label style={{ ...chk, color: projMeasure.colorConfirmed ? GREEN : "#374151" }}><input type="checkbox" checked={projMeasure.colorConfirmed} onChange={e => up("colorConfirmed", e.target.checked)} style={{ width: 20, height: 20, accentColor: GREEN }} />OK Colors Confirmed</label>
          </div>
          {projMeasure.colorConfirmed && <div style={{ marginTop: 6 }}><label style={lbl}>Color Notes</label><input style={inp} value={projMeasure.colorNotes} onChange={e => up("colorNotes", e.target.value)} placeholder="Any color discrepancies or changes..." /></div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div><label style={lbl}>Access Notes</label><input style={inp} value={projMeasure.accessNotes} onChange={e => up("accessNotes", e.target.value)} placeholder="Ladder, scaffolding, restricted areas..." /></div>
            <div><label style={lbl}>Install Sequence</label><input style={inp} value={projMeasure.installSequence} onChange={e => up("installSequence", e.target.value)} placeholder="Start upstairs, work clockwise..." /></div>
          </div>
          <div style={{ marginTop: 8 }}><label style={lbl}>General Notes</label><textarea style={{ ...inp, minHeight: 50 }} value={projMeasure.generalNotes} onChange={e => up("generalNotes", e.target.value)} placeholder="Overall job notes, concerns, special instructions..." /></div>
        </div>

        {/* Opening Cards */}
        <div style={{ ...sec, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Openings ({totalOpenings})</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setMeasures(ms => ms.map(m => ({ ...m, expanded: true })))} style={{ fontSize: 11, fontWeight: 600, color: NAVY, background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Expand All</button>
            <button onClick={() => setMeasures(ms => ms.map(m => ({ ...m, expanded: false })))} style={{ fontSize: 11, fontWeight: 600, color: NAVY, background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Collapse All</button>
          </div>
        </div>
        {measures.map((m, idx) => {
          const isWin = m.key.startsWith("W");
          const wMatch = m.verifiedW && m.origW && m.verifiedW === m.origW;
          const hMatch = m.verifiedH && m.origH && m.verifiedH === m.origH;
          const dimMismatch = (m.verifiedW && m.origW && m.verifiedW !== m.origW) || (m.verifiedH && m.origH && m.verifiedH !== m.origH);
          return (
            <div key={m.key} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: m.verified ? `2px solid ${GREEN}40` : dimMismatch ? `2px solid ${RED}40` : `2px solid transparent` }}>
              <div onClick={() => um(m.key, "expanded", !m.expanded)} style={{ padding: "10px 12px", background: m.verified ? `${GREEN}08` : "transparent", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isWin ? NAVY : ORANGE, width: 28, textAlign: "center" }}>{m.key}</div>
                  {isWin && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <WinIcon type={m.type} shapeCode={m.shapeCode} gridType={m.gridType} gridLocation={m.gridLocation} litesW={m.litesW} litesH={m.litesH} gridPattern={m.gridPattern} sashSplit={m.sashSplit} hasTransom={m.hasTransom} transomH={m.transomH} transomType={m.transomType} hasBottomLight={m.hasBottomLight} bottomLightH={m.bottomLightH} bottomLightType={m.bottomLightType} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{m.location || "--"}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{m.type}{m.qty > 1 ? ` ×${m.qty}` : ""} | Quote: {m.origW} × {m.origH}{m.glassConfig ? ` | ${m.glassConfig}` : ""}{m.sidelites && m.sidelites !== "None" ? ` | SL:${m.sidelites}` : ""}{m.transom ? " | Transom" : ""}</div>
                  </div>
                  {m.verified && <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, background: `${GREEN}15`, padding: "3px 10px", borderRadius: 12 }}>✓ Verified</div>}
                  {dimMismatch && <div style={{ fontSize: 11, fontWeight: 700, color: RED, background: `${RED}15`, padding: "3px 10px", borderRadius: 12 }}>! Mismatch</div>}
                  <span style={{ fontSize: 13, color: NAVY, marginLeft: 2 }}>{m.expanded ? "∨" : "›"}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5, paddingLeft: 36 }}>
                  {m.glass && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>{m.glass}</span>}
                  {m.glassTexture && m.glassTexture !== "Clear" && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>{m.glassTexture}</span>}
                  {m.gridType && m.gridType !== "None" && <span style={{ fontSize: 9, background: `${ORANGE}18`, color: ORANGE, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>{m.gridType}{m.gridPattern ? ` ${m.gridPattern}` : ""}{m.litesW && m.litesH ? ` ${m.litesW}×${m.litesH}` : ""}</span>}
                  {m.tempered && m.tempered !== "No" && <span style={{ fontSize: 9, background: `${RED}18`, color: "#b91c1c", padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>TEMPERED: {m.tempered}</span>}
                  {m.hasJamb && m.jambSize && <span style={{ fontSize: 9, background: `${GREEN}15`, color: GREEN, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>JAMB {m.jambSize}{m.jambSpecies ? ` ${m.jambSpecies}` : ""}</span>}
                  {m.hasCasing && <span style={{ fontSize: 9, background: `${GREEN}15`, color: GREEN, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>CSG{m.casingSpecies ? ` ${m.casingSpecies}` : ""}</span>}
                  {m.stoolIncluded && <span style={{ fontSize: 9, background: `${ORANGE}18`, color: ORANGE, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>STOOL {m.stoolSize}</span>}
                  {m.hasExtTrim && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>EXT {m.extTrimSize}</span>}
                  {m.metalRoll && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>METAL {m.metalColor}</span>}
                  {m.hardwareColor && <span style={{ fontSize: 9, background: `${ORANGE}18`, color: ORANGE, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>HW: {m.hardwareColor}</span>}
                  {m.doorShape && m.doorShape !== "Square Top" && <span style={{ fontSize: 9, background: `${RED}18`, color: "#b91c1c", padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>SHAPE: {m.doorShape}</span>}
                  {m.mullMode && <span style={{ fontSize: 9, background: `${ORANGE}18`, color: ORANGE, padding: "2px 6px", borderRadius: 8, fontWeight: 700 }}>MULLED</span>}
                  {isWin && (m.type === "DH" || m.type === "SH") && parseInt(m.sashSplit) !== 50 && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>SASH {m.sashSplit}/{100-parseInt(m.sashSplit||50)}</span>}
                  {isWin && m.hasTransom && m.transomH && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>TRANSOM: {m.transomType} {m.transomH}"</span>}
                  {isWin && m.hasBottomLight && m.bottomLightH && <span style={{ fontSize: 9, background: `${ORANGE}18`, color: ORANGE, padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>BOT: {m.bottomLightType} {m.bottomLightH}"</span>}
                </div>
              </div>
              {m.expanded && <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${GRAY_BORDER}` }}>
                {/* Dimensions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  <div><label style={lbl}>Verified Width</label><input style={{ ...inp, borderColor: m.verifiedW ? (wMatch ? GREEN : RED) : GRAY_BORDER, borderWidth: m.verifiedW ? 2 : 1 }} value={m.verifiedW} onChange={e => um(m.key, "verifiedW", e.target.value)} placeholder={m.origW || "W"} /></div>
                  <div><label style={lbl}>Verified Height</label><input style={{ ...inp, borderColor: m.verifiedH ? (hMatch ? GREEN : RED) : GRAY_BORDER, borderWidth: m.verifiedH ? 2 : 1 }} value={m.verifiedH} onChange={e => um(m.key, "verifiedH", e.target.value)} placeholder={m.origH || "H"} /></div>
                  <div><label style={lbl}>Rough Opening W</label><input style={inp} value={m.roughW} onChange={e => um(m.key, "roughW", e.target.value)} placeholder="R.O." /></div>
                  <div><label style={lbl}>Rough Opening H</label><input style={inp} value={m.roughH} onChange={e => um(m.key, "roughH", e.target.value)} placeholder="R.O." /></div>
                </div>
                {/* Checks */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "end" }}>
                    <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={m.plumb} onChange={e => um(m.key, "plumb", e.target.checked)} style={{ width: 18, height: 18, accentColor: GREEN }} />Plumb</label>
                    {!m.plumb && <div style={{ flex: 1 }}><label style={lbl}>Dev</label><input style={{ ...inp, padding: "8px 6px", fontSize: 12 }} value={m.plumbDev} onChange={e => um(m.key, "plumbDev", e.target.value)} placeholder='1/8"' /></div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "end" }}>
                    <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={m.level} onChange={e => um(m.key, "level", e.target.checked)} style={{ width: 18, height: 18, accentColor: GREEN }} />Level</label>
                    {!m.level && <div style={{ flex: 1 }}><label style={lbl}>Dev</label><input style={{ ...inp, padding: "8px 6px", fontSize: 12 }} value={m.levelDev} onChange={e => um(m.key, "levelDev", e.target.value)} placeholder='1/8"' /></div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "end" }}>
                    <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={m.square} onChange={e => um(m.key, "square", e.target.checked)} style={{ width: 18, height: 18, accentColor: GREEN }} />Square</label>
                    {!m.square && <div style={{ flex: 1 }}><label style={lbl}>Dev</label><input style={{ ...inp, padding: "8px 6px", fontSize: 12 }} value={m.squareDev} onChange={e => um(m.key, "squareDev", e.target.value)} placeholder='1/4"' /></div>}
                  </div>
                  <div><label style={lbl}>Shim Depth</label><input style={inp} value={m.shimDepth} onChange={e => um(m.key, "shimDepth", e.target.value)} placeholder='3/4"' /></div>
                </div>
                {/* Condition & flags */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                  <div><label style={lbl}>Frame Condition</label><select style={{ ...sel, color: m.frameCondition === "Poor" || m.frameCondition === "Replace" ? RED : "inherit" }} value={m.frameCondition} onChange={e => um(m.key, "frameCondition", e.target.value)}>{FRAME_CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div style={{ display: "flex", gap: 6, alignItems: "end" }}>
                    <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={m.modNeeded} onChange={e => um(m.key, "modNeeded", e.target.checked)} style={{ width: 18, height: 18, accentColor: ORANGE }} />Mod Req</label>
                    {m.modNeeded && <div style={{ flex: 1 }}><input style={{ ...inp, padding: "8px 6px", fontSize: 12 }} value={m.modNotes} onChange={e => um(m.key, "modNotes", e.target.value)} placeholder="What?" /></div>}
                  </div>
                  <div><label style={{ ...chk }}><input type="checkbox" checked={m.flashingReq} onChange={e => um(m.key, "flashingReq", e.target.checked)} style={{ width: 18, height: 18, accentColor: ORANGE }} />Flashing Required</label></div>
                  <div><label style={lbl}>Photo Ref #</label><input style={inp} value={m.photoRef} onChange={e => um(m.key, "photoRef", e.target.value)} placeholder="P1, P2..." /></div>
                </div>
                {/* Obstructions & notes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <div><label style={lbl}>Interior Obstructions</label><input style={inp} value={m.intObstruction} onChange={e => um(m.key, "intObstruction", e.target.value)} placeholder="Blinds, countertop, radiator..." /></div>
                  <div><label style={lbl}>Exterior Obstructions</label><input style={inp} value={m.extObstruction} onChange={e => um(m.key, "extObstruction", e.target.value)} placeholder="Shutters, utilities, bushes..." /></div>
                </div>
                <div style={{ marginTop: 8 }}><label style={lbl}>Install Notes</label><input style={inp} value={m.installNotes} onChange={e => um(m.key, "installNotes", e.target.value)} placeholder="Special install instructions for this opening..." /></div>
                {/* Verify controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <label style={{ ...chk, fontSize: 12, color: m.materialConfirmed ? GREEN : "#374151" }}>
                    <input type="checkbox" checked={m.materialConfirmed} onChange={e => um(m.key, "materialConfirmed", e.target.checked)} style={{ width: 18, height: 18, accentColor: GREEN }} />
                    Materials confirmed on-site
                  </label>
                  <button onClick={() => um(m.key, "verified", !m.verified)}
                    style={{ ...m.verified ? { ...bS, color: GREEN, borderColor: GREEN, background: `${GREEN}10` } : bP, padding: "8px 20px", fontSize: 13 }}>
                    {m.verified ? "✓ Verified" : "Mark Verified"}
                  </button>
                </div>
              </div>}
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `2px solid ${NAVY}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 50, boxShadow: "0 -2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: allVerified ? GREEN : NAVY }}>{verifiedCount}/{totalOpenings} Verified</div>
          <div style={{ fontSize: 12, color: "#666" }}>{measures.filter(m => m.materialConfirmed).length}/{totalOpenings} Materials OK</div>
          {allVerified && <div style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>✓ ALL OPENINGS VERIFIED</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={saveMeasure} style={{ ...bS, padding: "8px 14px", fontSize: 12, background: saved ? "#ecfdf5" : "#fff", color: saved ? GREEN : NAVY }}>{saved ? "Saved" : "Save"}</button>
          <button onClick={() => setView("print")} style={{ ...bP, padding: "8px 18px", fontSize: 13 }}>Generate Report</button>
        </div>
      </div>
    </div>
  );
}
