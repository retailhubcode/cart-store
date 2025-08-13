export const getDocument = (): Document =>
  (globalThis as any).cmsEditorDocument ?? globalThis.document;
