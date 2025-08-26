export function digestTemplate(sectionsHtml: string) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">${sectionsHtml}</body></html>`;
}
