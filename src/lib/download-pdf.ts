export async function downloadReportAsPdf(html: string, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Hidden iframe renders the full HTML document faithfully
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:794px;height:1px;border:none;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("iframe load timeout")), 15000);
      iframe.onload = () => { clearTimeout(timer); resolve(); };
      iframe.srcdoc = html;
    });

    const doc = iframe.contentDocument;
    if (!doc) throw new Error("iframe document not accessible");

    // Expand iframe to full content height so nothing is clipped
    const scrollH = doc.documentElement.scrollHeight;
    iframe.style.height = `${scrollH}px`;

    const canvas = await html2canvas(doc.documentElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0d0d0d",
      windowWidth: 794,
      windowHeight: scrollH,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });

    // A4 in px at 96 dpi: 794 × 1123
    const PAGE_W = 794;
    const PAGE_H = 1123;
    const pdf = new jsPDF({ unit: "px", format: [PAGE_W, PAGE_H], orientation: "portrait", compress: true });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const totalPages = Math.ceil(canvas.height / (canvas.width * (PAGE_H / PAGE_W)));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "portrait");
      // Place full-width image starting at negative y-offset per page
      const scaledH = (canvas.height / canvas.width) * PAGE_W;
      pdf.addImage(imgData, "JPEG", 0, -i * PAGE_H, PAGE_W, scaledH, undefined, "FAST");
    }

    // Trigger direct download — no dialog
    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
