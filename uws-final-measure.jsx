import { useState, useEffect, useRef } from "react";

const ORANGE = "#F7941D";
const NAVY = "#003B5C";
const GRAY_BG = "#f4f6f8";
const GRAY_BORDER = "#d1d5db";
const GREEN = "#059669";
const RED = "#ef4444";

const FRAME_CONDITIONS = ["Good", "Fair", "Poor", "Replace"];
const ACCESS_TYPES = ["", "Ground Level", "Ladder Required", "Scaffolding", "Interior Only", "Restricted"];

const mkMeasure = (item, idx, prefix) => ({
  key: `${prefix}${idx}`,
  location: item.location || "",
  type: item.type || "",
  origW: item.netW || "",
  origH: item.netH || "",
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
  verified: false,
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

export default function App() {
  const [jobList, setJobList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [measures, setMeasures] = useState([]);
  const [projMeasure, setProjMeasure] = useState(mkProjMeasure());
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
        const winMs = (d.wins || []).map((w, i) => mkMeasure(w, i + 1, "W"));
        const doorMs = (d.doors || []).map((dr, i) => mkMeasure(dr, i + 1, "D"));
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
          <div><strong>Install:</strong> {proj.installType}</div><div><strong>Brand:</strong> {proj.brand} {proj.series}</div><div><strong>Wall:</strong> {proj.wallThick}</div>
          <div>{projMeasure.leadPaint && <span style={{ color: RED, fontWeight: 700 }}>! LEAD PAINT</span>}{projMeasure.asbestos && <span style={{ color: RED, fontWeight: 700, marginLeft: 8 }}>! ASBESTOS</span>}</div>
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
                <td style={{ padding: "4px 3px", fontWeight: 600 }}>{m.type}</td>
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
                <td style={{ padding: "4px 3px", fontSize: 8, maxWidth: 80, overflow: "hidden" }}>{[m.intObstruction ? `Int: ${m.intObstruction}` : "", m.extObstruction ? `Ext: ${m.extObstruction}` : "", m.installNotes].filter(Boolean).join(" | ")}</td>
              </tr>
            );
          })}</tbody>
        </table>
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
      <div style={{ background: NAVY, padding: "16px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>UWS <span style={{ color: ORANGE }}>FINAL MEASURE</span></div>
      </div>
      <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>
        <div style={sec}>Select Job to Measure</div>
        {jobList.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#999" }}>No saved jobs found. Create a quote first.</div> :
          jobList.map(k => (
            <div key={k} onClick={() => loadJob(k)} style={{ background: "#fff", padding: "14px 16px", marginBottom: 6, borderRadius: 8, cursor: "pointer", border: `1px solid ${GRAY_BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{k.replace("uws-job:", "")}</div></div>
              <span style={{ color: ORANGE, fontWeight: 700 }}>>></span>
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
          <button onClick={() => setView("select")} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>Jobs</button>
        </div>
      </div>
      <div style={{ padding: "14px 12px", maxWidth: 900, margin: "0 auto" }}>
        {/* Project Header */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={sec}>Job: {proj.customer} {"--"} {proj.address}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 6 }}>
            <div><strong>Install:</strong> {proj.installType}</div>
            <div><strong>Brand:</strong> {proj.brand} {proj.series}</div>
            <div><strong>Wall:</strong> {proj.wallThick}</div>
            <div><strong>Colors:</strong> Int {proj.winIntColor} / Ext {proj.winExtColor}</div>
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
        <div style={sec}>Openings ({totalOpenings})</div>
        {measures.map((m, idx) => {
          const isWin = m.key.startsWith("W");
          const wMatch = m.verifiedW && m.origW && m.verifiedW === m.origW;
          const hMatch = m.verifiedH && m.origH && m.verifiedH === m.origH;
          const dimMismatch = (m.verifiedW && m.origW && m.verifiedW !== m.origW) || (m.verifiedH && m.origH && m.verifiedH !== m.origH);
          return (
            <div key={m.key} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: m.verified ? `2px solid ${GREEN}40` : dimMismatch ? `2px solid ${RED}40` : `2px solid transparent` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: m.verified ? `${GREEN}08` : "transparent" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: isWin ? NAVY : ORANGE, width: 28, textAlign: "center" }}>{m.key}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{m.location || "--"}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>{m.type} {"|"} Quote: {m.origW} {"x"} {m.origH}</div>
                </div>
                {m.verified && <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, background: `${GREEN}15`, padding: "3px 10px", borderRadius: 12 }}>OK Verified</div>}
                {dimMismatch && <div style={{ fontSize: 11, fontWeight: 700, color: RED, background: `${RED}15`, padding: "3px 10px", borderRadius: 12 }}>! Size Mismatch</div>}
              </div>
              <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${GRAY_BORDER}` }}>
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
                {/* Verify button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button onClick={() => um(m.key, "verified", !m.verified)}
                    style={{ ...m.verified ? { ...bS, color: GREEN, borderColor: GREEN, background: `${GREEN}10` } : bP, padding: "8px 20px", fontSize: 13 }}>
                    {m.verified ? "Verified" : "Mark Verified"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `2px solid ${NAVY}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 50, boxShadow: "0 -2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: allVerified ? GREEN : NAVY }}>{verifiedCount}/{totalOpenings} Verified</div>
          {allVerified && <div style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>OK ALL OPENINGS VERIFIED</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={saveMeasure} style={{ ...bS, padding: "8px 14px", fontSize: 12, background: saved ? "#ecfdf5" : "#fff", color: saved ? GREEN : NAVY }}>{saved ? "Saved" : "Save"}</button>
          <button onClick={() => setView("print")} style={{ ...bP, padding: "8px 18px", fontSize: 13 }}>Generate Report</button>
        </div>
      </div>
    </div>
  );
}
