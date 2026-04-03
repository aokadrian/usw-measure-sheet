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
  { code: "SLD", name: "Single Slider", pcs: 2 },
  { code: "CAS-L", name: "Casement LH", pcs: 1 },
  { code: "CAS-R", name: "Casement RH", pcs: 1 },
  { code: "DCAS", name: "Double Casement", pcs: 2 },
  { code: "TCAS", name: "Triple Casement", pcs: 3 },
  { code: "AWN", name: "Awning", pcs: 1 },
  { code: "DSLD", name: "Double Slider", pcs: 2 },
  { code: "3SLD", name: "Three-Lite Slider", pcs: 3 },
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
// Brand-specific glass package names
const BRAND_GLASS_OPTIONS = {
  "Midway by Alliance": ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Laminated","Custom"],
  "Simonton":           ["SimShield LoE2 Ar","SimShield LoE Ar","TP LoE2 Ar","DP Clear","StormBreaker Lam","Custom"],
  "Marvin":             ["LowE2 Argon","LowE3 Argon","TriPane LowE3","Clear Argon","Laminated","Custom"],
  "Andersen":           ["HPG LoE2 Ar","HeatLock LoE3 Ar","TP LoE3 Ar","Sun LoE","SmartSun LoE3","Clear Ar","Custom"],
  "Pella":              ["Designer Series LoE2","Impervia LoE3 Ar","Lifestyle LoE3 Ar","Triple LoE3 Ar","Clear Ar","Custom"],
  "ProVia":             ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Alside":             ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Windsor":            ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Kolbe":              ["LowE2 Argon","LowE3 Argon","TriPane LowE3","Clear Argon","Laminated","Custom"],
  "MI Windows":         ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Sunrise":            ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Custom":             ["DP LoE2 Ar","DP LoE Ar","TP LoE2 Ar","DP Clear","Laminated","Custom"],
};
function getBrandGlassOptions(brand) { return BRAND_GLASS_OPTIONS[brand] || GLASS_OPTIONS; }
// Series-specific glass overrides (brand+series key). Falls back to brand-level, then generic.
const SERIES_GLASS_OPTIONS = {
  "Simonton|StormBreaker Plus":       ["StormBreaker DP Lam","StormBreaker TP Lam","StormBreaker DP LoE2 Ar","StormBreaker DP Clear","Custom"],
  "Simonton|Reflections 5500":        ["SimShield LoE2 Ar","SimShield LoE3 Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Simonton|Reflections 5050":        ["SimShield LoE2 Ar","SimShield LoE Ar","TP LoE2 Ar","DP Clear","Custom"],
  "Andersen|100 Series":              ["HP LoE2 Ar","HP LoE3 Ar","HP DP Clear Ar","Custom"],
  "Andersen|200 Series (Narroline)":  ["HPG LoE2 Ar","HPG LoE3 Ar","DP Clear Ar","Custom"],
  "Andersen|400 Series":              ["HPG LoE2 Ar","HPG LoE3 Ar","TP LoE3 Ar","Clear Ar","Custom"],
  "Andersen|A-Series":                ["HPG LowE2 Ar","HPG LowE3 Ar","TP LowE3 Ar","SmartSun LowE3 Ar","Laminated","Custom"],
  "Andersen|E-Series":                ["HPG LowE2 Ar","HPG LowE3 Ar","TP LowE3 Ar","Laminated","Custom"],
  "Pella|Impervia":                   ["Impervia LoE3 Ar","Impervia TP LoE3 Ar","Clear Ar","Custom"],
  "Pella|Architect Series":           ["Designer Series LoE2","Designer LoE3 Ar","TP LoE3 Ar","Laminated","Custom"],
  "Pella|Lifestyle Series":           ["Lifestyle LoE3 Ar","Lifestyle TP LoE3 Ar","DP Clear Ar","Custom"],
  "Marvin|Signature":                 ["Ultimate LoE2 Ar","Ultimate LoE3 Ar","Triple LoE3","Laminated","Custom"],
  "Marvin|Elevate":                   ["LowE2 Argon","LowE3 Argon","TriPane LowE3","Custom"],
  "Kolbe|VistaLuxe":                  ["LowE2 Argon","LowE3 Argon","TriPane LowE3","Laminated","Custom"],
  "Alside|Preservation":              ["DP LoE2 Ar","TP LoE2 Ar","DP Clear","Laminated","Custom"],
  "Windsor|Traditions":               ["DP LoE2 Ar","DP LoE3 Ar","TP LoE2 Ar","DP Clear","Laminated","Custom"],
};
function getGlassOptions(brand, series) {
  return SERIES_GLASS_OPTIONS[`${brand}|${series}`] || BRAND_GLASS_OPTIONS[brand] || GLASS_OPTIONS;
}
// Series-specific hardware color overrides
const SERIES_HARDWARE_COLORS = {
  "Andersen|A-Series":          ["","White","Stone","Silver","Bronze","Matte Black","Polished Nickel","Custom"],
  "Andersen|E-Series":          ["","White","Stone","Silver","Bronze","Matte Black","Antique Brass","Custom"],
  "Marvin|Signature":           ["","Silver","Bronze","Black","Ebony","Brushed Nickel","Polished Nickel","Custom"],
  "Pella|Architect Series":     ["","White","Almond","Bronze","Matte Black","Brushed Nickel","Satin Nickel","Custom"],
  "Pella|Lifestyle Series":     ["","White","Almond","Bronze","Matte Black","Brushed Nickel","Custom"],
  "Kolbe|VistaLuxe":            ["","Silver","Bronze","Black","Champagne","Warm Silver","Custom"],
  "Kolbe|Ultra Series":         ["","Silver","Bronze","Black","Champagne","Custom"],
  "Windsor|Traditions":         ["","White","Almond","Bronze","Black","Oil-Rubbed Bronze","Custom"],
  "Alside|Preservation":        ["","White","Almond","Bronze","Black","Champagne","Custom"],
};
function getHardwareColors(brand, series) {
  return SERIES_HARDWARE_COLORS[`${brand}|${series}`] || BRAND_WIN_HARDWARE_COLORS[brand] || ["","Custom"];
}
// Brand-specific window hardware color options
const BRAND_WIN_HARDWARE_COLORS = {
  "Midway by Alliance": ["","White","Almond","Beige","Bronze","Black","Custom"],
  "Simonton":           ["","White","Almond","Bronze","Black","Custom"],
  "Marvin":             ["","Silver","Bronze","Black","Ebony","Custom"],
  "Andersen":           ["","White","Stone","Dover Gray","Sandtone","Black","Custom"],
  "Pella":              ["","White","Almond","Bronze","Matte Black","Brushed Nickel","Custom"],
  "ProVia":             ["","White","Almond","Bronze","Black","Custom"],
  "Alside":             ["","White","Almond","Bronze","Black","Custom"],
  "Windsor":            ["","White","Almond","Bronze","Black","Custom"],
  "Kolbe":              ["","Silver","Bronze","Black","Champagne","Custom"],
  "MI Windows":         ["","White","Almond","Bronze","Black","Custom"],
  "Sunrise":            ["","White","Almond","Bronze","Black","Custom"],
  "Custom":             ["","White","Almond","Bronze","Black","Custom"],
};
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
const JAMB_SIZES = ["5/8x4", "5/8x6", "5/8x8", "1x4", "1x6", "Custom"];
const STOOL_SIZES = ["3/4x4", "3/4x6", "1x4", "1x6", "Custom"];
const HARDWARE_COLORS = ["", "Satin Nickel", "Brushed Nickel", "Oil-Rubbed Bronze", "Matte Black", "Polished Brass", "Antique Brass", "Chrome", "Aged Bronze", "Custom"];
// Door brand-specific hardware finish options
const DOOR_BRAND_HARDWARE = {
  "Therma-Tru":         ["", "Satin Nickel", "Aged Bronze", "Matte Black", "Oil-Rubbed Bronze", "Bright Brass", "Venetian Bronze", "Custom"],
  "ProVia":             ["", "Satin Nickel", "Antique Brass", "Oil-Rubbed Bronze", "Matte Black", "Venetian Bronze", "Rustic Iron", "Custom"],
  "Pella":              ["", "Satin Nickel", "Brushed Nickel", "Matte Black", "Oil-Rubbed Bronze", "Antique Brass", "Custom"],
  "Andersen":           ["", "Satin Nickel", "Brushed Nickel", "Matte Black", "Oil-Rubbed Bronze", "Antique Brass", "Custom"],
  "Masonite":           ["", "Satin Nickel", "Aged Bronze", "Matte Black", "Polished Brass", "Antique Brass", "Custom"],
  "JELD-WEN":           ["", "Satin Nickel", "Brushed Nickel", "Matte Black", "Oil-Rubbed Bronze", "Venetian Bronze", "Custom"],
  "Midway by Alliance": ["", "Satin Nickel", "Brushed Nickel", "Oil-Rubbed Bronze", "Matte Black", "Custom"],
};
function getDoorHardwareColors(brand) {
  return DOOR_BRAND_HARDWARE[brand] || HARDWARE_COLORS;
}
const HARDWARE_TYPES = ["", "Entry Handleset", "Lever Handle", "Knob Set", "Deadbolt Only", "Handleset + Deadbolt", "Sliding Handle (Mortise)", "Flush Pull / Bar Pull", "Push Bar / Panic", "Kick Plate", "Custom"];
const DOOR_SHAPES = ["Square Top", "Arch Top", "Round Top", "Gothic Arch", "Custom"];
const BRANDS = ["Midway by Alliance", "Simonton", "Marvin", "Andersen", "Pella", "ProVia", "Alside", "Windsor", "Kolbe", "MI Windows", "Sunrise", "Custom"];
const BRAND_SERIES = {
  "Midway by Alliance": ["Windgate", "Belmont", "Hawthorne", "Custom"],
  "Simonton":    ["StormBreaker Plus", "Reflections 5500", "Reflections 5050", "Pro-Finish Builder", "Pro-Finish Contractor", "Impressions 9800", "Custom"],
  "Marvin":      ["Elevate", "Essential", "Signature", "Infinity (Fiberglass)", "Clad-Wood", "Custom"],
  "Andersen":    ["100 Series", "200 Series (Narroline)", "400 Series", "A-Series", "E-Series", "W-Series", "Custom"],
  "Pella":       ["Impervia", "250 Series", "350 Series", "Lifestyle Series", "Architect Series", "Custom"],
  "ProVia":      ["Aspect Casement", "Heritage", "Signet", "Custom"],
  "Alside":      ["Excalibur", "Sheffield", "Mezzo", "Preservation", "Ultramaxx", "Custom"],
  "Windsor":     ["Legend", "Pinnacle", "Next Dimension", "Traditions", "Custom"],
  "Kolbe":       ["Heritage", "VistaLuxe", "Ultra Series", "Forgent", "Custom"],
  "MI Windows":  ["MI 2500", "MI 3000", "MI 4000", "MI 8000", "Custom"],
  "Sunrise":     ["Bravada", "Restorations", "Inspiring", "Encore", "Vanguard", "Custom"],
  "Custom":      [],
};
// Allowed window types per brand+series. Omitted series (Custom/"") = all types allowed.
const SERIES_TYPES = {
  "Midway by Alliance": {
    "Windgate":  ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "Belmont":   ["SH","DH","SLD","DSLD","CAS-L","CAS-R","PIC"],
    "Hawthorne": ["DH","CAS-L","CAS-R","DCAS","BAY","BOW","PIC"],
  },
  "Simonton": {
    "StormBreaker Plus":     ["DH","SH","SLD","DSLD","PIC"],
    "Reflections 5500":      ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
    "Reflections 5050":      ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","BAY"],
    "Pro-Finish Builder":    ["DH","SH","SLD","DSLD","PIC"],
    "Pro-Finish Contractor": ["DH","SH","SLD","DSLD","PIC"],
    "Impressions 9800":      ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
  },
  "Marvin": {
    "Elevate":               ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW","GARDEN"],
    "Essential":             ["DH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE"],
    "Signature":             ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","TCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "Infinity (Fiberglass)": ["DH","SH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "Clad-Wood":             ["DH","SH","SLD","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW"],
  },
  "Andersen": {
    "100 Series":             ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC"],
    "200 Series (Narroline)": ["DH","SH","PIC"],
    "400 Series":             ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW","GARDEN"],
    "A-Series":               ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","TCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "E-Series":               ["DH","SH","SLD","DSLD","CAS-L","CAS-R","DCAS","TCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "W-Series":               ["DH","CAS-L","CAS-R","DCAS","AWN","PIC"],
  },
  "Pella": {
    "Impervia":         ["DH","CAS-L","CAS-R","DCAS","AWN","PIC"],
    "250 Series":       ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC"],
    "350 Series":       ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY"],
    "Lifestyle Series": ["DH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "Architect Series": ["DH","SH","SLD","CAS-L","CAS-R","DCAS","TCAS","AWN","PIC","SHAPE","BAY","BOW"],
  },
  "ProVia": {
    "Aspect Casement": ["CAS-L","CAS-R","DCAS","TCAS","AWN","PIC"],
    "Heritage":        ["DH","SH","SLD","DSLD","PIC"],
    "Signet":          ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE"],
  },
  "Alside": {
    "Excalibur":   ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","BAY"],
    "Sheffield":   ["DH","SH","SLD","DSLD","PIC"],
    "Mezzo":       ["DH","CAS-L","CAS-R","AWN","PIC"],
    "Preservation":["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
    "Ultramaxx":   ["DH","SH","SLD","DSLD","PIC"],
  },
  "Windsor": {
    "Legend":         ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
    "Pinnacle":       ["DH","SH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY"],
    "Next Dimension": ["DH","SH","SLD","CAS-L","CAS-R","AWN","PIC","SHAPE"],
    "Traditions":     ["DH","SH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY"],
  },
  "Kolbe": {
    "Heritage":    ["DH","SH","SLD","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "VistaLuxe":   ["DH","CAS-L","CAS-R","DCAS","AWN","PIC","SHAPE"],
    "Ultra Series":["DH","SH","SLD","CAS-L","CAS-R","DCAS","TCAS","AWN","PIC","SHAPE","BAY","BOW"],
    "Forgent":     ["DH","CAS-L","CAS-R","DCAS","AWN","PIC"],
  },
  "MI Windows": {
    "MI 2500": ["DH","SH","SLD","DSLD","PIC"],
    "MI 3000": ["DH","SH","SLD","DSLD","CAS-L","CAS-R","PIC"],
    "MI 4000": ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","BAY"],
    "MI 8000": ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
  },
  "Sunrise": {
    "Bravada":      ["DH","SH","SLD","DSLD","CAS-L","CAS-R","AWN","PIC","SHAPE","BAY","BOW"],
    "Restorations": ["DH","SH","PIC"],
    "Inspiring":    ["DH","SH","SLD","DSLD","CAS-L","CAS-R","PIC"],
    "Encore":       ["DH","SH","SLD","PIC"],
    "Vanguard":     ["DH","SH","SLD","DSLD","PIC"],
  },
};

// Series with real-wood interiors — stain/paint options shown in project header
const WOOD_SERIES = new Set([
  "Marvin|Signature", "Marvin|Clad-Wood", "Marvin|Elevate",
  "Andersen|400 Series", "Andersen|A-Series", "Andersen|E-Series",
  "Pella|Lifestyle Series", "Pella|Architect Series",
  "Kolbe|Heritage", "Kolbe|VistaLuxe", "Kolbe|Ultra Series",
  "Windsor|Traditions",
]);
function isWoodSeries(brand, series) { return WOOD_SERIES.has(`${brand}|${series}`); }
function getAllowedTypes(brand, series) {
  const allowed = SERIES_TYPES[brand]?.[series];
  if (!allowed) return WINDOW_TYPES;
  return WINDOW_TYPES.filter(t => allowed.includes(t.code));
}

// When mullMode is on and all units have dims, compute aggregate dimensions for material calc
function getMullEffDims(w) {
  if (!w.mullMode) return w;
  try {
    const units = JSON.parse(w.mullUnits || "[]");
    if (units.length === 0) return w;
    const allHaveW = units.every(u => u.unitNetW);
    const anyHaveH = units.some(u => u.unitNetH);
    const totalNetW = allHaveW ? units.reduce((s, u) => s + parseDim(u.unitNetW), 0) : null;
    const maxNetH = anyHaveH ? Math.max(...units.map(u => u.unitNetH ? parseDim(u.unitNetH) : 0)) : null;
    return {
      ...w,
      netW: totalNetW ? String(Math.round(totalNetW * 2) / 2) : w.netW,
      netH: maxNetH && maxNetH > 0 ? String(Math.round(maxNetH * 2) / 2) : w.netH,
      roughW: "", roughH: "",
    };
  } catch (e) { return w; }
}

// Standard exterior colors per brand (Custom = free-text fallback)
const BRAND_EXT_COLORS = {
  "Midway by Alliance": ["White","Almond","Clay","Tan","Desert Sand","Dark Brown","Black","Bronze","Adobe","Custom"],
  "Simonton":           ["White","Almond","Tan","Clay","Pebble","Harvest","Dark Bronze","Black","Custom"],
  "Marvin":             ["White","Cashmere","Ebony","Iron Ore","Dark Bronze","Black","Bronze","Bahama","Teak","Desert Sage","Custom"],
  "Andersen":           ["White","Sandstone","Terratone","Teak","Black","Pine","Canvas","Anodized Bronze","Custom"],
  "Pella":              ["White","Almond","Desert Sand","Black","Bronze","Shoreline","Champagne","Clay","Forest Green","Putty","Red","Custom"],
  "ProVia":             ["White","Almond","Black","Dark Bronze","Desert Clay","Forest Green","Clay","Custom"],
  "Alside":             ["White","Almond","Clay","Desert Tan","Dark Bronze","Black","Harvest","Cream","Custom"],
  "Windsor":            ["White","Almond","Clay","Sandstone","Bronze","Dark Bronze","Black","Linen","Sand","Custom"],
  "Kolbe":              ["White","Black","Bronze","Dark Bronze","Custom"],
  "MI Windows":         ["White","Almond","Clay","Tan","Dark Bronze","Black","Custom"],
  "Sunrise":            ["White","Almond","Black","Clay","Tan","Desert Sand","Bronze","Dark Brown","Custom"],
  "Custom":             ["Custom"],
};
// Standard interior colors per brand
const BRAND_INT_COLORS = {
  "Midway by Alliance": ["White","Almond","Custom"],
  "Simonton":           ["White","Almond","Custom"],
  "Marvin":             ["White","Cashmere","Ebony","Iron Ore","Dark Bronze","Black","Teak","Custom"],
  "Andersen":           ["White","Sandstone","Terratone","Cocoa Bean","Canvas","Pine","Custom"],
  "Pella":              ["White","Almond","Desert Sand","Putty","Bronze","Black","Custom"],
  "ProVia":             ["White","Almond","Custom"],
  "Alside":             ["White","Almond","Custom"],
  "Windsor":            ["White","Almond","Clay","Sandstone","Custom"],
  "Kolbe":              ["White","Custom"],
  "MI Windows":         ["White","Almond","Custom"],
  "Sunrise":            ["White","Almond","Custom"],
  "Custom":             ["Custom"],
};

// Standard exterior colors per door brand
const DOOR_EXT_COLORS = {
  "Midway by Alliance": ["White","Almond","Clay","Tan","Desert Sand","Dark Brown","Black","Bronze","Custom"],
  "Therma-Tru":  ["White","Sandstone","Clay","Dark Bronze","Black","Iron Ore","Custom"],
  "ProVia":      ["White","Almond","Black","Dark Bronze","Desert Clay","Forest Green","Clay","Custom"],
  "Pella":       ["White","Almond","Desert Sand","Black","Bronze","Shoreline","Champagne","Custom"],
  "Andersen":    ["White","Sandstone","Terratone","Teak","Black","Pine","Custom"],
  "Masonite":    ["White","Almond","Walnut","Custom"],
  "JELD-WEN":    ["White","Almond","Bronze","Black","Custom"],
  "Custom":      ["Custom"],
};
// Standard interior colors per door brand
const DOOR_INT_COLORS = {
  "Midway by Alliance": ["White","Almond","Custom"],
  "Therma-Tru":  ["White","Stain Ready","Custom"],
  "ProVia":      ["White","Almond","Custom"],
  "Pella":       ["White","Almond","Custom"],
  "Andersen":    ["White","Sandstone","Custom"],
  "Masonite":    ["White","Almond","Primed","Custom"],
  "JELD-WEN":    ["White","Primed","Custom"],
  "Custom":      ["Custom"],
};

const DOOR_BRANDS = ["Midway by Alliance", "Therma-Tru", "ProVia", "Pella", "Andersen", "Masonite", "JELD-WEN", "Custom"];
const DOOR_BRAND_SERIES = {
  "Midway by Alliance": ["Windgate Patio Door", "Hawthorne Patio Door", "Custom"],
  "Therma-Tru":  ["Fiber-Classic", "Smooth-Star", "Classic-Craft", "Pulse", "Custom"],
  "ProVia":      ["Signet", "Heritage", "Embarq", "Legacy Steel", "Custom"],
  "Pella":       ["Architect Series", "Designer Series", "250 Series", "Impervia (Fiberglass)", "Custom"],
  "Andersen":    ["100 Series", "400 Series", "A-Series", "Custom"],
  "Masonite":    ["Riverside", "Belleville", "Safe N Sound", "Performance Door System", "Custom"],
  "JELD-WEN":    ["AuraLast", "W-2500", "W-4500", "Premium Series", "Custom"],
  "Custom":      [],
};
const SERIES_INFO = {
  "Windgate":              "Midway by Alliance premium vinyl series. Heavy-wall construction, multi-chambered frame, triple weatherstripping, Energy Star certified. Available in multiple colors and grid options.",
  "Belmont":               "Midway by Alliance mid-range vinyl series. Balanced performance and value, tilt-wash sash, Energy Star certified. Great for standard residential replacement projects.",
  "Hawthorne":             "Midway by Alliance entry-level vinyl series. Economical replacement option, clean profile, Energy Star certified. Ideal for budget-conscious projects needing reliable performance.",
  "StormBreaker Plus":     "Impact-resistant vinyl. DP 50+ rating, laminated glass option, ideal for high-wind zones.",
  "Reflections 5500":      "Simonton premium vinyl DH. Triple-weatherstripping, tilt-wash, SimShield glass, Energy Star.",
  "Reflections 5050":      "Simonton mid-range vinyl DH. Tilt-wash sash, Energy Star certified, multiple grid options.",
  "Pro-Finish Builder":    "Simonton builder-grade vinyl. Cost-effective, standard features, Energy Star certified.",
  "Pro-Finish Contractor": "Simonton contractor-grade vinyl. Value pricing, functional features, wide size range.",
  "Impressions 9800":      "Simonton top-tier vinyl. Maximum energy performance, premium hardware, triple-pane option.",
  "Elevate":               "Marvin fiberglass exterior / wood interior. Low-maintenance outside, warm inside, wide color range.",
  "Essential":             "Marvin all-fiberglass. Slim sightlines, commercial-grade strength, fully paintable.",
  "Signature":             "Marvin premium wood-clad. Architect-grade quality, custom sizing, superior aesthetics.",
  "Infinity (Fiberglass)": "Marvin Ultrex® fiberglass. 8× stronger than vinyl, dimensionally stable, virtually maintenance-free.",
  "Clad-Wood":             "Marvin aluminum-clad wood. Traditional interior warmth, weather-resistant exterior.",
  "100 Series":            "Andersen Fibrex® composite. Low maintenance, strong, 50-year limited warranty on frame.",
  "200 Series (Narroline)":"Andersen vinyl DH. Slim profile, builder-grade, Energy Star, easy to order.",
  "400 Series":            "Andersen most popular line. Wood interior, aluminum-clad exterior, wide product range.",
  "A-Series":              "Andersen premium aluminum-clad wood. Slim profile, custom sizing, architect-grade.",
  "E-Series":              "Andersen fully custom wood. Multiple exterior finish options, highest design flexibility.",
  "W-Series":              "Andersen all-fiberglass. Durable, paintable, low maintenance, commercial-grade strength.",
  "Aspect Casement":       "ProVia premium vinyl casement. Air-tight European-style hardware, superior energy performance.",
  "Heritage":              "ProVia classic vinyl DH. Solid construction, clean lines, multiple grid options.",
  "Signet":                "ProVia high-performance vinyl. Enhanced weatherstripping, heavy-duty frame, energy efficient.",
  "Excalibur":             "Alside premium vinyl. Heavy-gauge frame, SuperSpacer® glass, Energy Star certified.",
  "Sheffield":             "Alside mid-range vinyl. Standard features, good value, Energy Star certified.",
  "Mezzo":                 "Alside narrow-frame vinyl. Maximizes glass area, modern look, Energy Star.",
  "Preservation":          "Alside top-tier vinyl. Triple-pane option, heavy frame, superior noise reduction.",
  "Ultramaxx":             "Alside builder/contractor grade. Economical, functional, standard Energy Star.",
  "Legend":                "Windsor premium vinyl. Heavy-wall frame, triple-seal weatherstripping, Energy Star.",
  "Pinnacle":              "Windsor top vinyl line. Contoured frame, reinforced sash, superior weather resistance.",
  "Next Dimension":        "Windsor premium all-vinyl. High-performance glass packages, slim sightlines.",
  "Traditions":            "Windsor wood composite. Warm interior aesthetic, durable composite frame.",
  "VistaLuxe":             "Kolbe aluminum-clad wood. Slim sightlines, floor-to-ceiling capable, modern design.",
  "Ultra Series":          "Kolbe premium wood or clad. Custom to any size/shape, highest quality craftsmanship.",
  "Forgent":               "Kolbe fiberglass composite. Low maintenance, high strength, custom colors.",
  "MI 2500":               "MI Windows standard vinyl DH. Budget-friendly, builder-grade, Energy Star.",
  "MI 3000":               "MI Windows enhanced vinyl. Better hardware, improved weatherstripping, mid-grade.",
  "MI 4000":               "MI Windows premium vinyl. Heavy-gauge frame, superior seal, energy efficient.",
  "MI 8000":               "MI Windows top-of-line vinyl. Commercial-grade frame, maximum energy performance.",
  "Bravada":               "Sunrise top-tier vinyl. Fusion-welded corners, SmartClean® glass, triple-pane option.",
  "Restorations":          "Sunrise historic-style vinyl. Wide stile/rail, period look, energy efficient.",
  "Inspiring":             "Sunrise mid-range vinyl. Clean lines, good energy performance, reliable.",
  "Encore":                "Sunrise entry-level vinyl. Budget-friendly, functional, standard Energy Star.",
  "Vanguard":              "Sunrise heavy commercial vinyl. Reinforced frame, DP rated, high-traffic applications.",
  "Impervia":              "Pella fiberglass. Exceptionally strong Endure™ composite, weather-resistant, low maintenance, Energy Star.",
  "250 Series":            "Pella reliable vinyl. Good energy performance, multiple style options, mid-range pricing.",
  "350 Series":            "Pella enhanced vinyl. Better glass performance, upgraded hardware, improved weatherstripping.",
  "Lifestyle Series":      "Pella wood interior, fiberglass exterior. Classic warmth inside, durability outside, custom sizes.",
  "Architect Series":      "Pella top-tier wood. Custom sizes and configurations, finest craftsmanship, premium aesthetics.",
};
const DOOR_SERIES_INFO = {
  "Windgate Patio Door":   "Midway by Alliance premium vinyl sliding patio door. Heavy-duty frame, multi-point locking, superior weatherstripping, Energy Star. Available in XO and OX configurations.",
  "Hawthorne Patio Door":  "Midway by Alliance standard vinyl sliding patio door. Reliable performance, tilt-clean glass, Energy Star certified. Cost-effective replacement patio door solution.",
  "Fiber-Classic":          "Therma-Tru fiberglass with realistic woodgrain texture. Excellent insulation, stainable or paintable.",
  "Smooth-Star":            "Therma-Tru smooth fiberglass. Low maintenance, paintable, solid construction, Energy Star.",
  "Classic-Craft":          "Therma-Tru premium fiberglass. Widest design range, best craftsmanship in the line.",
  "Pulse":                  "Therma-Tru modern smooth fiberglass. Contemporary styling, clean lines, energy efficient.",
  "Signet":                 "ProVia 24-gauge steel entry door. Foam core insulation, superior security and energy performance.",
  "Heritage":               "ProVia heavy-gauge steel. Reinforced frame, best-in-class energy efficiency, multiple styles.",
  "Embarq":                 "ProVia fiberglass door. Durable, low-maintenance, variety of woodgrain and smooth options.",
  "Legacy Steel":           "ProVia entry-level steel. Budget-friendly, functional, solid construction.",
  "Architect Series":       "Pella premium wood. Custom sizes, authentic craftsmanship, top-of-line aesthetics.",
  "Designer Series":        "Pella wood with fiberglass exterior. Beauty of wood inside, durability of fiberglass outside.",
  "250 Series":             "Pella reliable steel. Good energy performance, mid-range pricing, multiple styles.",
  "Impervia (Fiberglass)":  "Pella Endure fiberglass. High-impact, weather-resistant, low maintenance.",
  "400 Series":             "Andersen wood interior, aluminum-clad exterior. Classic look, great performance.",
  "Riverside":              "Masonite fiberglass. Classic panel design, energy efficient, paintable or stainable.",
  "Belleville":             "Masonite steel door. Standard grade, good value, reliable performance.",
  "Safe N Sound":           "Masonite fiberglass with enhanced STC soundproofing. Ideal for noisy environments.",
  "Performance Door System":"Masonite heavy-duty steel. Commercial-grade, maximum security and energy performance.",
  "AuraLast":               "JELD-WEN wood with moisture-resistant treatment. Reduced rot risk, paintable, classic look.",
  "W-2500":                 "JELD-WEN steel door. Builder-grade, energy efficient, reliable construction.",
  "W-4500":                 "JELD-WEN fiberglass. Mid-range, good energy performance, variety of styles.",
  "Premium Series":         "JELD-WEN premium fiberglass. Wide design range, top energy performance.",
};
const CASING_SIZES = ["", "2-1/4\"", "2-1/2\"", "3\"", "3-1/2\"", "4-1/4\"", "Custom"];
const EXT_TRIM_BRANDS = ["James Hardie", "True Wood", "LP Smart", "Syed", "Diamond Coat", "PVC", "Azek", "Miratec", "Custom"];
const TRIM_BRAND_COLORS = {
  "James Hardie":  "#C0392B",  // Hardie red
  "True Wood":     "#6D4C41",  // wood brown
  "LP Smart":      "#1565C0",  // LP blue
  "Syed":          "#6A1B9A",  // purple
  "Diamond Coat":  "#00838F",  // teal
  "PVC":           "#546E7A",  // blue-grey
  "Azek":          "#E64A19",  // deep orange
  "Miratec":       "#2E7D32",  // forest green
  "Custom":        "#F7941D",  // brand orange
};
const getTrimBrandColor = (brand) => TRIM_BRAND_COLORS[brand] || NAVY;

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
  const netW = parseDim(w.netW), netH = parseDim(w.netH);
  const roughW = parseDim(w.roughW), roughH = parseDim(w.roughH);
  // Use rough opening if entered; otherwise use net + 1" (unit is ~1" smaller than RO)
  const transomAdd = !roughH && w.hasTransom && w.transomH ? parseDim(w.transomH) : 0;
  const bottomLightAdd = !roughH && w.hasBottomLight && w.bottomLightH ? parseDim(w.bottomLightH) : 0;
  const width = roughW || (netW ? netW + 1 : 0);
  const height = roughH || (netH ? netH + 1 + transomAdd + bottomLightAdd : 0);
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
  const netW = parseDim(d.netW), netH = parseDim(d.netH);
  const roughW = parseDim(d.roughW), roughH = parseDim(d.roughH);
  // Use rough opening if entered; otherwise use net + 1" (unit is ~1" smaller than RO)
  const width = roughW || (netW ? netW + 1 : 0);
  const height = roughH || (netH ? netH + 1 : 0);
  if (!width || !height) return null;
  const qty = parseInt(d.qty) || 1;
  const best = (ft, arr) => arr.find(s => s >= ft) || arr[arr.length - 1];

  // JAMB: 2 legs (height+transomH+2") + 1 head (width+2")
  const jambH = height + (d.transom && d.transomH ? parseDim(d.transomH) : 0);
  const jLegFt = inToFt(jambH + 2), jHeadFt = inToFt(width + 2);
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

  // CASING: interior only -- 2 legs + 1 head (no bottom, no exterior side)
  // Extend casing width for sidelites, height for transom
  const slW = parseDim(d.sideliteW) || 14;
  const slCount = d.sidelites === "Both" ? 2 : (d.sidelites === "Left" || d.sidelites === "Right") ? 1 : 0;
  const casingW = width + slW * slCount;
  const casingH = height + (d.transom && d.transomH ? parseDim(d.transomH) : 0);
  const cLegFt = inToFt(casingH + 3), cHeadFt = inToFt(casingW + 6);
  const cRawLF = (cLegFt * 2 + cHeadFt) * qty;
  const cWithWaste = cRawLF * WASTE_FACTOR;
  const cBuyList = [];
  for (let i = 0; i < qty; i++) {
    cBuyList.push(best(cLegFt, CASING_STOCK));
    cBuyList.push(best(cLegFt, CASING_STOCK));
    cBuyList.push(best(cHeadFt, CASING_STOCK));
  }
  const cPcs = cBuyList.length;
  const cBuySummary = [...new Set(cBuyList)].map(l => `${cBuyList.filter(x => x === l).length}x ${l}'`).join(" + ");

  // EXT TRIM: 2 legs (height+transomH+2") + 1 head (width+2") -- no bottom on doors -- 12/14/16' stock
  const extH = height + (d.transom && d.transomH ? parseDim(d.transomH) : 0);
  const eSideFt = inToFt(extH + 2), eTopFt = inToFt(width + 2);
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

const mkWin = () => ({ id: Date.now() + Math.random(), location: "", qty: 1, type: "DH", config: "", netW: "", netH: "", roughW: "", roughH: "", gridType: "None", gridPattern: "", gridLocation: "Both", litesW: "", litesH: "", tempered: "No", glass: "DP LoE2 Ar", glassTexture: "Clear", screen: "Full", hardwareColor: "", hardwareColorCustom: "", sashSplit: "50", hasTransom: false, transomH: "", transomType: "PIC", hasBottomLight: false, bottomLightH: "", bottomLightType: "AWN", casing: false, jamb: false, stools: false, wrapTrim: false, extTrim: false, winWrap: "", metalRoll: "", metalColor: "", shapeCode: "", shapeNotes: "", baySeatDepth: "", bayProjection: "", bayPanels: "", bowPanelCount: "4", notes: "", expanded: true, winLine: "1", mullOverallW: "", mullOverallH: "",
  // Per-window Interior Trim
  jambSize: "", jambSizeCustom: "", jambSpecies: "", jambFinish: "", jambColor: "", jambStainColor: "", jambStainCustom: "",
  casingSize: "", casingSizeCustom: "", casingSpecies: "", casingFinish: "", casingColor: "", casingStainColor: "", casingStainCustom: "",
  // Per-window Stool
  stoolSize: "", stoolSizeCustom: "", stoolColor: "", stoolStainCustom: "", stoolNotes: "",
  // Per-window Exterior Trim
  extTrimBrand: "", extTrimBrandCustom: "", extTrimSize: "", extTrimTexture: "", extTrimColor: "",
  // Per-window Wrap
  wrapTexture: "", wrapColor: "", wrapColorCustom: "", mullMode: false, mullUnits: "[]", mullSpanTop: false, mullSpanTopType: "HALF-RND", mullSpanTopH: "",
});
const mkDoor = () => ({ id: Date.now() + Math.random(), type: "", location: "", qty: 1, handing: "", operation: "", netW: "", netH: "", roughW: "", roughH: "", glassConfig: "", glass: "DP LoE2 Ar", glassTexture: "Clear", hardwareColor: "", hardwareColorCustom: "", hardwareType: "", hardwareTypeCustom: "", jambThickness: "", sidelites: "None", sideliteW: "", sideliteWLeft: "", sideliteWRight: "", sideliteGlassTexture: "Clear", transom: false, transomH: "", threshold: "", doorScreen: "", doorShape: "Square Top", doorShapeNotes: "", jamb: false, casing: false, wrapTrim: false, extTrim: false, doorWrap: "", notes: "", expanded: true,
  // Per-door Interior Trim
  jambSize: "", jambSizeCustom: "", jambSpecies: "", jambFinish: "", jambColor: "", jambStainColor: "", jambStainCustom: "",
  casingSize: "", casingSizeCustom: "", casingSpecies: "", casingFinish: "", casingColor: "", casingStainColor: "", casingStainCustom: "",
  // Per-door Exterior Trim
  extTrimBrand: "", extTrimBrandCustom: "", extTrimSize: "", extTrimTexture: "", extTrimColor: "",
  // Per-door Wrap
  wrapTexture: "", wrapColor: "", wrapColorCustom: "",
});
const mkProj = () => ({ customer: "", address: "", city: "", state: "", zip: "", date: new Date().toISOString().split("T")[0], installType: "Replacement", brand: "Midway by Alliance", brandCustom: "", series: "", brand2: "", brandCustom2: "", series2: "", showBrand2: false, doorBrand: "", doorBrandCustom: "", doorSeries: "", supplier: "GENERIC", brickmould: "", jChannel: "", wallThick: "2x4", winIntColor: "White", winIntFinish: "", winIntStainColor: "", winExtColor: "White", winInt2Color: "White", winInt2Finish: "", winInt2StainColor: "", winExt2Color: "White", doorIntColor: "", doorExtColor: "", specialColor: "", zapierUrl: "" });

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

// Shapes valid above a window (need flat bottom edge to mate with frame top)
const SHAPES_ABOVE = SHAPE_PRESETS.filter(s => !["FULL-RND","OCTAGON"].includes(s.code));
// Window types valid as top/bottom stacked pieces (exclude specialty standalone types)
const MULL_STACK_TYPES = WINDOW_TYPES.filter(t => !["BAY","BOW","GARDEN","SHAPE"].includes(t.code));

function MullPreview({ units, overallW, overallH, spanTop, spanTopType, spanTopH }) {
  const W = 290, pad = 4;
  const parsed = typeof units === "string" ? (() => { try { return JSON.parse(units); } catch(e) { return []; } })() : units;
  if (!parsed || parsed.length === 0) return null;
  const totalRelW = parsed.reduce((s, u) => s + (parseFloat(u.relW) || 1), 0) || 1;
  const hasTop = parsed.some(u => u.topType);
  const hasBot = parsed.some(u => u.bottomType);
  const spanZone = spanTop ? 22 : 0;
  const topZone = hasTop ? 26 : 0;
  const botZone = hasBot ? 20 : 0;
  const mainH = 54;
  const H = pad * 2 + spanZone + topZone + mainH + botZone;
  const spanY = pad;
  const topY = pad + spanZone;
  const mainY = topY + topZone;

  const renderShape = (code, x, y, w, h) => {
    const sp = SHAPE_PRESETS.find(s => s.code === code);
    if (!sp) return null;
    return <path d={sp.path(w - 1, h - 2)} fill={`${NAVY}12`} stroke={NAVY} strokeWidth={0.8} transform={`translate(${x},${y + 1})`} />;
  };

  const renderBody = (type, x, y, w, h) => {
    const mid = y + h / 2;
    switch (type) {
      case "DH": return <><rect x={x} y={y} width={w} height={h/2-1} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><rect x={x} y={y+h/2+1} width={w} height={h/2-1} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><line x1={x+w*0.3} y1={y+h/2-3} x2={x+w*0.3} y2={y+h/2+4} stroke={ORANGE} strokeWidth={1} /></>;
      case "SH": return <><rect x={x} y={y} width={w} height={h/2-1} rx="1" stroke={NAVY} strokeWidth={1} fill={GRAY_BG} /><rect x={x} y={y+h/2+1} width={w} height={h/2-1} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /></>;
      case "PIC": return <rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill={`${NAVY}12`} />;
      case "CAS-L": return <><rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><line x1={x+w} y1={y} x2={x+w} y2={y+h} stroke={NAVY} strokeWidth={2} /><line x1={x+w-3} y1={mid} x2={x+3} y2={mid} stroke={ORANGE} strokeWidth={0.8} /></>;
      case "CAS-R": return <><rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><line x1={x} y1={y} x2={x} y2={y+h} stroke={NAVY} strokeWidth={2} /><line x1={x+3} y1={mid} x2={x+w-3} y2={mid} stroke={ORANGE} strokeWidth={0.8} /></>;
      case "AWN": return <><rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><line x1={x} y1={y} x2={x+w} y2={y} stroke={NAVY} strokeWidth={2} /></>;
      case "HOP": return <><rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /><line x1={x} y1={y+h} x2={x+w} y2={y+h} stroke={NAVY} strokeWidth={2} /></>;
      case "SLD": return <><rect x={x} y={y} width={w/2-1} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill={GRAY_BG} /><rect x={x+w/2+1} y={y} width={w/2-1} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill="none" /></>;
      default: return <><rect x={x} y={y} width={w} height={h} rx="1" stroke={NAVY} strokeWidth={1} fill={`${NAVY}05`} /><text x={x+w/2} y={y+h/2+3} fontSize="6" fill={NAVY} textAnchor="middle">{type}</text></>;
    }
  };

  let xOff = pad;
  const elems = parsed.map((u) => {
    const uw = Math.floor(((parseFloat(u.relW) || 1) / totalRelW) * (W - pad * 2));
    const topSP = u.topType && SHAPE_PRESETS.find(s => s.code === u.topType);
    const botSP = u.bottomType && SHAPE_PRESETS.find(s => s.code === u.bottomType);
    const calcW = overallW ? ((parseDim(overallW) || 0) * (parseFloat(u.relW)||1) / totalRelW).toFixed(1) : null;
    const el = (
      <g key={u.id}>
        {spanZone > 0 && <rect x={xOff} y={spanY} width={uw-1} height={spanZone-1} rx="1" fill={`${NAVY}03`} stroke={`${NAVY}20`} strokeWidth={0.4} strokeDasharray="2,3" />}
        {hasTop && (topSP
          ? renderShape(u.topType, xOff, topY, uw - 1, topZone)
          : u.topType
            ? <><rect x={xOff} y={topY} width={uw-1} height={topZone-2} rx="1" stroke={NAVY} strokeWidth={1} fill={`${NAVY}08`} /><text x={xOff+uw/2} y={topY+topZone/2+2} fontSize="6" fill={NAVY} textAnchor="middle">{WINDOW_TYPES.find(t=>t.code===u.topType)?.name?.split(' ')[0] || u.topType}</text></>
            : <rect x={xOff} y={topY} width={uw-1} height={topZone-2} rx="1" fill={GRAY_BG} stroke={NAVY} strokeWidth={0.5} strokeDasharray="2,2" />
        )}
        {renderBody(u.type, xOff, mainY, uw - 1, mainH)}
        {calcW && <text x={xOff+(uw-1)/2} y={mainY+mainH-3} fontSize="5.5" fill="#999" textAnchor="middle">{calcW}"</text>}
        {hasBot && (botSP
          ? renderShape(u.bottomType, xOff, mainY+mainH+2, uw - 1, botZone)
          : u.bottomType
            ? <><rect x={xOff} y={mainY+mainH+2} width={uw-1} height={botZone-2} rx="1" stroke={NAVY} strokeWidth={1} fill={`${NAVY}08`} /><text x={xOff+uw/2} y={mainY+mainH+2+botZone/2+2} fontSize="6" fill={NAVY} textAnchor="middle">{WINDOW_TYPES.find(t=>t.code===u.bottomType)?.name?.split(' ')[0] || u.bottomType}</text></>
            : <rect x={xOff} y={mainY+mainH+2} width={uw-1} height={botZone-2} rx="1" fill={GRAY_BG} stroke={NAVY} strokeWidth={0.5} strokeDasharray="2,2" />
        )}
      </g>
    );
    xOff += uw;
    return el;
  });

  // Spanning top shape rendered across full width
  const spanSP = spanTop && spanTopType ? SHAPE_PRESETS.find(s => s.code === spanTopType) : null;
  const fullW = W - pad * 2;

  return (
    <div>
      {(overallW || overallH) && <div style={{ fontSize: 10, color: NAVY, fontWeight: 600, marginBottom: 3 }}>Overall: {[overallW && `W ${overallW}"`, overallH && `H ${overallH}"`].filter(Boolean).join(" × ")}</div>}
      <svg width={W} height={H} style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: "#fafafa", display: "block" }}>
        <defs><marker id="mpa" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><polygon points="0 0,5 2.5,0 5" fill={ORANGE} /></marker></defs>
        {elems}
        {spanZone > 0 && spanSP && <path d={spanSP.path(fullW - 1, spanZone - 2)} fill={`${ORANGE}22`} stroke={ORANGE} strokeWidth={1.2} transform={`translate(${pad},${spanY + 1})`} />}
        {spanZone > 0 && <text x={W/2} y={spanY + spanZone/2 + 2} fontSize="6" fill={ORANGE} fontWeight="bold" textAnchor="middle">{SHAPE_PRESETS.find(s=>s.code===spanTopType)?.name || spanTopType}{spanTopH ? ` ${spanTopH}"` : ""} ← spans all</text>}
      </svg>
    </div>
  );
}

function CompositeConfig({ win, onChange }) {
  const units = (() => { try { return JSON.parse(win.mullUnits || "[]"); } catch(e) { return []; } })();
  const addUnit = () => {
    const nu = { id: Date.now() + Math.random(), type: "DH", relW: 1, topType: "", topH: "", bottomType: "", bottomH: "", unitNetW: "", unitNetH: "" };
    onChange("mullUnits", JSON.stringify([...units, nu]));
  };
  const removeUnit = id => onChange("mullUnits", JSON.stringify(units.filter(u => u.id !== id)));
  const upUnit = (id, f, v) => onChange("mullUnits", JSON.stringify(units.map(u => u.id === id ? { ...u, [f]: v } : u)));
  const bbInp = { width: "100%", padding: "5px 6px", fontSize: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 5, boxSizing: "border-box" };
  const bbSel = { ...bbInp, appearance: "auto" };
  const totalRelW = units.reduce((s, u) => s + (parseFloat(u.relW) || 1), 0) || 1;
  const ovW = parseDim(win.mullOverallW) || 0;
  const ovH = parseDim(win.mullOverallH) || 0;

  return (
    <div style={{ marginTop: 8, padding: 12, background: `${NAVY}06`, border: `1px solid ${NAVY}20`, borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>MULLED UNIT BUILDER</div>
        <button onClick={addUnit} style={{ fontSize: 11, padding: "3px 10px", background: ORANGE, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>+ Add Unit</button>
      </div>

      {/* Overall size */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "6px 8px", background: `${NAVY}08`, borderRadius: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>Overall Size:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#666" }}>W</span>
          <input style={{ ...bbInp, width: 72 }} value={win.mullOverallW || ""} onChange={e => onChange("mullOverallW", e.target.value)} placeholder='108"' />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#666" }}>H</span>
          <input style={{ ...bbInp, width: 72 }} value={win.mullOverallH || ""} onChange={e => onChange("mullOverallH", e.target.value)} placeholder='60"' />
        </div>
        {win.mullOverallW && units.length > 0 && <span style={{ fontSize: 9, color: GREEN, fontWeight: 600 }}>Unit widths auto-calculated ↓</span>}
      </div>

      {/* Spanning top shape (arch/round spanning all units) */}
      <div style={{ marginBottom: 8, padding: "6px 8px", background: win.mullSpanTop ? `${ORANGE}08` : `${NAVY}04`, border: `1px solid ${win.mullSpanTop ? ORANGE+"40" : NAVY+"15"}`, borderRadius: 6 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: win.mullSpanTop ? ORANGE : "#888" }}>
          <input type="checkbox" checked={!!win.mullSpanTop} onChange={e => onChange("mullSpanTop", e.target.checked)} style={{ width: 13, height: 13, accentColor: ORANGE }} />
          Spanning Shape Top — arch / shape across ALL units
        </label>
        {win.mullSpanTop && (
          <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "flex-end" }}>
            <div style={{ flex: 2 }}>
              <div style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>Shape</div>
              <select style={bbSel} value={win.mullSpanTopType || "HALF-RND"} onChange={e => onChange("mullSpanTopType", e.target.value)}>
                {SHAPES_ABOVE.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <div style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>Height (in)</div>
              <input style={bbInp} value={win.mullSpanTopH || ""} onChange={e => onChange("mullSpanTopH", e.target.value)} placeholder='24"' />
            </div>
          </div>
        )}
      </div>

      {/* Quick setup presets */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#888", marginRight: 2, whiteSpace: "nowrap" }}>Quick setup:</span>
        {[
          { label: "3×SH",            units: [{type:"SH",relW:1},{type:"SH",relW:1},{type:"SH",relW:1}] },
          { label: "3×DH",            units: [{type:"DH",relW:1},{type:"DH",relW:1},{type:"DH",relW:1}] },
          { label: "SH|PIC|SH",       units: [{type:"SH",relW:1},{type:"PIC",relW:2},{type:"SH",relW:1}] },
          { label: "CAS-L|PIC|CAS-R", units: [{type:"CAS-L",relW:1},{type:"PIC",relW:2},{type:"CAS-R",relW:1}] },
          { label: "3×CAS L|R|L",     units: [{type:"CAS-L",relW:1},{type:"CAS-R",relW:1},{type:"CAS-L",relW:1}] },
          { label: "3×CAS-L",         units: [{type:"CAS-L",relW:1},{type:"CAS-L",relW:1},{type:"CAS-L",relW:1}] },
          { label: "CAS-L|CAS-R",     units: [{type:"CAS-L",relW:1},{type:"CAS-R",relW:1}] },
          { label: "3×SLD",           units: [{type:"SLD",relW:1},{type:"SLD",relW:1},{type:"SLD",relW:1}] },
        ].map(preset => (
          <button key={preset.label} onClick={() => onChange("mullUnits", JSON.stringify(preset.units.map(u => ({ id: Date.now() + Math.random(), topType: "", topH: "", bottomType: "", bottomH: "", unitNetW: "", unitNetH: "", ...u }))))}
            style={{ fontSize: 9, padding: "2px 7px", background: `${NAVY}10`, color: NAVY, border: `1px solid ${NAVY}25`, borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>{preset.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#888", marginRight: 2, whiteSpace: "nowrap" }}>Stacked:</span>
        {[
          { label: "SH+Half-Rnd",    units: [{type:"SH",  relW:1, topType:"HALF-RND", topH:"24"}] },
          { label: "DH+Half-Rnd",    units: [{type:"DH",  relW:1, topType:"HALF-RND", topH:"24"}] },
          { label: "PIC+Arch-Top",   units: [{type:"PIC", relW:1, topType:"ARCH-TOP",  topH:"30"}] },
          { label: "CAS-L+Half-Rnd", units: [{type:"CAS-L",relW:1,topType:"HALF-RND", topH:"24"}] },
          { label: "SH+AWN",         units: [{type:"SH",  relW:1, topType:"AWN",       topH:"24"}] },
          { label: "SH|PIC|SH+Rnd",  units: [{type:"SH",relW:1,topType:"HALF-RND",topH:"24"},{type:"PIC",relW:2,topType:"HALF-RND",topH:"24"},{type:"SH",relW:1,topType:"HALF-RND",topH:"24"}] },
        ].map(preset => (
          <button key={preset.label} onClick={() => onChange("mullUnits", JSON.stringify(preset.units.map(u => ({ id: Date.now() + Math.random(), bottomType: "", bottomH: "", unitNetW: "", unitNetH: "", ...u }))))}
            style={{ fontSize: 9, padding: "2px 7px", background: `${NAVY}10`, color: NAVY, border: `1px solid ${NAVY}25`, borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>{preset.label}</button>
        ))}
      </div>
      {units.length === 3 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#888", marginRight: 2, whiteSpace: "nowrap" }}>Widths:</span>
          {[
            { label: "1/3 each",  relWs: [1,1,1] },
            { label: "25/50/25",  relWs: [1,2,1] },
            { label: "20/60/20",  relWs: [1,3,1] },
          ].map(preset => (
            <button key={preset.label} onClick={() => onChange("mullUnits", JSON.stringify(units.map((u, i) => ({ ...u, relW: preset.relWs[i] }))))}
              style={{ fontSize: 9, padding: "2px 7px", background: `${ORANGE}12`, color: ORANGE, border: `1px solid ${ORANGE}40`, borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>{preset.label}</button>
          ))}
        </div>
      )}
      {units.length === 0 && <div style={{ fontSize: 11, color: "#888", textAlign: "center", padding: "8px 0" }}>Click "+ Add Unit" or a Quick setup button to start</div>}

      {/* Unit cards */}
      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
        {units.map((u, idx) => {
          const uW = ovW ? (ovW * (parseFloat(u.relW)||1) / totalRelW) : null;
          const topHin = parseFloat(u.topH) || 0;
          const botHin = parseFloat(u.bottomH) || 0;
          const spanHin = win.mullSpanTop ? (parseDim(win.mullSpanTopH) || 0) : 0;
          const mainHin = ovH > 0 ? (ovH - spanHin - (u.topType ? topHin : 0) - (u.bottomType ? botHin : 0)) : null;
          return (
            <div key={u.id} style={{ flex: `${parseFloat(u.relW)||1} 0 105px`, minWidth: 105, maxWidth: 200, padding: 8, background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: ORANGE, marginBottom: 4 }}>UNIT {idx + 1}</div>

              {/* Top row — always visible */}
              <div style={{ marginBottom: 5, padding: "4px 5px", background: u.topType ? `${NAVY}08` : "#f8f9fa", border: `1px solid ${u.topType ? NAVY+"20" : GRAY_BORDER}`, borderRadius: 4 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: NAVY, marginBottom: 2 }}>TOP</div>
                <select style={bbSel} value={u.topType || ""} onChange={e => upUnit(u.id, "topType", e.target.value)}>
                  <option value="">-- None --</option>
                  <optgroup label="Window Types">{MULL_STACK_TYPES.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}</optgroup>
                  <optgroup label="Shapes (above window)">{SHAPES_ABOVE.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</optgroup>
                </select>
                {u.topType && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 8, color: "#666", whiteSpace: "nowrap" }}>H (in)</span>
                    <input type="number" min="6" max="72" style={{ ...bbInp, width: 52 }} value={u.topH || ""} onChange={e => upUnit(u.id, "topH", e.target.value)} placeholder="24" />
                  </div>
                )}
              </div>

              {/* Main type */}
              <div style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>MAIN TYPE</div>
              <select style={bbSel} value={u.type} onChange={e => upUnit(u.id, "type", e.target.value)}>
                {WINDOW_TYPES.filter(t => t.code !== "SHAPE").map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
              </select>

              {/* Net W / H */}
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: "#666", marginBottom: 1 }}>Net W</div>
                  <input style={bbInp} value={u.unitNetW || ""} onChange={e => upUnit(u.id, "unitNetW", e.target.value)} placeholder='35½' />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: "#666", marginBottom: 1 }}>Net H</div>
                  <input style={bbInp} value={u.unitNetH || ""} onChange={e => upUnit(u.id, "unitNetH", e.target.value)} placeholder='59½' />
                </div>
              </div>

              {/* Rel Width */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 8, color: "#666", marginBottom: 1 }}>Rel Width</div>
                <input type="number" min="0.3" max="5" step="0.1" style={bbInp} value={u.relW || 1} onChange={e => upUnit(u.id, "relW", e.target.value)} />
              </div>

              {/* Bottom row — always visible */}
              <div style={{ marginTop: 5, padding: "4px 5px", background: u.bottomType ? `${ORANGE}08` : "#f8f9fa", border: `1px solid ${u.bottomType ? ORANGE+"30" : GRAY_BORDER}`, borderRadius: 4 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: ORANGE, marginBottom: 2 }}>BOTTOM</div>
                <select style={bbSel} value={u.bottomType || ""} onChange={e => upUnit(u.id, "bottomType", e.target.value)}>
                  <option value="">-- None --</option>
                  <optgroup label="Window Types">{MULL_STACK_TYPES.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}</optgroup>
                </select>
                {u.bottomType && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 8, color: "#666", whiteSpace: "nowrap" }}>H (in)</span>
                    <input type="number" min="6" max="72" style={{ ...bbInp, width: 52 }} value={u.bottomH || ""} onChange={e => upUnit(u.id, "bottomH", e.target.value)} placeholder="18" />
                  </div>
                )}
              </div>

              {/* Calculated sizes */}
              <div style={{ fontSize: 8, color: GREEN, marginTop: 4, fontWeight: 600, lineHeight: 1.6 }}>
                {uW && <div>W ≈ {uW.toFixed(1)}"</div>}
                {ovH > 0 && (u.topType || u.bottomType || win.mullSpanTop) && mainHin !== null && (
                  <div>{[
                    win.mullSpanTop && spanHin > 0 && `Span:${spanHin}"`,
                    u.topType && topHin > 0 && `Top:${topHin}"`,
                    `Main:${mainHin > 0 ? mainHin.toFixed(1) : "?"}`,
                    u.bottomType && botHin > 0 && `Bot:${botHin}"`,
                  ].filter(Boolean).join(" | ")}</div>
                )}
              </div>

              {units.length > 1 && (
                <button onClick={() => removeUnit(u.id)} style={{ width: "100%", marginTop: 5, fontSize: 8, padding: "2px 5px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 3, cursor: "pointer" }}>✕ Remove</button>
              )}
            </div>
          );
        })}
      </div>
      {units.length > 0 && <MullPreview units={units} overallW={win.mullOverallW} overallH={win.mullOverallH} spanTop={win.mullSpanTop} spanTopType={win.mullSpanTopType || "HALF-RND"} spanTopH={win.mullSpanTopH} />}
    </div>
  );
}

function WinIcon({ type, shapeCode, gridType, gridLocation, litesW, litesH, gridPattern, sashSplit, hasTransom, transomH, transomType, hasBottomLight, bottomLightH, bottomLightType }) {
  const w = 48, h = 40;
  const s = { stroke: NAVY, strokeWidth: 1.5, fill: "none" };
  const a = { stroke: ORANGE, strokeWidth: 1.5, fill: "none" };
  const gS = { stroke: `${NAVY}60`, strokeWidth: 0.7 };
  const transomPx = (hasTransom && transomH) ? 12 : 0;
  const bottomPx = (hasBottomLight && bottomLightH) ? 10 : 0;
  const totalH = h + transomPx + bottomPx;
  // Sash split for DH/SH: splitPct is top sash % of total sash area
  const splitPct = Math.max(25, Math.min(75, parseInt(sashSplit) || 50));
  const totalSashH = 36; // 2+17+2+17+2 => inner area is 36px
  const topSashH = Math.round(totalSashH * splitPct / 100);
  const botSashH = totalSashH - topSashH;
  const midY = 2 + topSashH; // y of the divider between top and bottom sash
  const hasGrid = gridType && gridType !== "None";
  const lW = parseInt(litesW) || 0, lH = parseInt(litesH) || 0;
  const renderGridLines = (x, y, gw, gh, pat) => {
    const lines = [];
    if (!lW && !lH) return lines;
    const p = pat || gridPattern || "Colonial";
    if (p === "Prairie") {
      // Perimeter band: bars at 1/3 and 2/3 in each direction
      lines.push(<line key="pv1" x1={x+gw/3} y1={y} x2={x+gw/3} y2={y+gh} {...gS} />);
      lines.push(<line key="pv2" x1={x+gw*2/3} y1={y} x2={x+gw*2/3} y2={y+gh} {...gS} />);
      lines.push(<line key="ph1" x1={x} y1={y+gh/3} x2={x+gw} y2={y+gh/3} {...gS} />);
      lines.push(<line key="ph2" x1={x} y1={y+gh*2/3} x2={x+gw} y2={y+gh*2/3} {...gS} />);
    } else if (p === "Craftsman") {
      // Top band: 3 vertical dividers in upper 28% of sash, one horizontal separator
      const topH = gh * 0.28;
      [1,2,3].forEach(i => lines.push(<line key={`cv${i}`} x1={x+gw*i/4} y1={y} x2={x+gw*i/4} y2={y+topH} {...gS} />));
      lines.push(<line key="ch" x1={x} y1={y+topH} x2={x+gw} y2={y+topH} {...gS} />);
    } else if (p === "Diamond") {
      // Diagonal cross-hatch
      lines.push(<line key="d1" x1={x} y1={y} x2={x+gw} y2={y+gh} {...gS} />);
      lines.push(<line key="d2" x1={x+gw} y1={y} x2={x} y2={y+gh} {...gS} />);
      if ((lW||2) > 2) {
        lines.push(<line key="d3" x1={x+gw/2} y1={y} x2={x+gw} y2={y+gh/2} {...gS} />);
        lines.push(<line key="d4" x1={x} y1={y+gh/2} x2={x+gw/2} y2={y+gh} {...gS} />);
        lines.push(<line key="d5" x1={x+gw/2} y1={y} x2={x} y2={y+gh/2} {...gS} />);
        lines.push(<line key="d6" x1={x+gw} y1={y+gh/2} x2={x+gw/2} y2={y+gh} {...gS} />);
      }
    } else {
      // Colonial / default: uniform lW×lH grid
      const cW = lW || 2, cH = lH || 2;
      for (let i = 1; i < cW; i++) lines.push(<line key={`gv${i}`} x1={x+(gw/cW)*i} y1={y} x2={x+(gw/cW)*i} y2={y+gh} {...gS} />);
      for (let i = 1; i < cH; i++) lines.push(<line key={`gh${i}`} x1={x} y1={y+(gh/cH)*i} x2={x+gw} y2={y+(gh/cH)*i} {...gS} />);
    }
    return lines;
  };
  const showUpper = hasGrid && (gridLocation === "Both" || gridLocation === "Upper Sash");
  const showLower = hasGrid && (gridLocation === "Both" || gridLocation === "Lower Sash");
  return (<svg viewBox={`0 ${-transomPx} ${w} ${totalH}`} width={w} height={totalH}>
    <defs><marker id="wiah" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L6,2.5 L0,5" fill={ORANGE} /></marker></defs>
    {transomPx > 0 && (() => { const tSP = SHAPE_PRESETS.find(sp => sp.code === transomType); return <><rect x="8" y={-transomPx} width="32" height={transomPx - 1} rx="1" stroke={NAVY} strokeWidth="1.5" fill={`${NAVY}10`} />{tSP ? <path d={tSP.path(32, transomPx - 2)} fill={`${NAVY}22`} stroke={NAVY} strokeWidth={0.8} transform={`translate(8,${-transomPx + 1})`} /> : <text x="24" y={-transomPx + 7} fontSize="5" fill={NAVY} textAnchor="middle" fontWeight="700">{transomType || "TRN"}</text>}<text x="24" y={-1} fontSize="4" fill={NAVY} textAnchor="middle">{transomH}"</text></>; })()}
    {bottomPx > 0 && (() => { const bSP = SHAPE_PRESETS.find(sp => sp.code === bottomLightType); return <><rect x="8" y={h + 1} width="32" height={bottomPx - 2} rx="1" stroke={NAVY} strokeWidth="1.5" fill={`${NAVY}10`} />{bSP ? <path d={bSP.path(32, bottomPx - 3)} fill={`${NAVY}22`} stroke={NAVY} strokeWidth={0.8} transform={`translate(8,${h + 1})`} /> : <text x="24" y={h + 1 + (bottomPx - 2) / 2 + 2} fontSize="5" fill={NAVY} textAnchor="middle" fontWeight="700">{bottomLightType || "AWN"}</text>}<text x="24" y={h + bottomPx - 2} fontSize="4" fill={NAVY} textAnchor="middle">{bottomLightH}"</text></>; })()}
    {type === "DH" &&<><rect x="8" y="2" width="32" height={topSashH} rx="1" {...s} />{showUpper && renderGridLines(8, 2, 32, topSashH)}<rect x="8" y={midY + 2} width="32" height={botSashH - 2} rx="1" {...s} />{showLower && renderGridLines(8, midY + 2, 32, botSashH - 2)}<line x1="4" y1={midY + botSashH - 4} x2="4" y2="6" {...a} markerEnd="url(#wiah)" /><line x1="44" y1="12" x2="44" y2={midY + botSashH - 4} {...a} markerEnd="url(#wiah)" /></>}
    {type === "SH" && <><rect x="8" y="2" width="32" height={topSashH} rx="1" {...s} fill={GRAY_BG} />{showUpper && renderGridLines(8, 2, 32, topSashH)}<rect x="8" y={midY + 2} width="32" height={botSashH - 2} rx="1" {...s} />{showLower && renderGridLines(8, midY + 2, 32, botSashH - 2)}<line x1="4" y1={midY + botSashH - 2} x2="4" y2="12" {...a} markerEnd="url(#wiah)" /></>}
    {type === "SLD" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} fill={GRAY_BG} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} />{hasGrid && renderGridLines(26, 2, 20, 36)}<line x1="38" y1="20" x2="30" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "CAS-L" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="40" y1="2" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="34" y1="20" x2="12" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "CAS-R" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="8" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="14" y1="20" x2="36" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "DCAS" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="22" y1="2" x2="22" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="26" y1="2" x2="26" y2="38" stroke={NAVY} strokeWidth="2" /><line x1="18" y1="20" x2="6" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="30" y1="20" x2="42" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "TCAS" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="12" y1="20" x2="4" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="36" y1="20" x2="44" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "AWN" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} />{hasGrid && renderGridLines(8, 2, 32, 36)}<line x1="8" y1="2" x2="40" y2="2" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="42" {...a} markerEnd="url(#wiah)" /></>}
    {type === "DSLD" && <><rect x="2" y="2" width="20" height="36" rx="1" {...s} /><rect x="26" y="2" width="20" height="36" rx="1" {...s} /><line x1="8" y1="20" x2="18" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="40" y1="20" x2="30" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "3SLD" && <><rect x="1" y="4" width="14" height="32" rx="1" {...s} /><rect x="17" y="4" width="14" height="32" rx="1" {...s} fill={GRAY_BG} /><rect x="33" y="4" width="14" height="32" rx="1" {...s} /><line x1="4" y1="20" x2="12" y2="20" {...a} markerEnd="url(#wiah)" /><line x1="44" y1="20" x2="36" y2="20" {...a} markerEnd="url(#wiah)" /></>}
    {type === "PIC" && <><rect x="8" y="2" width="32" height="36" rx="2" {...s} fill={`${NAVY}11`} />{hasGrid ? renderGridLines(8, 2, 32, 36) : <><line x1="8" y1="20" x2="40" y2="20" stroke={GRAY_BORDER} strokeWidth="0.5" /><line x1="24" y1="2" x2="24" y2="38" stroke={GRAY_BORDER} strokeWidth="0.5" /></>}</>}
    {type === "SHAPE" && (() => { const sp = SHAPE_PRESETS.find(p => p.code === shapeCode); return sp ? <path d={sp.path(32, 36)} fill={`${NAVY}15`} stroke={NAVY} strokeWidth={1.5} transform="translate(8,2)" /> : <path d="M24,4 L40,16 L36,36 L12,36 L8,16 Z" {...s} fill={`${NAVY}11`} />; })()}
    {type === "BAY" && <><line x1="8" y1="2" x2="8" y2="38" {...s} /><line x1="8" y1="2" x2="18" y2="8" {...s} /><line x1="8" y1="38" x2="18" y2="32" {...s} /><rect x="18" y="8" width="12" height="24" rx="1" {...s} /><line x1="30" y1="8" x2="40" y2="2" {...s} /><line x1="30" y1="32" x2="40" y2="38" {...s} /><line x1="40" y1="2" x2="40" y2="38" {...s} /></>}
    {type === "BOW" && <><path d="M4,20 Q14,4 24,4 Q34,4 44,20 Q34,36 24,36 Q14,36 4,20" {...s} fill={`${NAVY}08`} /><line x1="14" y1="6" x2="14" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="24" y1="4" x2="24" y2="36" stroke={GRAY_BORDER} strokeWidth="0.7" /><line x1="34" y1="6" x2="34" y2="34" stroke={GRAY_BORDER} strokeWidth="0.7" /></>}
    {type === "HOP" && <><rect x="8" y="2" width="32" height="36" rx="1" {...s} /><line x1="8" y1="38" x2="40" y2="38" stroke={NAVY} strokeWidth="2.5" /><line x1="24" y1="8" x2="24" y2="-2" {...a} markerEnd="url(#wiah)" /></>}
    {type === "GARDEN" && <><path d="M6,38 L6,10 L14,2 L34,2 L42,10 L42,38 Z" {...s} fill={`${NAVY}08`} /><line x1="6" y1="10" x2="42" y2="10" {...s} /></>}
  </svg>);
}

function DoorIcon({ type, sidelites, transom, glassConfig, handing, operation }) {
  const W = 60, H = 48;
  const s = { stroke: NAVY, strokeWidth: 1.5, fill: "none" };
  const slL = sidelites === "Left" || sidelites === "Both";
  const slR = sidelites === "Right" || sidelites === "Both";
  const hasTr = !!transom;
  const lx = slL ? 13 : 4, rx = slR ? W - 13 : W - 4;
  const dw = rx - lx;
  const ty = hasTr ? 9 : 2, dh = H - ty - 2;
  const glassH = (p) => {
    if (!glassConfig || glassConfig === "Solid" || glassConfig === "") return 0;
    const r = glassConfig === "Full Lite" ? 0.85 : glassConfig === "3/4 Lite" ? 0.6 : glassConfig === "Half Lite" ? 0.4 : glassConfig === "Quarter Lite" ? 0.22 : 0;
    return p * r;
  };
  const GlassPane = ({ x, y, w, h }) => {
    const gh = glassH(h);
    if (!gh) return null;
    return <rect x={x + 2} y={y + h - gh} width={w - 4} height={gh - 1} fill={`${NAVY}10`} stroke={`${NAVY}35`} strokeWidth={0.6} rx={1} />;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>
      {slL && <><rect x={2} y={ty} width={10} height={dh} {...s} /><rect x={3} y={ty + 2} width={8} height={dh - 4} fill={`${NAVY}12`} stroke={`${NAVY}35`} strokeWidth={0.5} /></>}
      {slR && <><rect x={W - 12} y={ty} width={10} height={dh} {...s} /><rect x={W - 11} y={ty + 2} width={8} height={dh - 4} fill={`${NAVY}12`} stroke={`${NAVY}35`} strokeWidth={0.5} /></>}
      {hasTr && (() => { const trX = slL ? 2 : 4; const trW = (slR ? W - 2 : W - 4) - trX; return <><rect x={trX} y={2} width={trW} height={8} {...s} /><rect x={trX + 1} y={3} width={trW - 2} height={6} fill={`${NAVY}12`} stroke={`${NAVY}35`} strokeWidth={0.5} /></>; })()}
      {type === "Sliding Door" ? (() => {
        // OX = right panel slides (handing "Right" or "OX"), default XO = left panel slides
        const rightSlides = handing === "Right" || handing === "OX" || String(handing).toUpperCase() === "OX";
        const pLeft  = { x: lx,              y: ty, width: dw / 2 - 1, height: dh };
        const pRight = { x: lx + dw / 2 + 1, y: ty, width: dw / 2 - 1, height: dh };
        const sliding = rightSlides ? pRight : pLeft;
        const fixed   = rightSlides ? pLeft  : pRight;
        // Arrow: sliding panel arrow points outward (away from center)
        const arrowY = ty + dh * 0.55;
        const slidingMidX = sliding.x + sliding.width / 2;
        // Arrow direction: left panel slides left → arrowhead at left; right panel slides right → arrowhead at right
        const arrowX1 = rightSlides ? slidingMidX - 4 : slidingMidX + 4;
        const arrowX2 = rightSlides ? sliding.x + sliding.width - 3 : sliding.x + 3;
        return (<>
          {/* Fixed panel — slightly shaded to indicate stationary */}
          <rect {...fixed} rx={1} fill={`${NAVY}18`} stroke={NAVY} strokeWidth={1.5} />
          <GlassPane x={fixed.x} y={fixed.y} w={fixed.width} h={fixed.height} />
          {/* Static "fixed" mark — small horizontal lines */}
          <line x1={fixed.x + fixed.width * 0.35} y1={fixed.y + fixed.height * 0.4} x2={fixed.x + fixed.width * 0.65} y2={fixed.y + fixed.height * 0.4} stroke={NAVY} strokeWidth={0.8} strokeDasharray="2,2" />
          <line x1={fixed.x + fixed.width * 0.35} y1={fixed.y + fixed.height * 0.6} x2={fixed.x + fixed.width * 0.65} y2={fixed.y + fixed.height * 0.6} stroke={NAVY} strokeWidth={0.8} strokeDasharray="2,2" />
          {/* Sliding panel */}
          <rect {...sliding} rx={1} fill="none" stroke={NAVY} strokeWidth={1.5} />
          <GlassPane x={sliding.x} y={sliding.y} w={sliding.width} h={sliding.height} />
          {/* Directional slide arrow */}
          <defs><marker id="sld-arr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><polygon points="0 0, 5 2.5, 0 5" fill={ORANGE} /></marker></defs>
          <line x1={arrowX1} y1={arrowY} x2={arrowX2} y2={arrowY} stroke={ORANGE} strokeWidth={1.2} markerEnd="url(#sld-arr)" />
        </>);
      })() : type === "French Door" ? (
        <><rect x={lx} y={ty} width={dw / 2 - 1} height={dh} rx={1} {...s} />
          <rect x={lx + dw / 2 + 1} y={ty} width={dw / 2 - 1} height={dh} rx={1} {...s} />
          <line x1={lx} y1={ty} x2={lx} y2={ty + dh} stroke={NAVY} strokeWidth={2.5} />
          <line x1={rx} y1={ty} x2={rx} y2={ty + dh} stroke={NAVY} strokeWidth={2.5} />
          <GlassPane x={lx} y={ty} w={dw / 2 - 1} h={dh} /><GlassPane x={lx + dw / 2 + 1} y={ty} w={dw / 2 - 1} h={dh} />
          <circle cx={lx + dw / 2 - 4} cy={ty + dh * 0.55} r={2} fill={ORANGE} />
          <circle cx={lx + dw / 2 + 4} cy={ty + dh * 0.55} r={2} fill={ORANGE} /></>
      ) : type === "Storm Door" ? (() => {
        // Storm door: hinge flips based on handing (default LH = hinge left)
        const hingeRight = handing === "Right";
        const hingeX = hingeRight ? rx : lx;
        const latchX  = hingeRight ? lx + 6 : rx - 6;
        return (<>
          <rect x={lx} y={ty} width={dw} height={dh} rx={1} {...s} />
          <line x1={hingeX} y1={ty} x2={hingeX} y2={ty + dh} stroke={NAVY} strokeWidth={2.5} />
          <rect x={lx + 2} y={ty + 2} width={dw - 4} height={dh - 4} fill={`${NAVY}10`} stroke={`${NAVY}30`} strokeWidth={0.6} />
          <circle cx={latchX} cy={ty + dh * 0.55} r={2} fill={ORANGE} />
        </>);
      })() : (() => {
        // Entry Door / Service Door — hinge side + swing arc
        const hingeRight = handing === "Right";
        const hingeX  = hingeRight ? rx : lx;
        const latchX  = hingeRight ? lx + 6 : rx - 6;
        const isOut   = operation === "Outswing";
        const arcCy   = ty + dh;
        const arcR    = dw * 0.55;
        const arcX1   = hingeRight ? lx : rx;
        const arcY1   = ty + dh;
        const arcX2   = hingeRight ? rx : lx;
        // Inswing: arc curves up into room; Outswing: arc curves down toward viewer
        const arcY2   = isOut ? arcCy + arcR * 0.7 : arcCy - arcR;
        const arcSweep = isOut ? (hingeRight ? 1 : 0) : (hingeRight ? 0 : 1);
        return (<>
          <rect x={lx} y={ty} width={dw} height={dh} rx={1} {...s} />
          <line x1={hingeX} y1={ty} x2={hingeX} y2={ty + dh} stroke={NAVY} strokeWidth={2.5} />
          <GlassPane x={lx} y={ty} w={dw} h={dh} />
          {type !== "Service Door" && <circle cx={latchX} cy={ty + dh * 0.55} r={2} fill={ORANGE} />}
          <path d={`M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 ${arcSweep} ${arcX2} ${arcY2}`}
            fill="none" stroke={ORANGE} strokeWidth={0.8} strokeDasharray="2,1.5" opacity={0.7} />
          {isOut && <text x={(lx + rx) / 2} y={arcCy + arcR * 0.7 + 7} textAnchor="middle" fontSize="6" fill={ORANGE} fontWeight="700">OUT</text>}
        </>);
      })()}
    </svg>
  );
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

  const matSum = (() => { let jLF = 0, cLF = 0, eLF = 0, jP = 0, cP = 0; wins.forEach(w => { const m = calcMaterials(getMullEffDims(w)); if (!m) return; if (w.jamb) { jLF += parseFloat(m.jambLF); jP += m.jambPcs; } if (w.casing) { cLF += parseFloat(m.casingLF); cP += m.casingPcs; } if (w.extTrim) { eLF += parseFloat(m.extLF); } }); return { jLF: jLF.toFixed(1), cLF: cLF.toFixed(1), eLF: eLF.toFixed(1), jP, cP }; })();
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
          <div style={{ textAlign: "right", fontSize: 11, color: "#666" }}><div>(319) 259-6464</div><div style={{ fontStyle: "italic" }}>Uniting the community one customer at a time.</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
          <div><strong>Customer:</strong> {proj.customer}</div><div><strong>Address:</strong> {[proj.address, proj.city, proj.state, proj.zip].filter(Boolean).join(", ")}</div><div><strong>Date:</strong> {proj.date}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, fontSize: 11, marginBottom: 8, padding: "8px 10px", background: GRAY_BG, borderRadius: 6 }}>
          <div><strong>Install:</strong> {proj.installType}</div><div><strong>Brand:</strong> {proj.brand === "Custom" ? proj.brandCustom : proj.brand}{proj.series ? ` — ${proj.series}` : ""}</div><div><strong>Wall:</strong> {proj.wallThick}</div><div><strong>Brickmould:</strong> {proj.brickmould || "—"} | <strong>J-Ch:</strong> {proj.jChannel || "—"}</div>
          <div><strong>Window Interior:</strong> {isWoodSeries(proj.brand, proj.series) ? (proj.winIntFinish === "Stained" ? `Stained — ${proj.winIntStainColor || "--"}` : proj.winIntFinish === "Painted" ? `Painted ${proj.winIntColor}` : proj.winIntFinish || proj.winIntColor) : proj.winIntColor}</div>
          <div><strong>Window Exterior:</strong> {proj.winExtColor}</div>
          <div><strong>Door Interior:</strong> {proj.doorIntColor || "No Color"}</div>
          <div><strong>Door Exterior:</strong> {proj.doorExtColor || "No Color"}</div>
          {proj.showBrand2 && proj.brand2 && <><div><strong>Line 2 Brand:</strong> {proj.brand2 === "Custom" ? proj.brandCustom2 : proj.brand2}{proj.series2 ? ` — ${proj.series2}` : ""}</div>
          <div><strong>L2 Interior:</strong> {isWoodSeries(proj.brand2, proj.series2) ? (proj.winInt2Finish === "Stained" ? `Stained — ${proj.winInt2StainColor || "--"}` : proj.winInt2Finish === "Painted" ? `Painted ${proj.winInt2Color}` : proj.winInt2Finish || proj.winInt2Color) : proj.winInt2Color}</div>
          <div><strong>L2 Exterior:</strong> {proj.winExt2Color}</div><div /></>}
        </div>
        {proj.specialColor && <div style={{ fontSize: 11, marginBottom: 10 }}><strong>Special Color:</strong> {proj.specialColor}</div>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead><tr style={{ background: NAVY, color: "#fff" }}>
              {["#", "Location", "Qty", "Type", sLbl.config, sLbl.netW, sLbl.netH, sLbl.roughW, sLbl.roughH, "Glass", "Grid / SDL", "Tempered", "Screen", "Hardware", "Shape", "Metal", "Ext Trim", "Wrap", "Notes", "Units", ""].map((h, i) =>
                <th key={i} style={{ padding: "5px 3px", textAlign: "left", fontWeight: 600, fontSize: 9, whiteSpace: "nowrap", borderRight: "1px solid #1a5a7a", background: i % 2 === 0 ? "#004f7a" : NAVY }}>{h}</th>
              )}
            </tr></thead>
            <tbody>{wins.map((w, i) => {
              const bb = bayBowSummary(w);
              const shapeName = w.type === "SHAPE" && w.shapeCode ? ` (${SHAPE_PRESETS.find(sp => sp.code === w.shapeCode)?.name || w.shapeCode})` : "";
              return (
                <tr key={w.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "4px 3px", fontWeight: 600, background: "#EEF3F8" }}>{i + 1}</td>
                  <td style={{ padding: "4px 3px", background: "#fff" }}>{w.location}</td>
                  <td style={{ padding: "4px 3px", textAlign: "center", background: "#EEF3F8" }}>{w.qty}</td>
                  <td style={{ padding: "4px 3px", fontWeight: 600, background: "#fff" }}>{w.type}{shapeName}</td>
                  <td style={{ padding: "4px 3px", background: "#EEF3F8" }}>{w.config}</td>
                  <td style={{ padding: "4px 3px", background: "#fff" }}>{w.netW}</td>
                  <td style={{ padding: "4px 3px", background: "#EEF3F8" }}>{w.netH}</td>
                  <td style={{ padding: "4px 3px", background: "#fff" }}>{w.roughW}</td>
                  <td style={{ padding: "4px 3px", background: "#EEF3F8" }}>{w.roughH}</td>
                  <td style={{ padding: "4px 3px", background: "#fff" }}>{w.glass}{w.glassTexture && w.glassTexture !== "Clear" ? ` (${w.glassTexture})` : ""}</td>
                  <td style={{ padding: "4px 3px", background: "#EEF3F8" }}>{w.gridType !== "None" ? `${w.gridType}${w.gridPattern ? ` ${w.gridPattern}` : ""}${w.litesW && w.litesH ? ` ${w.litesW}×${w.litesH}` : ""}${w.gridLocation && w.gridLocation !== "Both" ? ` (${w.gridLocation})` : ""}` : "--"}</td>
                  <td style={{ padding: "4px 3px", background: "#fff" }}>{w.tempered !== "No" ? w.tempered : ""}</td>
                  <td style={{ padding: "4px 3px", background: "#EEF3F8" }}>{w.screen}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, background: "#fff" }}>{w.hardwareColor || ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, background: "#EEF3F8" }}>{w.type === "SHAPE" && w.shapeCode ? (SHAPE_PRESETS.find(sp => sp.code === w.shapeCode)?.name || w.shapeCode) : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, background: "#fff" }}>{w.metalRoll || ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, background: "#EEF3F8" }}>{w.extTrim ? (() => { const b = w.extTrimBrand === "Custom" ? w.extTrimBrandCustom : w.extTrimBrand; const desc = [b, w.extTrimSize, w.extTrimTexture].filter(Boolean).join(" "); return <span style={{ color: getTrimBrandColor(w.extTrimBrand === "Custom" ? "Custom" : w.extTrimBrand), fontWeight: 700 }}>{desc || "✓"}</span>; })() : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, background: "#fff" }}>{w.wrapTrim ? [w.wrapTexture, w.wrapColor === "Custom" ? w.wrapColorCustom : w.wrapColor].filter(Boolean).join(" ") || "Wrap" : ""}</td>
                  <td style={{ padding: "4px 3px", fontSize: 9, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", background: "#EEF3F8" }}>{[w.notes, w.type === "SHAPE" && w.shapeNotes ? `Shape: ${w.shapeNotes}` : "", bb, (w.type === "DH" || w.type === "SH") && parseInt(w.sashSplit) !== 50 ? `Sash ${w.sashSplit}/${100-parseInt(w.sashSplit||50)}` : "", w.hasTransom && w.transomH ? `Transom: ${w.transomType || "TRN"} ${w.transomH}"` : "", w.hasBottomLight && w.bottomLightH ? `Bot: ${w.bottomLightType || "AWN"} ${w.bottomLightH}"` : ""].filter(Boolean).join(" | ")}</td>
                  <td style={{ padding: "4px 3px", textAlign: "center", fontWeight: 700, color: ORANGE, background: "#fff" }}>{(parseInt(w.qty) || 0) * getPcs(w.type)}</td>
                  <td style={{ padding: "2px 3px", background: "#EEF3F8", textAlign: "center" }}>
                    {(() => {
                      const W = 32, H = 28;
                      if (w.type === "SHAPE" && w.shapeCode) {
                        const sp = SHAPE_PRESETS.find(s => s.code === w.shapeCode);
                        if (sp) return <svg viewBox="0 0 32 28" width={W} height={H}><path d={sp.path(30, 26)} transform="translate(1,1)" fill={`${NAVY}15`} stroke={NAVY} strokeWidth={1.2} /></svg>;
                      }
                      if (w.type === "DH" || w.type === "SH") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><line x1={2} y1={15} x2={30} y2={15} stroke={NAVY} strokeWidth={0.8}/><rect x={4} y={4} width={24} height={10} fill={`${NAVY}10`}/><rect x={4} y={17} width={24} height={7} fill={`${NAVY}08`}/></svg>;
                      if (w.type === "AWN") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><rect x={4} y={4} width={24} height={20} fill={`${NAVY}10`}/><line x1={2} y1={24} x2={30} y2={8} stroke={NAVY} strokeWidth={0.7} strokeDasharray="2,1"/></svg>;
                      if (w.type === "PIC") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill={`${NAVY}12`} stroke={NAVY} strokeWidth={1.2}/><line x1={16} y1={2} x2={16} y2={26} stroke={NAVY} strokeWidth={0.5} opacity={0.4}/><line x1={2} y1={15} x2={30} y2={15} stroke={NAVY} strokeWidth={0.5} opacity={0.4}/></svg>;
                      if (w.type === "CAS-L") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><rect x={4} y={4} width={24} height={20} fill={`${NAVY}10`}/><line x1={2} y1={14} x2={10} y2={4} stroke={NAVY} strokeWidth={0.8} strokeDasharray="2,1"/></svg>;
                      if (w.type === "CAS-R") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><rect x={4} y={4} width={24} height={20} fill={`${NAVY}10`}/><line x1={30} y1={14} x2={22} y2={4} stroke={NAVY} strokeWidth={0.8} strokeDasharray="2,1"/></svg>;
                      if (w.type === "DCAS") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><line x1={16} y1={2} x2={16} y2={26} stroke={NAVY} strokeWidth={1}/><rect x={4} y={4} width={11} height={20} fill={`${NAVY}10`}/><rect x={17} y={4} width={11} height={20} fill={`${NAVY}10`}/></svg>;
                      if (w.type === "SLD" || w.type === "DSLD") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><line x1={16} y1={2} x2={16} y2={26} stroke={NAVY} strokeWidth={1}/><rect x={3} y={3} width={12} height={22} fill={`${NAVY}15`}/><rect x={16} y={3} width={13} height={22} fill={`${NAVY}08`}/></svg>;
                      if (w.type === "3SLD") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><line x1={12} y1={2} x2={12} y2={26} stroke={NAVY} strokeWidth={0.8}/><line x1={22} y1={2} x2={22} y2={26} stroke={NAVY} strokeWidth={0.8}/><rect x={3} y={3} width={8} height={22} fill={`${NAVY}15`}/><rect x={13} y={3} width={8} height={22} fill={`${NAVY}08`}/><rect x={23} y={3} width={6} height={22} fill={`${NAVY}15`}/></svg>;
                      if (w.type === "BAY") return <svg viewBox="0 0 32 28" width={W} height={H}><polyline points="2,22 8,4 24,4 30,22" fill="none" stroke={NAVY} strokeWidth={1.2}/><line x1={2} y1={22} x2={30} y2={22} stroke={NAVY} strokeWidth={1.2}/><rect x={3} y={5} width={5} height={16} fill={`${NAVY}10`}/><rect x={9} y={5} width={14} height={16} fill={`${NAVY}15`}/><rect x={24} y={5} width={5} height={16} fill={`${NAVY}10`}/></svg>;
                      if (w.type === "HOP") return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill="none" stroke={NAVY} strokeWidth={1.2}/><rect x={4} y={4} width={24} height={20} fill={`${NAVY}10`}/><line x1={2} y1={6} x2={30} y2={20} stroke={NAVY} strokeWidth={0.7} strokeDasharray="2,1"/></svg>;
                      // Default rectangle for any other type
                      return <svg viewBox="0 0 32 28" width={W} height={H}><rect x={2} y={2} width={28} height={24} fill={`${NAVY}10`} stroke={NAVY} strokeWidth={1.2}/><text x={16} y={17} textAnchor="middle" fontSize={7} fill={NAVY} fontWeight="700">{w.type}</text></svg>;
                    })()}
                  </td>
                </tr>);
            })}</tbody>
            <tfoot><tr style={{ background: NAVY, color: "#fff", fontWeight: 700 }}><td colSpan="2" style={{ padding: "5px 6px" }}>TOTALS</td><td style={{ padding: "5px 3px", textAlign: "center" }}>{tQty}</td><td colSpan="16" /><td style={{ padding: "5px 3px", textAlign: "center", color: ORANGE, fontSize: 12 }}>{tPcs}</td><td /></tr></tfoot>
          </table>
        </div>
        {(parseFloat(matSum.jLF) > 0 || parseFloat(matSum.cLF) > 0 || parseFloat(matSum.eLF) > 0) && (() => {
          const stoolWins = wins.filter(w => w.stools && parseDim(w.netW));
          const wrapWins = wins.filter(w => w.wrapTrim);
          return (
            <div style={{ marginTop: 16, padding: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: GRAY_BG }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>WINDOW MATERIAL ESTIMATE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 11 }}>
                {parseFloat(matSum.jLF) > 0 && <div><strong>Interior Jamb:</strong> {matSum.jLF} LF ({matSum.jP} pcs)<br /><span style={{ color: "#555" }}>{[...new Set(wins.filter(w=>w.jamb).map(w=>{ const sz=w.jambSize==="Custom"?w.jambSizeCustom:w.jambSize; const col=w.jambFinish==="Stained"?(w.jambStainColor==="Custom"?w.jambStainCustom:w.jambStainColor):w.jambColor; return [sz,w.jambSpecies,w.jambFinish,col].filter(Boolean).join(" / "); }))].join(" | ") || "Specs TBD"}</span></div>}
                {parseFloat(matSum.cLF) > 0 && <div><strong>Interior Casing:</strong> {matSum.cLF} LF ({matSum.cP} pcs)<br /><span style={{ color: "#555" }}>{[...new Set(wins.filter(w=>w.casing).map(w=>{ const col=w.casingFinish==="Stained"?(w.casingStainColor==="Custom"?w.casingStainCustom:w.casingStainColor):w.casingColor; return [w.casingSpecies,w.casingFinish,col].filter(Boolean).join(" / "); }))].join(" | ") || "Specs TBD"}</span></div>}
                {parseFloat(matSum.eLF) > 0 && <div><strong>Exterior Trim:</strong> {matSum.eLF} LF<br />{(() => { const entries = [...new Map(wins.filter(w=>w.extTrim).map(w => { const b = w.extTrimBrand === "Custom" ? w.extTrimBrandCustom : w.extTrimBrand; const key = [b, w.extTrimSize, w.extTrimTexture, w.extTrimColor].filter(Boolean).join(" "); return [key, b]; })).entries()]; return entries.length ? entries.map(([desc, brand], i) => <span key={i}>{i > 0 && " | "}<span style={{ color: getTrimBrandColor(brand), fontWeight: 700 }}>{desc || "TBD"}</span></span>) : <span style={{ color: "#888" }}>Brand / type TBD</span>; })()}</div>}
                {stoolWins.length > 0 && <div><strong>Stools:</strong> {stoolWins.length} pc{stoolWins.length > 1 ? "s" : ""}<br /><span style={{ color: "#555" }}>{stoolWins.map(w => { const sz=w.stoolSize==="Custom"?w.stoolSizeCustom:w.stoolSize; const col=w.stoolColor==="Custom"?w.stoolStainCustom:w.stoolColor; return `${(parseDim(w.netW)+5).toFixed(0)}" ${sz||""} ${col||""} — ${w.location||"W"+(wins.indexOf(w)+1)}`; }).join(", ")}</span></div>}
                {wrapWins.length > 0 && (() => { const wrapLF = wrapWins.map(w=>{ const wid=parseDim(w.netW||w.roughW),hgt=parseDim(w.netH||w.roughH),qty=parseInt(w.qty)||1; return wid&&hgt?((2*(wid+2)+2*(hgt+2))/12*qty*WASTE_FACTOR):0; }).reduce((a,b)=>a+b,0); const rolls = Math.ceil(wrapLF / 50); return <div><strong>Metal Wrap / Coil:</strong> {wrapLF.toFixed(1)} LF — <span style={{ color: ORANGE, fontWeight: 700 }}>{rolls} roll{rolls !== 1 ? "s" : ""} of 50'</span><br /><span style={{ color: "#555" }}>{[...new Set(wrapWins.map(w=>[w.wrapTexture,w.wrapColor==="Custom"?w.wrapColorCustom:w.wrapColor].filter(Boolean).join(" ")))].join(" | ") || "Specs TBD"}</span></div>; })()}
                {wins.some(w => w.metalRoll) && (() => { const groups = {}; wins.filter(w => w.metalRoll).forEach(w => { const k = w.metalRoll + (w.metalColor ? ` — ${w.metalColor === "Custom" ? w.metalColorCustom || w.metalColor : w.metalColor}` : ""); groups[k] = (groups[k] || 0) + (parseInt(w.qty) || 1); }); return <div><strong>Metal Coil Rolls to Order:</strong><br />{Object.entries(groups).map(([type, qty], i) => <span key={i} style={{ display: "block", color: NAVY, fontWeight: 600 }}>{qty}x {type}</span>)}</div>; })()}
              </div>
              {/* Per-window material lengths */}
              {wins.some(w => (w.jamb || w.casing || w.extTrim || w.stools) && (parseDim(w.netW) > 0 || parseDim(w.roughW) > 0)) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: NAVY, marginBottom: 4, borderBottom: `1px solid ${GRAY_BORDER}`, paddingBottom: 2 }}>PIECE LENGTHS BY WINDOW</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                    <thead><tr style={{ background: GRAY_BG }}>
                      {["Location", "Qty", "Jamb Ext (stock lengths)", "Int Casing (stock lengths)", "Ext Trim (stock lengths)", "Stool Length"].map((h, i) =>
                        <th key={i} style={{ padding: "3px 4px", textAlign: "left", fontWeight: 700, color: NAVY, borderBottom: `1px solid ${GRAY_BORDER}`, background: i % 2 === 0 ? "#EEF3F8" : "#fff" }}>{h}</th>
                      )}
                    </tr></thead>
                    <tbody>{wins.filter(w => (w.jamb || w.casing || w.extTrim || w.stools) && (parseDim(w.netW) > 0 || parseDim(w.roughW) > 0)).map((w, ri) => {
                      const m = calcMaterials(getMullEffDims(w));
                      if (!m) return null;
                      const stoolW = parseDim(w.netW); const stoolLen = stoolW ? (stoolW + 5).toFixed(1) : "";
                      const rowBg = ri % 2 === 0 ? "#fff" : "#f9fafb";
                      return (
                        <tr key={w.id} style={{ borderBottom: "1px solid #eee", background: rowBg }}>
                          <td style={{ padding: "3px 4px", fontWeight: 600, background: "#EEF3F8" }}>{w.location || `W${wins.indexOf(w)+1}`}</td>
                          <td style={{ padding: "3px 4px" }}>{w.qty}</td>
                          <td style={{ padding: "3px 4px", background: "#EEF3F8" }}>{w.jamb ? m.jambDetail : "—"}</td>
                          <td style={{ padding: "3px 4px" }}>{w.casing ? m.casingDetail : "—"}</td>
                          <td style={{ padding: "3px 4px", background: "#EEF3F8" }}>{w.extTrim ? m.extDetail : "—"}</td>
                          <td style={{ padding: "3px 4px" }}>{w.stools && stoolLen ? `${stoolLen}"` : "—"}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
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
        {wins.some(w => w.mullMode && w.mullUnits && w.mullUnits !== "[]") && (() => {
          const mullWins = wins.filter(w => w.mullMode && w.mullUnits && w.mullUnits !== "[]");
          return (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8, borderBottom: `2px solid ${ORANGE}`, paddingBottom: 4 }}>MULLED UNIT DETAILS</div>
              {mullWins.map((w, wi) => {
                let units2 = []; try { units2 = JSON.parse(w.mullUnits); } catch(e) {}
                if (!units2.length) return null;
                const spanTopName = w.mullSpanTop && w.mullSpanTopType ? (SHAPE_PRESETS.find(s=>s.code===w.mullSpanTopType)?.name || w.mullSpanTopType) : null;
                return (
                  <div key={w.id} style={{ marginBottom: 12, padding: 10, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                      W{wins.indexOf(w)+1} — {w.location || "Mulled Unit"}
                      {(w.mullOverallW || w.mullOverallH) && <span style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}>Overall: {[w.mullOverallW && `${w.mullOverallW}" W`, w.mullOverallH && `${w.mullOverallH}" H`].filter(Boolean).join(" × ")}</span>}
                    </div>
                    {spanTopName && <div style={{ fontSize: 10, color: ORANGE, fontWeight: 700, marginBottom: 4 }}>▲ Spanning Shape Top: {spanTopName}{w.mullSpanTopH ? ` — ${w.mullSpanTopH}"` : ""} (spans all units)</div>}
                    {units2.length > 0 && (() => {
                      const totalW = units2.reduce((s, u) => s + (parseDim(u.unitNetW) || 40), 0);
                      const svgW = 280, svgH = 80;
                      let x = 0;
                      return (
                        <svg viewBox={`0 0 ${totalW} 90`} width={svgW} height={svgH} style={{ marginBottom: 8, border: `1px solid ${GRAY_BORDER}`, borderRadius: 4, background: "#f8f9fa" }}>
                          {units2.map((u, ui) => {
                            const uw2 = parseDim(u.unitNetW) || 40;
                            const uh = parseDim(u.unitNetH) || 60;
                            const rx = x; x += uw2;
                            const topH = u.topType && u.topH ? parseDim(u.topH) : 0;
                            const botH = u.bottomType && u.bottomH ? parseDim(u.bottomH) : 0;
                            const mainH = uh - topH - botH;
                            const yScale = 80 / (uh || 80);
                            const mainName = WINDOW_TYPES.find(t => t.code === u.type)?.name?.split(" ")[0] || u.type;
                            return (
                              <g key={u.id}>
                                <rect x={rx + 1} y={topH * yScale + 1} width={uw2 - 2} height={Math.max(mainH * yScale - 2, 4)} fill={`${NAVY}12`} stroke={NAVY} strokeWidth={1} />
                                <text x={rx + uw2 / 2} y={topH * yScale + mainH * yScale / 2 + 3} textAnchor="middle" fontSize={6} fill={NAVY} fontWeight="700">{mainName}</text>
                                {topH > 0 && <rect x={rx + 1} y={1} width={uw2 - 2} height={topH * yScale - 2} fill={`${ORANGE}25`} stroke={ORANGE} strokeWidth={0.8} />}
                                {botH > 0 && <rect x={rx + 1} y={(topH + mainH) * yScale + 1} width={uw2 - 2} height={botH * yScale - 2} fill={`${NAVY}08`} stroke={NAVY} strokeWidth={0.8} strokeDasharray="2,1" />}
                                <text x={rx + uw2 / 2} y={88} textAnchor="middle" fontSize={5} fill="#666">U{ui + 1}</text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                      <thead><tr style={{ background: GRAY_BG }}>
                        {["Unit","Top","Top H","Main Type","Net W","Net H","Bottom","Bot H"].map((h,i) => <th key={i} style={{ padding: "3px 4px", textAlign: "left", fontWeight: 700, color: NAVY, borderBottom: `1px solid ${GRAY_BORDER}` }}>{h}</th>)}
                      </tr></thead>
                      <tbody>{units2.map((u, ui) => {
                        const topName = u.topType ? (SHAPE_PRESETS.find(s=>s.code===u.topType)?.name || WINDOW_TYPES.find(t=>t.code===u.topType)?.name || u.topType) : "—";
                        const botName = u.bottomType ? (WINDOW_TYPES.find(t=>t.code===u.bottomType)?.name || u.bottomType) : "—";
                        const mainName = WINDOW_TYPES.find(t=>t.code===u.type)?.name || u.type;
                        return (<tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "3px 4px", fontWeight: 700, color: ORANGE }}>Unit {ui+1}</td>
                          <td style={{ padding: "3px 4px" }}>{topName}</td>
                          <td style={{ padding: "3px 4px" }}>{u.topType && u.topH ? `${u.topH}"` : "—"}</td>
                          <td style={{ padding: "3px 4px", fontWeight: 600 }}>{mainName}</td>
                          <td style={{ padding: "3px 4px" }}>{u.unitNetW ? `${u.unitNetW}"` : "—"}</td>
                          <td style={{ padding: "3px 4px" }}>{u.unitNetH ? `${u.unitNetH}"` : "—"}</td>
                          <td style={{ padding: "3px 4px" }}>{botName}</td>
                          <td style={{ padding: "3px 4px" }}>{u.bottomType && u.bottomH ? `${u.bottomH}"` : "—"}</td>
                        </tr>);
                      })}</tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
              <td style={{ padding: "4px 3px" }}>{d.jambThickness}</td><td style={{ padding: "4px 3px" }}>{d.sidelites !== "None" ? `${d.sidelites}${d.sidelites === "Both" ? ` L:${d.sideliteWLeft||"?"}"/R:${d.sideliteWRight||"?"}"` : d.sideliteW ? ` ${d.sideliteW}"` : ""}` : ""}</td>
              <td style={{ padding: "4px 3px" }}>{d.threshold}</td><td style={{ padding: "4px 3px" }}>{d.doorScreen}</td>
              <td style={{ padding: "4px 3px", fontSize: 9 }}>{d.hardwareColor} {d.hardwareType}</td><td style={{ padding: "4px 3px" }}>{d.doorWrap}</td><td style={{ padding: "4px 3px", fontSize: 9 }}>{d.notes}</td>
            </tr>)}</tbody>
          </table>
          {(parseFloat(doorMatSum.jLF) > 0 || parseFloat(doorMatSum.cLF) > 0 || parseFloat(doorMatSum.eLF) > 0) && (() => {
            const wrapDoors = doors.filter(d => d.wrapTrim);
            return (
              <div style={{ marginTop: 10, padding: 12, border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, background: GRAY_BG }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8 }}>DOOR MATERIAL ESTIMATE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 11 }}>
                  {parseFloat(doorMatSum.jLF) > 0 && <div><strong>Jamb Ext:</strong> {doorMatSum.jLF} LF ({doorMatSum.jP} pcs)<br /><span style={{ color: "#555" }}>{[...new Set(doors.filter(d=>d.jamb).map(d=>{ const sz=d.jambSize==="Custom"?d.jambSizeCustom:d.jambSize; const col=d.jambFinish==="Stained"?(d.jambStainColor==="Custom"?d.jambStainCustom:d.jambStainColor):d.jambColor; return [sz,d.jambSpecies,d.jambFinish,col].filter(Boolean).join(" / "); }))].join(" | ") || "Specs TBD"}</span></div>}
                  {parseFloat(doorMatSum.cLF) > 0 && <div><strong>Int Casing:</strong> {doorMatSum.cLF} LF ({doorMatSum.cP} pcs)<br /><span style={{ color: "#555" }}>{[...new Set(doors.filter(d=>d.casing).map(d=>{ const col=d.casingFinish==="Stained"?(d.casingStainColor==="Custom"?d.casingStainCustom:d.casingStainColor):d.casingColor; return [d.casingSpecies,d.casingFinish,col].filter(Boolean).join(" / "); }))].join(" | ") || "Specs TBD"}</span></div>}
                  {parseFloat(doorMatSum.eLF) > 0 && <div><strong>Ext Trim:</strong> {doorMatSum.eLF} LF{doorMatSum.slE ? ` — ${doorMatSum.slE}` : ""}<br />{(() => { const entries = [...new Map(doors.filter(d=>d.extTrim).map(d => { const b = d.extTrimBrand === "Custom" ? d.extTrimBrandCustom : d.extTrimBrand; const key = [b, d.extTrimSize, d.extTrimTexture, d.extTrimColor].filter(Boolean).join(" "); return [key, b]; })).entries()]; return entries.length ? entries.map(([desc, brand], i) => <span key={i}>{i > 0 && " | "}<span style={{ color: getTrimBrandColor(brand), fontWeight: 700 }}>{desc || "TBD"}</span></span>) : <span style={{ color: "#888" }}>Brand / type TBD</span>; })()}</div>}
                  {wrapDoors.length > 0 && <div><strong>Door Wrap / Coil:</strong> {wrapDoors.map(d=>{ const wid=parseDim(d.netW||d.roughW),hgt=parseDim(d.netH||d.roughH),qty=parseInt(d.qty)||1; return wid&&hgt?((2*(wid+2)+(wid+2))/12*qty*WASTE_FACTOR):0; }).reduce((a,b)=>a+b,0).toFixed(1)} LF<br /><span style={{ color: "#555" }}>{[...new Set(wrapDoors.map(d=>[d.wrapTexture,d.wrapColor==="Custom"?d.wrapColorCustom:d.wrapColor].filter(Boolean).join(" ")))].join(" | ") || "Specs TBD"}</span></div>}
                </div>
              </div>
            );
          })()}
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
          <button onClick={() => setSettingsOpen(!settingsOpen)} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", background: "transparent", borderColor: "rgba(255,255,255,0.5)" }}>Settings</button>
          <button onClick={() => setShowJobs(!showJobs)} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", background: "transparent", borderColor: "rgba(255,255,255,0.5)" }}>Jobs</button>
          <button onClick={newJob} style={{ ...bS, padding: "5px 10px", fontSize: 11, color: "#fff", background: "transparent", borderColor: "rgba(255,255,255,0.5)" }}>+ New</button>
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
            <div style={{ marginTop: 10 }}><label style={lbl}>Street Address</label><input style={inp} value={proj.address} onChange={e => up("address", e.target.value)} placeholder="Street address" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginTop: 8 }}>
              <div><label style={lbl}>City</label><input style={inp} value={proj.city || ""} onChange={e => up("city", e.target.value)} placeholder="City" /></div>
              <div><label style={lbl}>State</label><input style={inp} value={proj.state || ""} onChange={e => up("state", e.target.value)} placeholder="IL" maxLength={2} /></div>
              <div><label style={lbl}>ZIP Code</label><input style={inp} value={proj.zip || ""} onChange={e => up("zip", e.target.value)} placeholder="60601" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
              <div><label style={lbl}>Install Type</label><select style={sel} value={proj.installType} onChange={e => up("installType", e.target.value)}>{INSTALL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div>
                <label style={lbl}>Window Brand</label>
                <select style={sel} value={proj.brand} onChange={e => { up("brand", e.target.value); up("series", ""); }}>{BRANDS.map(b => <option key={b}>{b}</option>)}</select>
                {proj.brand === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.brandCustom} onChange={e => up("brandCustom", e.target.value)} placeholder="Brand name..." />}
              </div>
              <div>
                <label style={lbl}>Window Series / Model</label>
                {BRAND_SERIES[proj.brand]?.length > 0 ? (
                  <>
                    <select style={sel} value={proj.series} onChange={e => up("series", e.target.value)}>
                      <option value="">-- Select --</option>
                      {BRAND_SERIES[proj.brand].map(s => <option key={s}>{s}</option>)}
                    </select>
                    {proj.series === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.brandCustom} onChange={e => up("brandCustom", e.target.value)} placeholder="Custom series..." />}
                  </>
                ) : (
                  <input style={inp} value={proj.series} onChange={e => up("series", e.target.value)} placeholder="250, 400..." />
                )}
                {proj.series && proj.series !== "Custom" && SERIES_INFO[proj.series] && (
                  <div style={{ marginTop: 5, padding: "5px 8px", background: `${NAVY}08`, border: `1px solid ${NAVY}20`, borderRadius: 6, fontSize: 10, color: NAVY, lineHeight: 1.4 }}>
                    ℹ️ {SERIES_INFO[proj.series]}
                  </div>
                )}
              </div>
              <div><label style={lbl}>Wall Thickness</label><select style={sel} value={proj.wallThick} onChange={e => up("wallThick", e.target.value)}>{WALL_THICK.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            {/* Secondary Window Brand/Series */}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => up("showBrand2", !proj.showBrand2)} style={{ background: "none", border: `1px dashed ${NAVY}50`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 600 }}>
                {proj.showBrand2 ? "− Remove Secondary Window Line" : "+ Add Secondary Window Line"}
              </button>
            </div>
            {proj.showBrand2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 8, padding: "10px 12px", background: `${ORANGE}08`, border: `1px solid ${ORANGE}30`, borderRadius: 8 }}>
                <div style={{ gridColumn: "1 / -1", fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 2 }}>Secondary Window Line (2nd Product Line)</div>
                <div>
                  <label style={lbl}>Brand (Line 2)</label>
                  <select style={sel} value={proj.brand2 || ""} onChange={e => { up("brand2", e.target.value); up("series2", ""); }}>
                    <option value="">-- Select --</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                  {proj.brand2 === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.brandCustom2} onChange={e => up("brandCustom2", e.target.value)} placeholder="Brand name..." />}
                </div>
                <div>
                  <label style={lbl}>Series / Model (Line 2)</label>
                  {proj.brand2 && BRAND_SERIES[proj.brand2]?.length > 0 ? (
                    <>
                      <select style={sel} value={proj.series2 || ""} onChange={e => up("series2", e.target.value)}>
                        <option value="">-- Select --</option>
                        {BRAND_SERIES[proj.brand2].map(s => <option key={s}>{s}</option>)}
                      </select>
                      {proj.series2 === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.brandCustom2} onChange={e => up("brandCustom2", e.target.value)} placeholder="Custom series..." />}
                    </>
                  ) : (
                    <input style={inp} value={proj.series2 || ""} onChange={e => up("series2", e.target.value)} placeholder="Series / model..." />
                  )}
                  {proj.series2 && proj.series2 !== "Custom" && SERIES_INFO[proj.series2] && (
                    <div style={{ marginTop: 5, padding: "5px 8px", background: `${ORANGE}10`, border: `1px solid ${ORANGE}30`, borderRadius: 6, fontSize: 10, color: "#7c3a00", lineHeight: 1.4 }}>
                      ℹ️ {SERIES_INFO[proj.series2]}
                    </div>
                  )}
                </div>
                <div>
                  <label style={lbl}>Window Interior (Line 2)</label>
                  {isWoodSeries(proj.brand2 || "", proj.series2 || "") ? (
                    <>
                      <select style={{ ...sel, marginBottom: 4 }} value={proj.winInt2Finish} onChange={e => up("winInt2Finish", e.target.value)}>
                        <option value="">-- Finish --</option>
                        <option>Painted</option><option>Stained</option><option>Unfinished</option>
                      </select>
                      {proj.winInt2Finish === "Stained" ? (
                        <select style={sel} value={proj.winInt2StainColor} onChange={e => up("winInt2StainColor", e.target.value)}>
                          <option value="">-- Stain --</option>
                          {STAIN_COLORS.filter(c => c).map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : proj.winInt2Finish === "Painted" ? (
                        <input style={inp} value={proj.winInt2Color} onChange={e => up("winInt2Color", e.target.value)} placeholder="White, Custom..." />
                      ) : null}
                    </>
                  ) : (() => {
                    const intColors = BRAND_INT_COLORS[proj.brand2] || [];
                    if (intColors.length === 0) return <input style={inp} value={proj.winInt2Color} onChange={e => up("winInt2Color", e.target.value)} />;
                    const isCustom = proj.winInt2Color && !intColors.includes(proj.winInt2Color);
                    return (
                      <>
                        <select style={sel} value={isCustom ? "__custom__" : (proj.winInt2Color || "")} onChange={e => up("winInt2Color", e.target.value === "__custom__" ? "" : e.target.value)}>
                          <option value="">-- Select --</option>
                          {intColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__custom__">Custom</option>
                        </select>
                        {(isCustom || proj.winInt2Color === "") && intColors.length > 0 && (
                          <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.winInt2Color} onChange={e => up("winInt2Color", e.target.value)} placeholder="Enter color..." />
                        )}
                      </>
                    );
                  })()}
                </div>
                <div>
                  <label style={lbl}>Window Exterior (Line 2)</label>
                  {(() => {
                    const extColors = BRAND_EXT_COLORS[proj.brand2] || [];
                    if (extColors.length === 0) return <input style={inp} value={proj.winExt2Color} onChange={e => up("winExt2Color", e.target.value)} />;
                    const isCustom = proj.winExt2Color && !extColors.includes(proj.winExt2Color);
                    return (
                      <>
                        <select style={sel} value={isCustom ? "__custom__" : (proj.winExt2Color || "")} onChange={e => up("winExt2Color", e.target.value === "__custom__" ? "" : e.target.value)}>
                          <option value="">-- Select --</option>
                          {extColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__custom__">Custom</option>
                        </select>
                        {(isCustom || proj.winExt2Color === "") && extColors.length > 0 && (
                          <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.winExt2Color} onChange={e => up("winExt2Color", e.target.value)} placeholder="Enter color..." />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
              <div>
                <label style={lbl}>Window Interior</label>
                {isWoodSeries(proj.brand, proj.series) ? (
                  <>
                    <select style={{ ...sel, marginBottom: 4 }} value={proj.winIntFinish} onChange={e => up("winIntFinish", e.target.value)}>
                      <option value="">-- Finish --</option>
                      <option>Painted</option>
                      <option>Stained</option>
                      <option>Unfinished</option>
                    </select>
                    {proj.winIntFinish === "Stained" ? (
                      <select style={sel} value={proj.winIntStainColor} onChange={e => up("winIntStainColor", e.target.value)}>
                        <option value="">-- Stain --</option>
                        {STAIN_COLORS.filter(c => c).map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : proj.winIntFinish === "Painted" ? (
                      <input style={inp} value={proj.winIntColor} onChange={e => up("winIntColor", e.target.value)} placeholder="White, Custom..." />
                    ) : null}
                  </>
                ) : (() => {
                  const intColors = BRAND_INT_COLORS[proj.brand] || [];
                  if (intColors.length === 0) return <input style={inp} value={proj.winIntColor} onChange={e => up("winIntColor", e.target.value)} />;
                  const isCustom = proj.winIntColor && !intColors.includes(proj.winIntColor);
                  return (
                    <>
                      <select style={sel} value={isCustom ? "__custom__" : (proj.winIntColor || "")} onChange={e => up("winIntColor", e.target.value === "__custom__" ? "" : e.target.value)}>
                        <option value="">-- Select --</option>
                        {intColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="__custom__">Custom</option>
                      </select>
                      {(isCustom || proj.winIntColor === "") && intColors.length > 0 && (
                        <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.winIntColor} onChange={e => up("winIntColor", e.target.value)} placeholder="Enter color..." />
                      )}
                    </>
                  );
                })()}
              </div>
              <div>
                <label style={lbl}>Window Exterior</label>
                {(() => {
                  const extColors = BRAND_EXT_COLORS[proj.brand] || [];
                  if (extColors.length === 0) return <input style={inp} value={proj.winExtColor} onChange={e => up("winExtColor", e.target.value)} />;
                  const isCustom = proj.winExtColor && !extColors.includes(proj.winExtColor);
                  return (
                    <>
                      <select style={sel} value={isCustom ? "__custom__" : (proj.winExtColor || "")} onChange={e => up("winExtColor", e.target.value === "__custom__" ? "" : e.target.value)}>
                        <option value="">-- Select --</option>
                        {extColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="__custom__">Custom</option>
                      </select>
                      {(isCustom || proj.winExtColor === "") && extColors.length > 0 && (
                        <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.winExtColor} onChange={e => up("winExtColor", e.target.value)} placeholder="Enter color..." />
                      )}
                    </>
                  );
                })()}
              </div>
              <div><label style={lbl}>Brickmould</label><select style={sel} value={proj.brickmould} onChange={e => up("brickmould", e.target.value)}><option value="">-- Select --</option><option>Yes</option><option>No</option></select></div>
              <div><label style={lbl}>Integrated J-Channel</label><select style={sel} value={proj.jChannel} onChange={e => up("jChannel", e.target.value)}><option value="">-- Select --</option><option>Yes</option><option>No</option></select></div>
            </div>
            <div style={{ marginTop: 10 }}><label style={lbl}>Special Color</label><input style={inp} value={proj.specialColor} onChange={e => up("specialColor", e.target.value)} placeholder="Black exterior on front only" /></div>
          </>}
        </div>

        <div style={{ ...sec, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>Windows ({wins.filter(w => !w.mullMode).length})</span><div style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 600 }}><span style={{ color: NAVY }}>QTY: {tQty}</span><span style={{ color: ORANGE }}>PCS: {tPcs}</span></div></div>
        {wins.filter(w => !w.mullMode).map((w, idx) => { const mats = calcMaterials(getMullEffDims(w)); const isBayBow = w.type === "BAY" || w.type === "BOW";
          const wBrand = w.winLine === "2" ? (proj.brand2 || "") : proj.brand;
          const wSeries = w.winLine === "2" ? (proj.series2 || "") : proj.series;
          const allowedTypes = getAllowedTypes(wBrand, wSeries);
          const typeIsUnavailable = w.type && !allowedTypes.find(t => t.code === w.type);
          const typeOptions = typeIsUnavailable ? [WINDOW_TYPES.find(t => t.code === w.type), ...allowedTypes].filter(Boolean) : allowedTypes;
          return (
          <div key={w.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: w.expanded ? `2px solid ${NAVY}22` : "2px solid transparent" }}>
            <div onClick={() => uw(w.id, "expanded", !w.expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: w.expanded ? `${NAVY}08` : "transparent" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE, width: 24, textAlign: "center" }}>{idx + 1}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <WinIcon type={w.type} shapeCode={w.shapeCode} gridType={w.gridType} gridLocation={w.gridLocation} litesW={w.litesW} litesH={w.litesH} gridPattern={w.gridPattern} sashSplit={w.sashSplit} hasTransom={w.hasTransom} transomH={w.transomH} transomType={w.transomType} hasBottomLight={w.hasBottomLight} bottomLightH={w.bottomLightH} bottomLightType={w.bottomLightType} />
              </div>
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
              {/* Window Line selector — shown when a secondary brand is configured */}
              {proj.showBrand2 && proj.brand2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, padding: "7px 10px", background: `${NAVY}06`, border: `1px solid ${NAVY}18`, borderRadius: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>Window Line:</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer", color: w.winLine !== "2" ? NAVY : "#888", fontWeight: w.winLine !== "2" ? 700 : 400 }}>
                    <input type="radio" name={`wl_${w.id}`} checked={w.winLine !== "2"} onChange={() => uw(w.id, "winLine", "1")} style={{ accentColor: NAVY }} />
                    Line 1 — {proj.brand}{proj.series ? ` / ${proj.series}` : ""}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer", color: w.winLine === "2" ? ORANGE : "#888", fontWeight: w.winLine === "2" ? 700 : 400 }}>
                    <input type="radio" name={`wl_${w.id}`} checked={w.winLine === "2"} onChange={() => uw(w.id, "winLine", "2")} style={{ accentColor: ORANGE }} />
                    Line 2 — {proj.brand2}{proj.series2 ? ` / ${proj.series2}` : ""}
                  </label>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 2fr 1.2fr", gap: 8, marginTop: 10 }}>
                <div><label style={lbl}>Location</label><input style={inp} value={w.location} onChange={e => uw(w.id, "location", e.target.value)} placeholder="Master Bed" /></div>
                <div><label style={lbl}>Qty</label><input style={inp} type="number" min="1" value={w.qty} onChange={e => uw(w.id, "qty", e.target.value)} /></div>
                <div>
                  <label style={lbl}>Window Type{wSeries && wSeries !== "Custom" && SERIES_TYPES[wBrand]?.[wSeries] ? <span style={{ fontWeight: 400, color: NAVY, marginLeft: 4 }}>({allowedTypes.length} avail)</span> : null}</label>
                  <select style={{ ...sel, borderColor: typeIsUnavailable ? "#dc2626" : undefined }} value={w.type} onChange={e => uw(w.id, "type", e.target.value)}>
                    {typeOptions.map(t => <option key={t.code} value={t.code}>{t.name}{typeIsUnavailable && t.code === w.type ? " ⚠ not available" : ""}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Config / Handing</label><input style={inp} value={w.config} onChange={e => uw(w.id, "config", e.target.value)} placeholder="LH, RH, XO" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>{sLbl.netW}</label><input style={inp} value={w.netW} onChange={e => uw(w.id, "netW", e.target.value)} placeholder="35 1/2" /></div>
                <div><label style={lbl}>{sLbl.netH}</label><input style={inp} value={w.netH} onChange={e => uw(w.id, "netH", e.target.value)} placeholder="59 1/2" /></div>
                <div><label style={lbl}>{sLbl.roughW}</label><input style={inp} value={w.roughW} onChange={e => uw(w.id, "roughW", e.target.value)} placeholder="36" /></div>
                <div><label style={lbl}>{sLbl.roughH}</label><input style={inp} value={w.roughH} onChange={e => uw(w.id, "roughH", e.target.value)} placeholder="60" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>{sLbl.glass}</label><select style={sel} value={w.glass} onChange={e => uw(w.id, "glass", e.target.value)}>{(()=>{ const opts = getGlassOptions(wBrand, wSeries); return (w.glass && !opts.includes(w.glass) ? [w.glass, ...opts] : opts).map(g => <option key={g}>{g}</option>); })()}</select></div>
                <div><label style={lbl}>Tempered</label><select style={sel} value={w.tempered} onChange={e => uw(w.id, "tempered", e.target.value)}>{TEMPERED_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Screen</label><select style={sel} value={w.screen} onChange={e => uw(w.id, "screen", e.target.value)}>{SCREEN_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Grid Type</label><select style={sel} value={w.gridType} onChange={e => uw(w.id, "gridType", e.target.value)}>{GRID_TYPES.map(g => <option key={g}>{g}</option>)}</select></div>
                {w.gridType !== "None" ? <div><label style={lbl}>Pattern</label><select style={sel} value={w.gridPattern} onChange={e => uw(w.id, "gridPattern", e.target.value)}><option value="">--</option>{GRID_PATTERNS.map(g => <option key={g}>{g}</option>)}</select></div> : <div />}
                <div>
                  <label style={lbl}>Hardware Color</label>
                  {(() => {
                    const hwColors = (getHardwareColors(wBrand, wSeries) || ["","Custom"]).filter(Boolean);
                    const isCustom = w.hardwareColor === "Custom";
                    return (<>
                      <select style={sel} value={w.hardwareColor} onChange={e => uw(w.id, "hardwareColor", e.target.value)}>
                        <option value="">-- None --</option>
                        {hwColors.map(c => <option key={c} value={c}>{c}</option>)}
                        {w.hardwareColor && !hwColors.includes(w.hardwareColor) && w.hardwareColor !== "Custom" && <option value={w.hardwareColor}>{w.hardwareColor}</option>}
                      </select>
                      {isCustom && <input style={{ ...inp, marginTop: 4 }} value={w.hardwareColorCustom || ""} onChange={e => uw(w.id, "hardwareColorCustom", e.target.value)} placeholder="Custom color..." />}
                    </>);
                  })()}
                </div>
              </div>
              {w.gridType !== "None" && (() => {
                const lW = parseInt(w.litesW) || 0, lH = parseInt(w.litesH) || 0;
                const barsPerSash = lW > 0 && lH > 0 ? (lW - 1) + (lH - 1) : null;
                const sashCount = (w.type === "DH" || w.type === "SH") ? (w.gridLocation === "Both" ? 2 : 1) : 1;
                const totalBars = barsPerSash !== null ? barsPerSash * sashCount * (parseInt(w.qty) || 1) : null;
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 3fr", gap: 8, marginTop: 8 }}>
                    <div><label style={lbl}>Grid Location</label><select style={sel} value={w.gridLocation || "Both"} onChange={e => uw(w.id, "gridLocation", e.target.value)}>{GRID_LOCATIONS.map(g => <option key={g}>{g}</option>)}</select></div>
                    <div>
                      <label style={lbl}>Lites Wide</label>
                      <input style={inp} value={w.litesW} onChange={e => uw(w.id, "litesW", e.target.value)} placeholder="2" />
                    </div>
                    <div>
                      <label style={lbl}>Lites Tall</label>
                      <input style={inp} value={w.litesH} onChange={e => uw(w.id, "litesH", e.target.value)} placeholder="3" />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      {totalBars !== null && (
                        <div style={{ fontSize: 11, color: NAVY, padding: "4px 8px", background: `${NAVY}08`, borderRadius: 5 }}>
                          {lW}×{lH} lites · <strong>{barsPerSash} bars/sash</strong>{sashCount > 1 ? ` × ${sashCount} sashes` : ""} = <strong style={{ color: ORANGE }}>{totalBars} total bars</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              {(w.type === "DH" || w.type === "SH") && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: `${NAVY}05`, border: `1px solid ${NAVY}15`, borderRadius: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ ...lbl, marginBottom: 0, whiteSpace: "nowrap" }}>Sash Split / Uneven Lites — Top {w.sashSplit || 50}% / Bot {100 - (parseInt(w.sashSplit) || 50)}%</label>
                    <input type="range" min="25" max="75" step="5" value={w.sashSplit || "50"} onChange={e => uw(w.id, "sashSplit", e.target.value)}
                      style={{ flex: 1, accentColor: ORANGE }} />
                    <span style={{ fontSize: 11, color: ORANGE, fontWeight: 700, minWidth: 36, textAlign: "right" }}>{w.sashSplit || 50}%</span>
                  </div>
                  {parseInt(w.sashSplit) !== 50 && <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{w.type === "SH" && parseInt(w.sashSplit) > 50 ? `Uneven lites — bottom sash is smaller (${100-(parseInt(w.sashSplit)||50)}% of height)` : `Uneven lites — top sash is ${w.sashSplit}% of height`}</div>}
                </div>
              )}
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "7px 10px", background: `${NAVY}04`, border: `1px solid ${NAVY}12`, borderRadius: 7 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: w.hasTransom ? NAVY : "#888", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={!!w.hasTransom} onChange={e => uw(w.id, "hasTransom", e.target.checked)} style={{ width: 15, height: 15, accentColor: NAVY }} />
                  Transom Above
                </label>
                {w.hasTransom && (<>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0, whiteSpace: "nowrap" }}>Height</label>
                    <input style={{ ...inp, width: 80, padding: "6px 8px" }} value={w.transomH} onChange={e => uw(w.id, "transomH", e.target.value)} placeholder='12"' />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0, whiteSpace: "nowrap" }}>Type</label>
                    <select style={{ ...sel, width: 120, padding: "6px 8px" }} value={w.transomType} onChange={e => uw(w.id, "transomType", e.target.value)}>
                      {["PIC","DH","AWN","SHAPE","HALF-RND","ARCH-TOP","CUSTOM"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </>)}
              </div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "7px 10px", background: `${NAVY}04`, border: `1px solid ${NAVY}12`, borderRadius: 7 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: w.hasBottomLight ? NAVY : "#888", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={!!w.hasBottomLight} onChange={e => uw(w.id, "hasBottomLight", e.target.checked)} style={{ width: 15, height: 15, accentColor: NAVY }} />
                  Bottom Lite
                </label>
                {w.hasBottomLight && (<>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0, whiteSpace: "nowrap" }}>Height</label>
                    <input style={{ ...inp, width: 80, padding: "6px 8px" }} value={w.bottomLightH} onChange={e => uw(w.id, "bottomLightH", e.target.value)} placeholder='10"' />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0, whiteSpace: "nowrap" }}>Type</label>
                    <select style={{ ...sel, width: 120, padding: "6px 8px" }} value={w.bottomLightType} onChange={e => uw(w.id, "bottomLightType", e.target.value)}>
                      {["AWN","PIC","HOP","CUSTOM"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </>)}
              </div>
              {(() => {
                const netH = parseDim(w.netH), tH = parseDim(w.transomH), bH = parseDim(w.bottomLightH);
                const total = (netH || 0) + (w.hasTransom ? tH || 0 : 0) + (w.hasBottomLight ? bH || 0 : 0);
                if (!netH || total === netH) return null;
                return <div style={{ fontSize: 10, color: NAVY, padding: "3px 8px", background: `${NAVY}10`, borderRadius: 4, fontWeight: 700, marginTop: 4, display: "inline-block" }}>Total unit height: {total}"  ({[w.netH && `Win ${w.netH}"`, w.hasTransom && w.transomH && `+ Trnsm ${w.transomH}"`, w.hasBottomLight && w.bottomLightH && `+ Bot Lite ${w.bottomLightH}"`].filter(Boolean).join(" ")})</div>;
              })()}
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
                {[["casing", "Casing"], ["jamb", "Jamb Ext"], ["stools", "Stools"], ["wrapTrim", "Wrap"], ["extTrim", "Exterior Trim"]].map(([f, l]) =>
                  <label key={f} style={chk}><input type="checkbox" checked={w[f]} onChange={e => uw(w.id, f, e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />{l}</label>
                )}
              </div>
              {w.jamb && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${NAVY}06`, border: `1px solid ${NAVY}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>JAMB EXTENSION</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Jamb Size</label>
                      <select style={sel} value={w.jambSize} onChange={e => uw(w.id, "jambSize", e.target.value)}><option value="">-- Select --</option>{JAMB_SIZES.map(s => <option key={s}>{s}</option>)}</select>
                      {w.jambSize === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.jambSizeCustom} onChange={e => uw(w.id, "jambSizeCustom", e.target.value)} placeholder='e.g. 5/8"x5"' />}
                    </div>
                    <div><label style={lbl}>Species</label><select style={sel} value={w.jambSpecies} onChange={e => uw(w.id, "jambSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Finish</label><select style={sel} value={w.jambFinish} onChange={e => uw(w.id, "jambFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
                    {w.jambFinish === "Stained" ? (
                      <div>
                        <label style={lbl}>Stain Color</label>
                        <select style={sel} value={w.jambStainColor} onChange={e => uw(w.id, "jambStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {w.jambStainColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.jambStainCustom || ""} onChange={e => uw(w.id, "jambStainCustom", e.target.value)} placeholder="Custom stain..." />}
                      </div>
                    ) : (
                      <div><label style={lbl}>Paint Color</label><input style={inp} value={w.jambColor} onChange={e => uw(w.id, "jambColor", e.target.value)} placeholder="White" /></div>
                    )}
                    <div />
                  </div>
                  {mats && <div style={{ fontSize: 11, color: NAVY, marginTop: 4 }}>{mats.jambLF} LF | {mats.jambPcs} pcs — <span style={{ color: "#666" }}>{mats.jambDetail}</span></div>}
                </div>
              )}
              {w.casing && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${GREEN}06`, border: `1px solid ${GREEN}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, marginBottom: 6 }}>INTERIOR CASING</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Casing Size</label>
                      <select style={sel} value={w.casingSize} onChange={e => uw(w.id, "casingSize", e.target.value)}>{CASING_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select>
                      {w.casingSize === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.casingSizeCustom || ""} onChange={e => uw(w.id, "casingSizeCustom", e.target.value)} placeholder='e.g. 4-1/2"' />}
                    </div>
                    <div><label style={lbl}>Species</label><select style={sel} value={w.casingSpecies} onChange={e => uw(w.id, "casingSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Finish</label><select style={sel} value={w.casingFinish} onChange={e => uw(w.id, "casingFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
                    {w.casingFinish === "Stained" ? (
                      <div>
                        <label style={lbl}>Stain Color</label>
                        <select style={sel} value={w.casingStainColor} onChange={e => uw(w.id, "casingStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {w.casingStainColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.casingStainCustom || ""} onChange={e => uw(w.id, "casingStainCustom", e.target.value)} placeholder="Custom stain..." />}
                      </div>
                    ) : (
                      <div><label style={lbl}>Paint Color</label><input style={inp} value={w.casingColor} onChange={e => uw(w.id, "casingColor", e.target.value)} placeholder="White" /></div>
                    )}
                    <div />
                  </div>
                  {mats && <div style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>{mats.casingLF} LF | {mats.casingPcs} pcs — <span style={{ color: "#666" }}>{mats.casingDetail}</span></div>}
                </div>
              )}
              {w.stools && (() => {
                const sw = parseDim(w.netW); const stoolLen = sw ? (sw + 5).toFixed(1) : "";
                return (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: `${ORANGE}08`, border: `1px solid ${ORANGE}30`, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 6 }}>STOOL — {stoolLen ? `${stoolLen}" length (width + 5" horns)` : "enter window width"}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={lbl}>Stool Size</label>
                        <select style={sel} value={w.stoolSize} onChange={e => uw(w.id, "stoolSize", e.target.value)}><option value="">-- Select --</option>{STOOL_SIZES.map(sz => <option key={sz}>{sz}</option>)}</select>
                        {w.stoolSize === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.stoolSizeCustom} onChange={e => uw(w.id, "stoolSizeCustom", e.target.value)} placeholder='1"x8"' />}
                      </div>
                      <div><label style={lbl}>Stool Length</label><input style={{ ...inp, background: stoolLen ? `${GREEN}08` : "#fff", fontWeight: 700 }} value={stoolLen ? `${stoolLen}"` : ""} readOnly placeholder="auto-calc" /></div>
                      <div>
                        <label style={lbl}>Stool Color</label>
                        <select style={sel} value={w.stoolColor} onChange={e => uw(w.id, "stoolColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {w.stoolColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.stoolStainCustom || ""} onChange={e => uw(w.id, "stoolStainCustom", e.target.value)} placeholder="Custom color..." />}
                      </div>
                      <div><label style={lbl}>Notes</label><input style={inp} value={w.stoolNotes} onChange={e => uw(w.id, "stoolNotes", e.target.value)} placeholder="Details..." /></div>
                    </div>
                  </div>
                );
              })()}
              {w.wrapTrim && (() => {
                const wid = parseDim(w.netW || w.roughW), hgt = parseDim(w.netH || w.roughH), qty = parseInt(w.qty) || 1;
                const wrapLF = wid && hgt ? ((2*(wid+2)+2*(hgt+2))/12*qty*WASTE_FACTOR).toFixed(1) : null;
                const wrapPcs = wid && hgt ? 4 * qty : null;
                const wrapColorDisplay = w.wrapColor === "Custom" ? w.wrapColorCustom : w.wrapColor;
                return (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: `${NAVY}08`, border: `1px solid ${NAVY}25`, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>METAL WRAP / COIL{wrapLF ? ` — ${wrapLF} LF, ${wrapPcs} pcs` : ""}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                      <div><label style={lbl}>Texture</label><select style={sel} value={w.wrapTexture} onChange={e => uw(w.id, "wrapTexture", e.target.value)}><option value="">-- Select --</option><option>Smooth</option><option>Textured</option></select></div>
                      <div>
                        <label style={lbl}>Color</label>
                        <select style={sel} value={w.wrapColor} onChange={e => uw(w.id, "wrapColor", e.target.value)}>{METAL_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {w.wrapColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.wrapColorCustom || ""} onChange={e => uw(w.id, "wrapColorCustom", e.target.value)} placeholder="Custom color..." />}
                      </div>
                      {wrapLF && <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 16, padding: 8, background: "#fff", borderRadius: 6, border: `1px solid ${NAVY}15` }}>
                        <div><div style={{ fontSize: 10, color: "#666" }}>LF Needed</div><div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{wrapLF}</div></div>
                        <div><div style={{ fontSize: 10, color: "#666" }}>Pieces</div><div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{wrapPcs}</div></div>
                        {w.wrapTexture && <div><div style={{ fontSize: 10, color: "#666" }}>Type</div><div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{w.wrapTexture}</div></div>}
                        {wrapColorDisplay && <div><div style={{ fontSize: 10, color: "#666" }}>Color</div><div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{wrapColorDisplay}</div></div>}
                      </div>}
                    </div>
                  </div>
                );
              })()}
              {w.extTrim && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${ORANGE}06`, border: `1px solid ${ORANGE}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 6 }}>EXTERIOR TRIM</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Brand</label>
                      <select style={{ ...sel, borderColor: w.extTrimBrand ? getTrimBrandColor(w.extTrimBrand) : GRAY_BORDER, borderWidth: w.extTrimBrand ? 2 : 1 }} value={w.extTrimBrand} onChange={e => uw(w.id, "extTrimBrand", e.target.value)}><option value="">-- Select --</option>{EXT_TRIM_BRANDS.map(b => <option key={b}>{b}</option>)}</select>
                      {w.extTrimBrand && w.extTrimBrand !== "Custom" && <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: getTrimBrandColor(w.extTrimBrand), background: getTrimBrandColor(w.extTrimBrand) + "18", padding: "2px 8px", borderRadius: 10, display: "inline-block" }}>{w.extTrimBrand}</div>}
                      {w.extTrimBrand === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={w.extTrimBrandCustom || ""} onChange={e => uw(w.id, "extTrimBrandCustom", e.target.value)} placeholder="Brand name..." />}
                    </div>
                    <div><label style={lbl}>Size</label><select style={sel} value={w.extTrimSize} onChange={e => uw(w.id, "extTrimSize", e.target.value)}>{EXT_TRIM_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Texture</label><select style={sel} value={w.extTrimTexture} onChange={e => uw(w.id, "extTrimTexture", e.target.value)}>{EXT_TRIM_TEXTURES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Color</label><input style={inp} value={w.extTrimColor || ""} onChange={e => uw(w.id, "extTrimColor", e.target.value)} placeholder="White, Cream..." /></div>
                  </div>
                  {mats && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{mats.extLF} LF — {mats.extDetail}</div>}
                </div>
              )}
              {mats && (w.jamb || w.casing || w.extTrim || w.stools || w.wrapTrim) && (() => {
                const jSize = w.jambSize === "Custom" ? w.jambSizeCustom : w.jambSize;
                const jCol = w.jambFinish === "Stained" ? (w.jambStainColor === "Custom" ? w.jambStainCustom : w.jambStainColor) : w.jambColor;
                const cCol = w.casingFinish === "Stained" ? (w.casingStainColor === "Custom" ? w.casingStainCustom : w.casingStainColor) : w.casingColor;
                const stoolLen = parseDim(w.netW) ? (parseDim(w.netW) + 5).toFixed(1) : null;
                const effStoolSize = w.stoolSize === "Custom" ? w.stoolSizeCustom : w.stoolSize;
                const stoolColorDisplay = w.stoolColor === "Custom" ? w.stoolStainCustom : w.stoolColor;
                const wid = parseDim(w.netW || w.roughW), hgt = parseDim(w.netH || w.roughH), qty = parseInt(w.qty) || 1;
                const wrapLF = wid && hgt ? ((2*(wid+2)+2*(hgt+2))/12*qty*WASTE_FACTOR).toFixed(1) : null;
                const wrapPcs = wid && hgt ? 4 * qty : null;
                const wrapColorDisplay = w.wrapColor === "Custom" ? w.wrapColorCustom : w.wrapColor;
                const extBrand = w.extTrimBrand === "Custom" ? w.extTrimBrandCustom : w.extTrimBrand;
                return (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 8, fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4, fontSize: 12 }}>Material Calc ({mats.width}" x {mats.height}" x {w.qty})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {w.jamb && <div><strong>Jamb{jSize ? ` (${jSize})` : ""}:</strong> {mats.jambLF} LF | {mats.jambPcs} pcs{[w.jambSpecies, w.jambFinish, jCol].filter(Boolean).length ? <span style={{ color: NAVY }}> — {[w.jambSpecies, w.jambFinish, jCol].filter(Boolean).join(" / ")}</span> : ""}<br /><span style={{ color: "#666" }}>{mats.jambDetail}</span></div>}
                      {w.casing && <div><strong>Casing:</strong> {mats.casingLF} LF | {mats.casingPcs} pcs{[w.casingSpecies, w.casingFinish, cCol].filter(Boolean).length ? <span style={{ color: NAVY }}> — {[w.casingSpecies, w.casingFinish, cCol].filter(Boolean).join(" / ")}</span> : ""}<br /><span style={{ color: "#666" }}>{mats.casingDetail}</span></div>}
                      {w.extTrim && <div><strong>Ext Trim{w.extTrimSize ? ` (${w.extTrimSize}${w.extTrimTexture ? ` ${w.extTrimTexture}` : ""})` : ""}:</strong> {mats.extLF} LF{extBrand ? <span style={{ color: getTrimBrandColor(w.extTrimBrand === "Custom" ? "Custom" : w.extTrimBrand), fontWeight: 700 }}> — {extBrand}</span> : ""}{w.extTrimColor ? <span style={{ color: "#555" }}> / {w.extTrimColor}</span> : ""}<br /><span style={{ color: "#666" }}>{mats.extDetail}</span></div>}
                      {w.stools && stoolLen && <div><strong>Stool{effStoolSize ? ` (${effStoolSize})` : ""}:</strong> {stoolLen}" x {w.qty} pc{parseInt(w.qty) > 1 ? "s" : ""}{stoolColorDisplay ? <span style={{ color: NAVY }}> — {stoolColorDisplay}</span> : ""}</div>}
                      {w.wrapTrim && wrapLF && <div><strong>Metal Wrap:</strong> {wrapLF} LF | {wrapPcs} pcs{w.wrapTexture ? <span style={{ color: "#666" }}> ({w.wrapTexture})</span> : ""}{wrapColorDisplay ? <span style={{ color: NAVY }}> — {wrapColorDisplay}</span> : ""}</div>}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
                {idx > 0 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, -1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↑</button>}
                {idx < wins.filter(w2 => !w2.mullMode).length - 1 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, 1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↓</button>}
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

        {/* ===== MULLED ASSEMBLIES SECTION ===== */}
        <div style={{ ...sec, marginTop: 20, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Mulled Assemblies ({wins.filter(w => w.mullMode).length})</span>
          <span style={{ fontSize: 11, color: "#666", fontWeight: 400 }}>Side-by-side &amp; stacked window combinations</span>
        </div>
        {wins.filter(w => w.mullMode).map((w, idx) => {
          const mats = calcMaterials(getMullEffDims(w));
          return (
            <div key={w.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: `2px solid ${ORANGE}30`, overflow: "hidden" }}>
              <div onClick={() => uw(w.id, "expanded", !w.expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer", background: `${ORANGE}08` }}>
                <span style={{ fontWeight: 700, color: ORANGE, fontSize: 13 }}>M{idx + 1}</span>
                <span style={{ flex: 1, fontWeight: 600, color: NAVY, fontSize: 13 }}>{w.location || "Mulled Assembly"}</span>
                <span style={{ fontSize: 11, color: "#666" }}>Qty: {w.qty}</span>
                <span style={{ fontSize: 11, color: ORANGE, marginLeft: 8 }}>{w.expanded ? "▲" : "▼"}</span>
              </div>
              {w.expanded && (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div><label style={lbl}>Location / Label</label><input style={inp} value={w.location} onChange={e => uw(w.id, "location", e.target.value)} placeholder="e.g. Living Room Bay" /></div>
                    <div><label style={lbl}>Qty</label><input style={inp} type="number" value={w.qty} onChange={e => uw(w.id, "qty", e.target.value)} min="1" /></div>
                  </div>
                  <CompositeConfig win={w} onChange={(f, v) => uw(w.id, f, v)} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 8 }}>
                    {[["casing", "Casing"], ["jamb", "Jamb Ext"], ["wrapTrim", "Wrap"], ["extTrim", "Exterior Trim"]].map(([f, l]) =>
                      <label key={f} style={chk}><input type="checkbox" checked={w[f]} onChange={e => uw(w.id, f, e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />{l}</label>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
                    {idx > 0 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, -1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↑</button>}
                    {idx < wins.filter(w2 => w2.mullMode).length - 1 && <button onClick={e => { e.stopPropagation(); moveWin(w.id, 1); }} style={{ ...bS, padding: "5px 8px", fontSize: 14 }}>↓</button>}
                    <button onClick={() => dupWin(w.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11 }}>Duplicate</button>
                    <button onClick={() => rmWin(w.id)} style={{ ...bS, padding: "5px 12px", fontSize: 11, color: "#ef4444", borderColor: "#ef4444" }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button onClick={() => { setWins(ws => [...ws, { ...mkWin(), mullMode: true, expanded: true, location: "" }]); setSaved(false); }} style={{ ...bS, width: "100%", marginTop: 6, padding: "13px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, borderColor: ORANGE, color: ORANGE }}>+ Add Mulled Assembly</button>

        {/* ===== END MULLED ASSEMBLIES ===== */}

        <div style={{ ...sec, marginTop: 16, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>Doors ({doors.length})</span>{doors.length > 0 && <div style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 600 }}><span style={{ color: "#666" }}>QTY: {doors.reduce((s, d) => s + (parseInt(d.qty) || 0), 0)}</span></div>}</div>
        {/* Door Info Card — brand, series, colors */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: `1px solid ${NAVY}15` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Door Selection Info</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl}>Door Brand</label>
              <select style={sel} value={proj.doorBrand} onChange={e => { up("doorBrand", e.target.value); up("doorSeries", ""); }}>
                <option value="">-- Select --</option>
                {DOOR_BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
              {proj.doorBrand === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.doorBrandCustom} onChange={e => up("doorBrandCustom", e.target.value)} placeholder="Brand name..." />}
            </div>
            <div>
              <label style={lbl}>Door Series / Model</label>
              {DOOR_BRAND_SERIES[proj.doorBrand]?.length > 0 ? (
                <>
                  <select style={sel} value={proj.doorSeries} onChange={e => up("doorSeries", e.target.value)}>
                    <option value="">-- Select --</option>
                    {DOOR_BRAND_SERIES[proj.doorBrand].map(s => <option key={s}>{s}</option>)}
                  </select>
                  {proj.doorSeries === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.doorBrandCustom} onChange={e => up("doorBrandCustom", e.target.value)} placeholder="Custom series..." />}
                </>
              ) : (
                <input style={inp} value={proj.doorSeries} onChange={e => up("doorSeries", e.target.value)} placeholder="Series / model..." />
              )}
              {proj.doorSeries && proj.doorSeries !== "Custom" && DOOR_SERIES_INFO[proj.doorSeries] && (
                <div style={{ marginTop: 5, padding: "5px 8px", background: `${NAVY}08`, border: `1px solid ${NAVY}20`, borderRadius: 6, fontSize: 10, color: NAVY, lineHeight: 1.4 }}>
                  ℹ️ {DOOR_SERIES_INFO[proj.doorSeries]}
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>Door Interior Color</label>
              {(() => {
                const intColors = DOOR_INT_COLORS[proj.doorBrand] || [];
                if (intColors.length === 0) return <input style={inp} value={proj.doorIntColor} onChange={e => up("doorIntColor", e.target.value)} placeholder="No Color" />;
                const isCustom = proj.doorIntColor && !intColors.includes(proj.doorIntColor);
                return (
                  <>
                    <select style={sel} value={isCustom ? "__custom__" : (proj.doorIntColor || "")} onChange={e => up("doorIntColor", e.target.value === "__custom__" ? "" : e.target.value)}>
                      <option value="">-- Select --</option>
                      {intColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__">Custom</option>
                    </select>
                    {(isCustom || proj.doorIntColor === "") && intColors.length > 0 && (
                      <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.doorIntColor} onChange={e => up("doorIntColor", e.target.value)} placeholder="Enter color..." />
                    )}
                  </>
                );
              })()}
            </div>
            <div>
              <label style={lbl}>Door Exterior Color</label>
              {(() => {
                const extColors = DOOR_EXT_COLORS[proj.doorBrand] || [];
                if (extColors.length === 0) return <input style={inp} value={proj.doorExtColor} onChange={e => up("doorExtColor", e.target.value)} placeholder="No Color" />;
                const isCustom = proj.doorExtColor && !extColors.includes(proj.doorExtColor);
                return (
                  <>
                    <select style={sel} value={isCustom ? "__custom__" : (proj.doorExtColor || "")} onChange={e => up("doorExtColor", e.target.value === "__custom__" ? "" : e.target.value)}>
                      <option value="">-- Select --</option>
                      {extColors.filter(c => c !== "Custom").map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__">Custom</option>
                    </select>
                    {(isCustom || proj.doorExtColor === "") && extColors.length > 0 && (
                      <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={proj.doorExtColor} onChange={e => up("doorExtColor", e.target.value)} placeholder="Enter color..." />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        {doors.map((d, idx) => { const dMats = calcDoorMaterials(d); return (
          <div key={d.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", border: d.expanded ? `2px solid ${NAVY}22` : "2px solid transparent" }}>
            <div onClick={() => ud(d.id, "expanded", !d.expanded)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: d.expanded ? `${NAVY}08` : "transparent" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: ORANGE, width: 24, textAlign: "center" }}>D{idx + 1}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <DoorIcon type={d.type} sidelites={d.sidelites} transom={d.transom} glassConfig={d.glassConfig} handing={d.handing} operation={d.operation} />
                <div style={{ fontSize: 8, color: "#888", fontStyle: "italic", whiteSpace: "nowrap" }}>Outside View</div>
                {(d.handing || d.operation) && <div style={{ fontSize: 8, color: ORANGE, fontWeight: 700, whiteSpace: "nowrap" }}>{[d.handing, d.operation].filter(Boolean).join(" · ")}</div>}
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{d.location || d.type || "--"}</div><div style={{ fontSize: 11, color: "#666" }}>{d.type}{d.handing ? ` | ${d.handing}` : ""}{d.operation ? ` | ${d.operation}` : ""}{d.netW && d.netH ? ` | ${d.netW} x ${d.netH}` : ""}{d.glassConfig ? ` | ${d.glassConfig}` : ""}{d.sidelites !== "None" ? ` | SL:${d.sidelites}` : ""}{d.transom ? " | Transom" : ""}</div></div>
              {!d.expanded && (d.jamb || d.casing || d.extTrim || d.wrapTrim) && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 100 }}>
                  {d.jamb && <span style={{ fontSize: 9, background: `${NAVY}15`, color: NAVY, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>JAMB</span>}
                  {d.casing && <span style={{ fontSize: 9, background: `${GREEN}20`, color: GREEN, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>CSG</span>}
                  {d.extTrim && <span style={{ fontSize: 9, background: `${ORANGE}20`, color: ORANGE, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>EXT</span>}
                  {d.wrapTrim && <span style={{ fontSize: 9, background: `${NAVY}10`, color: NAVY, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>WRAP</span>}
                </div>
              )}
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
                <div>
                  <label style={lbl}>Hardware Color</label>
                  <select style={sel} value={d.hardwareColor} onChange={e => ud(d.id, "hardwareColor", e.target.value)}>{getDoorHardwareColors(proj.doorBrand).map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                  {d.hardwareColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12, padding: "8px 10px" }} value={d.hardwareColorCustom} onChange={e => ud(d.id, "hardwareColorCustom", e.target.value)} placeholder="Custom color..." />}
                </div>
                <div>
                  <label style={lbl}>Hardware Type</label>
                  <select style={sel} value={d.hardwareType} onChange={e => ud(d.id, "hardwareType", e.target.value)}>{HARDWARE_TYPES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select>
                  {d.hardwareType === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12, padding: "8px 10px" }} value={d.hardwareTypeCustom} onChange={e => ud(d.id, "hardwareTypeCustom", e.target.value)} placeholder="Custom hardware..." />}
                </div>
                <div><label style={lbl}>Sidelites</label><select style={sel} value={d.sidelites} onChange={e => ud(d.id, "sidelites", e.target.value)}>{DOOR_SIDELITES.map(s => <option key={s}>{s}</option>)}</select></div>
                {d.sidelites !== "None" ? (
                  <div>
                    {d.sidelites === "Both" ? (
                      <>
                        <label style={lbl}>Left Sidelite W</label><input style={inp} value={d.sideliteWLeft || ""} onChange={e => ud(d.id, "sideliteWLeft", e.target.value)} placeholder="14" />
                        <label style={{ ...lbl, marginTop: 4 }}>Right Sidelite W</label><input style={inp} value={d.sideliteWRight || ""} onChange={e => ud(d.id, "sideliteWRight", e.target.value)} placeholder="14" />
                      </>
                    ) : (
                      <>
                        <label style={lbl}>Sidelite Width</label><input style={inp} value={d.sideliteW} onChange={e => ud(d.id, "sideliteW", e.target.value)} placeholder="14" />
                      </>
                    )}
                    <label style={{ ...lbl, marginTop: 6 }}>Sidelite Glass</label>
                    <select style={sel} value={d.sideliteGlassTexture} onChange={e => ud(d.id, "sideliteGlassTexture", e.target.value)}>{GLASS_TEXTURES.map(g => <option key={g}>{g}</option>)}</select>
                  </div>
                ) : <div />}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginTop: 8 }}>
                <div><label style={lbl}>Door Shape</label><select style={sel} value={d.doorShape} onChange={e => ud(d.id, "doorShape", e.target.value)}>{DOOR_SHAPES.map(s => <option key={s}>{s}</option>)}</select></div>
                {d.doorShape !== "Square Top" && <div><label style={lbl}>Shape Notes</label><input style={inp} value={d.doorShapeNotes} onChange={e => ud(d.id, "doorShapeNotes", e.target.value)} placeholder="Radius, arch height, specs..." /></div>}
                <div />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr", gap: 8, marginTop: 8, alignItems: "end" }}>
                <label style={{ ...chk, paddingBottom: 10 }}><input type="checkbox" checked={d.transom} onChange={e => ud(d.id, "transom", e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />Transom</label>
                {d.transom ? <div><label style={lbl}>Transom Height</label><input style={inp} value={d.transomH} onChange={e => ud(d.id, "transomH", e.target.value)} placeholder="12" /></div> : <div />}
                {(() => {
                  const dRW = parseDim(d.roughW) || (parseDim(d.netW) ? parseDim(d.netW) + 1 : 0);
                  const dRH = parseDim(d.roughH) || (parseDim(d.netH) ? parseDim(d.netH) + 1 : 0);
                  const slL = d.sidelites === "Left" || d.sidelites === "Both";
                  const slR = d.sidelites === "Right" || d.sidelites === "Both";
                  const slWL = slL ? (parseDim(d.sidelites === "Both" ? d.sideliteWLeft : d.sideliteW) || 14) : 0;
                  const slWR = slR ? (parseDim(d.sidelites === "Both" ? d.sideliteWRight : d.sideliteW) || 14) : 0;
                  const totalSlW = slWL + slWR;
                  const trH = d.transom && d.transomH ? parseDim(d.transomH) : 0;
                  const hasExtra = totalSlW > 0 || trH > 0;
                  if (!hasExtra || !dRW) return <div />;
                  const parts = [];
                  if (slL && slR) parts.push(`sidelites L:${slWL}" R:${slWR}"`);
                  else if (slL) parts.push(`left sidelite ${slWL}"`);
                  else if (slR) parts.push(`right sidelite ${slWR}"`);
                  if (trH > 0) parts.push(`transom ${trH}"`);
                  return (
                    <div style={{ gridColumn: "span 3", padding: "5px 10px", background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 6, fontSize: 11, color: GREEN, fontWeight: 700 }}>
                      Total Opening: {dRW + totalSlW}" W × {dRH + trH}" H
                      <span style={{ fontWeight: 400, color: "#666", marginLeft: 6 }}>incl. {parts.join(" + ")}</span>
                    </div>
                  );
                })()}
                <div><label style={lbl}>Threshold</label><select style={sel} value={d.threshold} onChange={e => ud(d.id, "threshold", e.target.value)}>{DOOR_THRESHOLD.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Screen</label><select style={sel} value={d.doorScreen} onChange={e => ud(d.id, "doorScreen", e.target.value)}>{DOOR_SCREEN.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                <div><label style={lbl}>Door Wrap</label><select style={sel} value={d.doorWrap} onChange={e => ud(d.id, "doorWrap", e.target.value)}>{DOOR_WRAP_SIZES.map(s => <option key={s} value={s}>{s || "-- None --"}</option>)}</select></div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, padding: "8px 10px", background: GRAY_BG, borderRadius: 8 }}>
                {[["jamb", "Jamb Ext"], ["casing", "Interior Casing"], ["wrapTrim", "Wrap"], ["extTrim", "Exterior Trim"]].map(([f, l]) =>
                  <label key={f} style={chk}><input type="checkbox" checked={d[f]} onChange={e => ud(d.id, f, e.target.checked)} style={{ width: 20, height: 20, accentColor: ORANGE }} />{l}</label>
                )}
              </div>
              {d.jamb && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${NAVY}06`, border: `1px solid ${NAVY}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>JAMB EXTENSION</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Jamb Size</label>
                      <select style={sel} value={d.jambSize} onChange={e => ud(d.id, "jambSize", e.target.value)}><option value="">-- Select --</option>{JAMB_SIZES.map(s => <option key={s}>{s}</option>)}</select>
                      {d.jambSize === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.jambSizeCustom} onChange={e => ud(d.id, "jambSizeCustom", e.target.value)} placeholder='e.g. 5/8"x5"' />}
                    </div>
                    <div><label style={lbl}>Species</label><select style={sel} value={d.jambSpecies} onChange={e => ud(d.id, "jambSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Finish</label><select style={sel} value={d.jambFinish} onChange={e => ud(d.id, "jambFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
                    {d.jambFinish === "Stained" ? (
                      <div>
                        <label style={lbl}>Stain Color</label>
                        <select style={sel} value={d.jambStainColor} onChange={e => ud(d.id, "jambStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {d.jambStainColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.jambStainCustom || ""} onChange={e => ud(d.id, "jambStainCustom", e.target.value)} placeholder="Custom stain..." />}
                      </div>
                    ) : (
                      <div><label style={lbl}>Paint Color</label><input style={inp} value={d.jambColor} onChange={e => ud(d.id, "jambColor", e.target.value)} placeholder="White" /></div>
                    )}
                    <div />
                  </div>
                  {dMats && <div style={{ fontSize: 11, color: NAVY, marginTop: 4 }}>{dMats.jambLF} LF | {dMats.jambPcs} pcs — <span style={{ color: "#666" }}>{dMats.jambDetail}</span></div>}
                </div>
              )}
              {d.casing && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${GREEN}06`, border: `1px solid ${GREEN}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, marginBottom: 6 }}>INTERIOR CASING</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Casing Size</label>
                      <select style={sel} value={d.casingSize} onChange={e => ud(d.id, "casingSize", e.target.value)}>{CASING_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select>
                      {d.casingSize === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.casingSizeCustom || ""} onChange={e => ud(d.id, "casingSizeCustom", e.target.value)} placeholder='e.g. 4-1/2"' />}
                    </div>
                    <div><label style={lbl}>Species</label><select style={sel} value={d.casingSpecies} onChange={e => ud(d.id, "casingSpecies", e.target.value)}>{JAMB_SPECIES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Finish</label><select style={sel} value={d.casingFinish} onChange={e => ud(d.id, "casingFinish", e.target.value)}>{FINISH_TYPES.map(f => <option key={f} value={f}>{f || "-- Select --"}</option>)}</select></div>
                    {d.casingFinish === "Stained" ? (
                      <div>
                        <label style={lbl}>Stain Color</label>
                        <select style={sel} value={d.casingStainColor} onChange={e => ud(d.id, "casingStainColor", e.target.value)}>{STAIN_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {d.casingStainColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.casingStainCustom || ""} onChange={e => ud(d.id, "casingStainCustom", e.target.value)} placeholder="Custom stain..." />}
                      </div>
                    ) : (
                      <div><label style={lbl}>Paint Color</label><input style={inp} value={d.casingColor} onChange={e => ud(d.id, "casingColor", e.target.value)} placeholder="White" /></div>
                    )}
                    <div />
                  </div>
                  {dMats && <div style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>{dMats.casingLF} LF | {dMats.casingPcs} pcs{d.sidelites !== "None" || d.transom ? <span style={{ color: ORANGE }}> (incl. sidelite/transom)</span> : ""} — <span style={{ color: "#666" }}>{dMats.casingDetail}</span></div>}
                </div>
              )}
              {d.wrapTrim && (() => {
                const wid = parseDim(d.netW || d.roughW), hgt = parseDim(d.netH || d.roughH), qty = parseInt(d.qty) || 1;
                const wrapLF = wid && hgt ? ((2*(wid+2)+(wid+2))/12*qty*WASTE_FACTOR).toFixed(1) : null;
                const wrapPcs = wid && hgt ? 3 * qty : null;
                const wrapColorDisplay = d.wrapColor === "Custom" ? d.wrapColorCustom : d.wrapColor;
                return (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: `${NAVY}08`, border: `1px solid ${NAVY}25`, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>METAL WRAP / COIL{wrapLF ? ` — ${wrapLF} LF, ${wrapPcs} pcs` : ""}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                      <div><label style={lbl}>Texture</label><select style={sel} value={d.wrapTexture} onChange={e => ud(d.id, "wrapTexture", e.target.value)}><option value="">-- Select --</option><option>Smooth</option><option>Textured</option></select></div>
                      <div>
                        <label style={lbl}>Color</label>
                        <select style={sel} value={d.wrapColor} onChange={e => ud(d.id, "wrapColor", e.target.value)}>{METAL_COLORS.map(c => <option key={c} value={c}>{c || "-- Select --"}</option>)}</select>
                        {d.wrapColor === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.wrapColorCustom || ""} onChange={e => ud(d.id, "wrapColorCustom", e.target.value)} placeholder="Custom color..." />}
                      </div>
                      {wrapLF && <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 16, padding: 8, background: "#fff", borderRadius: 6, border: `1px solid ${NAVY}15` }}>
                        <div><div style={{ fontSize: 10, color: "#666" }}>LF Needed</div><div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{wrapLF}</div></div>
                        <div><div style={{ fontSize: 10, color: "#666" }}>Pieces</div><div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{wrapPcs}</div></div>
                        {d.wrapTexture && <div><div style={{ fontSize: 10, color: "#666" }}>Type</div><div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{d.wrapTexture}</div></div>}
                        {wrapColorDisplay && <div><div style={{ fontSize: 10, color: "#666" }}>Color</div><div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{wrapColorDisplay}</div></div>}
                      </div>}
                    </div>
                  </div>
                );
              })()}
              {d.extTrim && (
                <div style={{ marginTop: 6, padding: "8px 10px", background: `${ORANGE}06`, border: `1px solid ${ORANGE}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 6 }}>EXTERIOR TRIM</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Brand</label>
                      <select style={{ ...sel, borderColor: d.extTrimBrand ? getTrimBrandColor(d.extTrimBrand) : GRAY_BORDER, borderWidth: d.extTrimBrand ? 2 : 1 }} value={d.extTrimBrand} onChange={e => ud(d.id, "extTrimBrand", e.target.value)}><option value="">-- Select --</option>{EXT_TRIM_BRANDS.map(b => <option key={b}>{b}</option>)}</select>
                      {d.extTrimBrand && d.extTrimBrand !== "Custom" && <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: getTrimBrandColor(d.extTrimBrand), background: getTrimBrandColor(d.extTrimBrand) + "18", padding: "2px 8px", borderRadius: 10, display: "inline-block" }}>{d.extTrimBrand}</div>}
                      {d.extTrimBrand === "Custom" && <input style={{ ...inp, marginTop: 4, fontSize: 12 }} value={d.extTrimBrandCustom || ""} onChange={e => ud(d.id, "extTrimBrandCustom", e.target.value)} placeholder="Brand name..." />}
                    </div>
                    <div><label style={lbl}>Size</label><select style={sel} value={d.extTrimSize} onChange={e => ud(d.id, "extTrimSize", e.target.value)}>{EXT_TRIM_SIZES.map(s => <option key={s} value={s}>{s || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Texture</label><select style={sel} value={d.extTrimTexture} onChange={e => ud(d.id, "extTrimTexture", e.target.value)}>{EXT_TRIM_TEXTURES.map(t => <option key={t} value={t}>{t || "-- Select --"}</option>)}</select></div>
                    <div><label style={lbl}>Color</label><input style={inp} value={d.extTrimColor || ""} onChange={e => ud(d.id, "extTrimColor", e.target.value)} placeholder="White, Cream..." /></div>
                  </div>
                  {dMats && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{dMats.extLF} LF — {dMats.extDetail}{dMats.sideliteExtra && <span style={{ color: ORANGE }}> ({dMats.sideliteExtra})</span>}</div>}
                </div>
              )}
              {dMats && (d.jamb || d.casing || d.extTrim || d.wrapTrim) && (() => {
                const jSize = d.jambSize === "Custom" ? d.jambSizeCustom : d.jambSize;
                const jCol = d.jambFinish === "Stained" ? (d.jambStainColor === "Custom" ? d.jambStainCustom : d.jambStainColor) : d.jambColor;
                const cCol = d.casingFinish === "Stained" ? (d.casingStainColor === "Custom" ? d.casingStainCustom : d.casingStainColor) : d.casingColor;
                const wid = parseDim(d.netW || d.roughW), hgt = parseDim(d.netH || d.roughH), qty = parseInt(d.qty) || 1;
                const wrapLF = wid && hgt ? ((2*(wid+2)+(wid+2))/12*qty*WASTE_FACTOR).toFixed(1) : null;
                const wrapPcs = wid && hgt ? 3 * qty : null;
                const wrapColorDisplay = d.wrapColor === "Custom" ? d.wrapColorCustom : d.wrapColor;
                const extBrand = d.extTrimBrand === "Custom" ? d.extTrimBrandCustom : d.extTrimBrand;
                return (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 8, fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: GREEN, marginBottom: 4, fontSize: 12 }}>Door Material Calc ({dMats.width}" x {dMats.height}" x {d.qty})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {d.jamb && <div><strong>Jamb Ext{jSize ? ` (${jSize})` : ""}:</strong> {dMats.jambLF} LF | {dMats.jambPcs} pcs{[d.jambSpecies, d.jambFinish, jCol].filter(Boolean).length ? <span style={{ color: NAVY }}> — {[d.jambSpecies, d.jambFinish, jCol].filter(Boolean).join(" / ")}</span> : ""}<br /><span style={{ color: "#666" }}>{dMats.jambDetail}</span></div>}
                      {d.casing && <div><strong>Int Casing:</strong> {dMats.casingLF} LF | {dMats.casingPcs} pcs{[d.casingSpecies, d.casingFinish, cCol].filter(Boolean).length ? <span style={{ color: NAVY }}> — {[d.casingSpecies, d.casingFinish, cCol].filter(Boolean).join(" / ")}</span> : ""}<br /><span style={{ color: "#666" }}>{dMats.casingDetail}</span></div>}
                      {d.extTrim && <div><strong>Ext Trim{d.extTrimSize ? ` (${d.extTrimSize}${d.extTrimTexture ? ` ${d.extTrimTexture}` : ""})` : ""}:</strong> {dMats.extLF} LF{extBrand ? <span style={{ color: getTrimBrandColor(d.extTrimBrand === "Custom" ? "Custom" : d.extTrimBrand), fontWeight: 700 }}> — {extBrand}</span> : ""}{d.extTrimColor ? <span style={{ color: "#555" }}> / {d.extTrimColor}</span> : ""}<br /><span style={{ color: "#666" }}>{dMats.extDetail}</span>{dMats.sideliteExtra && <><br /><span style={{ color: ORANGE }}>{dMats.sideliteExtra}</span></>}</div>}
                      {d.wrapTrim && wrapLF && <div><strong>Metal Wrap:</strong> {wrapLF} LF | {wrapPcs} pcs{d.wrapTexture ? <span style={{ color: "#666" }}> ({d.wrapTexture})</span> : ""}{wrapColorDisplay ? <span style={{ color: NAVY }}> — {wrapColorDisplay}</span> : ""}</div>}
                    </div>
                  </div>
                );
              })()}
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
        {(parseFloat(doorMatSum.jLF) > 0 || parseFloat(doorMatSum.cLF) > 0 || parseFloat(doorMatSum.eLF) > 0) && (
          <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: `2px solid ${GREEN}20` }}>
            <div style={{ ...sec, color: GREEN, borderColor: GREEN }}>Door Material Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 13 }}>
              {parseFloat(doorMatSum.jLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Door Jamb Ext</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{doorMatSum.jLF} LF</div><div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{doorMatSum.jP} stock pcs</div></div>}
              {parseFloat(doorMatSum.cLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Int Casing</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{doorMatSum.cLF} LF</div><div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{doorMatSum.cP} stock pcs</div></div>}
              {parseFloat(doorMatSum.eLF) > 0 && <div style={{ padding: 12, background: GRAY_BG, borderRadius: 8 }}><div style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>Ext Trim</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{doorMatSum.eLF} LF</div>{doorMatSum.slE && <div style={{ fontSize: 10, color: ORANGE, marginTop: 2 }}>{doorMatSum.slE}</div>}</div>}
            </div>
          </div>
        )}
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
