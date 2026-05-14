export async function downloadReportAsPdf(html: string, filename: string): Promise<void> {
  // Dynamically import html2pdf.js (browser-only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import("html2pdf.js")).default as any;

  // Extract <style> blocks and <body> content from the full HTML document
  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const combinedStyles = styleMatches.map((m) => m[1]).join("\n");

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  // Mount a temporary container outside viewport
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#0d0d0d;";

  const styleEl = document.createElement("style");
  styleEl.textContent = combinedStyles;
  container.appendChild(styleEl);

  const bodyEl = document.createElement("div");
  bodyEl.innerHTML = bodyContent;
  container.appendChild(bodyEl);

  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#0d0d0d",
          windowWidth: 794,
          scrollY: 0,
        },
        jsPDF: { unit: "px", format: "a4", orientation: "portrait", hotfixes: ["px_scaling"] },
        pagebreak: { mode: ["avoid-all", "css"] },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
