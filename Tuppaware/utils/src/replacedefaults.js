const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

export const replaceDefaults = (defaults = {}, overrides = {}) => {
  const base = isPlainObject(defaults) ? { ...defaults } : {};
  if (!isPlainObject(overrides)) return base;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    if (isPlainObject(base[key]) && isPlainObject(value)) {
      base[key] = replaceDefaults(base[key], value);
    } else {
      base[key] = value;
    }
  }

  return base;
};