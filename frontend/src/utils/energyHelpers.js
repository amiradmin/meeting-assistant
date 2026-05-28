// utils/energyHelpers.js

/**
 * Get energy percent from raw energy value.
 * Assume asset.energy_actual and asset.energy_max exist.
 * Returns a percentage 0-100
 */
export const getEnergyPercent = (asset) => {
  if (!asset) return 0;
  const actual = asset.energy_actual || 0;
  const max = asset.energy_max || 100; // default max to 100 if not provided
  return Math.min(Math.max((actual / max) * 100, 0), 100);
};

/**
 * Determine status based on energy percent
 * Returns object: { label, color, icon }
 */
export const getEnergyStatus = (percent) => {
  if (percent <= 60) {
    return { label: "مصرف کم", color: "#2ecc71", icon: "safe" };
  } else if (percent <= 85) {
    return { label: "مصرف متوسط", color: "#f39c12", icon: "warning" };
  } else {
    return { label: "مصرف زیاد", color: "#e74c3c", icon: "critical" };
  }
};

/**
 * Calculate summary statistics for Energy assets
 * Returns { totalAssets, low, medium, high, efficiencyPercent }
 */
export const calculateEnergySummary = (assets) => {
  const totalAssets = assets.length;

  const low = assets.filter(a => getEnergyPercent(a) <= 60).length;
  const medium = assets.filter(a => getEnergyPercent(a) > 60 && getEnergyPercent(a) <= 85).length;
  const high = assets.filter(a => getEnergyPercent(a) > 85).length;

  const efficiencyPercent = totalAssets > 0 ? Math.round((low / totalAssets) * 100) : 0;

  return { totalAssets, low, medium, high, efficiencyPercent };
};
