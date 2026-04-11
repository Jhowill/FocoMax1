export const uid = (prefix = "") => {
  const raw = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  return prefix ? `${prefix}_${raw}` : raw;
};
