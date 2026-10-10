/** Ringkas user-agent menjadi "Browser (OS)", mis. "Chrome (Windows)". Cukup untuk audit, tanpa dependensi. */

const BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
  [/PostmanRuntime\//, 'Postman'],
  [/curl\//, 'curl'],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
];

const match = (ua: string, rules: [RegExp, string][]) => rules.find(([re]) => re.test(ua))?.[1];

export const describeDevice = (userAgent?: string | null) => {
  if (!userAgent) return null;
  const browser = match(userAgent, BROWSERS) || 'Lainnya';
  const os = match(userAgent, SYSTEMS);
  return os ? `${browser} (${os})` : browser;
};
