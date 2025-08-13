export const getWindow = (): Window =>
  (globalThis as any).cmsEditorWindow ?? globalThis.window;

export const utmKeysSet = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utmipage",
  "utmi_part",
  "utmi_campaign",
]);

const getSearchParams = () => {
  const searchParams = new URLSearchParams(getWindow().location.search);
  const paramsObject: { [key: string]: any } = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    paramsObject[key] = value;
  }

  return paramsObject;
};
export const getUTMParams = (params?: { [key: string]: string }) => {
  if (typeof window === "undefined") return {};
  const searchParams = params ?? getSearchParams();
  const utmParams: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (utmKeysSet.has(key)) {
      utmParams[key] = value;
    }
  }

  return utmParams;
};
