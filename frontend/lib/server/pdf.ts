import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";

type PdfDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<{
    getTextContent(): Promise<{
      items: Array<{ str?: string }>;
    }>;
  }>;
};

export class PdfReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfReadError";
  }
}

export async function extractPdfText(fileBytes: Buffer, maxPages = 3) {
  let pdf: PdfDocument;

  try {
    const loadingTask = getDocument({ data: new Uint8Array(fileBytes), disableWorker: true } as unknown as Parameters<typeof getDocument>[0]);
    pdf = await loadingTask.promise as PdfDocument;
  } catch (error) {
    console.error("PDF_PARSE_ERROR", error instanceof Error ? { name: error.name, message: error.message } : { message: "unknown" });
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("password") || message.includes("encrypted")) {
      throw new PdfReadError("PASSWORD_PROTECTED_PDF");
    }
    throw new PdfReadError("CORRUPTED_PDF");
  }

  if (pdf.numPages > maxPages) {
    throw new PdfReadError("TOO_MANY_PAGES");
  }

  const chunks: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    chunks.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }

  const text = chunks.join("\n").trim();
  if (text.length < 120) {
    throw new PdfReadError("NO_EXTRACTABLE_TEXT");
  }

  const confidence = Math.min(0.98, Math.max(0.55, text.length / 3500));
  return {
    text,
    page_count: pdf.numPages,
    extraction_confidence: Math.round(confidence * 100) / 100,
    is_scanned: false,
    warnings: [] as string[],
  };
}
