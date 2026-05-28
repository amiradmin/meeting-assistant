// src/constants/steelConstants.js

export const STEEL_TEMP_REFERENCES = {
  'ST37-2': { min: 1570, max: 1590, target: 1580 },
  'ST52-3': { min: 1590, max: 1610, target: 1600 },
  'CK45': { min: 1600, max: 1620, target: 1610 },
  '16MnCr5': { min: 1610, max: 1630, target: 1620 },
  '42CrMo4': { min: 1600, max: 1620, target: 1610 },
};

export const STEEL_ANALYSIS_LIMITS = {
  'ST37-2': {
    C: { min: 0.08, max: 0.12, target: 0.10 },
    Mn: { min: 0.40, max: 0.60, target: 0.50 },
    Si: { min: 0.15, max: 0.30, target: 0.22 },
    P: { min: 0, max: 0.035 },
    S: { min: 0, max: 0.035 }
  },
  'ST52-3': {
    C: { min: 0.12, max: 0.18, target: 0.15 },
    Mn: { min: 0.90, max: 1.20, target: 1.05 },
    Si: { min: 0.15, max: 0.35, target: 0.25 },
    P: { min: 0, max: 0.030 },
    S: { min: 0, max: 0.030 }
  },
  'CK45': {
    C: { min: 0.42, max: 0.50, target: 0.46 },
    Mn: { min: 0.50, max: 0.80, target: 0.65 },
    Si: { min: 0.15, max: 0.35, target: 0.25 },
    P: { min: 0, max: 0.025 },
    S: { min: 0, max: 0.025 }
  },
};