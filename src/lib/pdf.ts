import * as pdfjsLib from "pdfjs-dist";

// Set up the worker for pdfjs-dist using the local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MIN_PDF_SIZE_BYTES = 1024; // 1KB

export interface BrowserCompatibility {
  dragDrop: boolean;
  fileReader: boolean;
  canvas: boolean;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
  fileSize: number;
  fileSizeFormatted: string;
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePDFFile(file: File): string | null {
  const isValidPDF =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.type === "application/octet-stream";

  if (!isValidPDF) {
    return "❌ Please select a PDF file. Other file types are not supported.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return `❌ File too large! Your file is ${formatFileSize(file.size)}. Maximum size allowed is 10MB.`;
  }

  if (file.size < MIN_PDF_SIZE_BYTES) {
    return "❌ File appears to be empty or corrupted. Please select a valid PDF file.";
  }

  return null;
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

async function loadPDFDocument(file: File) {
  const buffer = await readFileAsArrayBuffer(file);
  return pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
}

export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  const pdf = await loadPDFDocument(file);
  const { info } = (await pdf.getMetadata()) as { info: any };

  return {
    title: info?.Title || "Untitled",
    author: info?.Author || "Unknown",
    subject: info?.Subject || "",
    creator: info?.Creator || "",
    producer: info?.Producer || "",
    creationDate: info?.CreationDate
      ? new Date(info.CreationDate).toLocaleDateString()
      : "Unknown",
    modificationDate: info?.ModDate
      ? new Date(info.ModDate).toLocaleDateString()
      : "Unknown",
    pageCount: pdf.numPages,
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
  };
}

export async function generatePDFThumbnail(file: File): Promise<string> {
  const pdf = await loadPDFDocument(file);
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.5 });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context!,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
  return canvas.toDataURL("image/png");
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progressPercent: number, estimatedTimeRemaining: string) => void
): Promise<string> {
  const pdf = await loadPDFDocument(file);
  const totalPages = pdf.numPages;
  const startTime = Date.now();
  let fullText = "";

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";

    if (onProgress) {
      const progress = Math.round((pageNum / totalPages) * 100);
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const pagesPerSecond = elapsedSeconds > 0 ? pageNum / elapsedSeconds : 0;
      const remainingPages = totalPages - pageNum;
      const estimatedSeconds =
        pagesPerSecond > 0 ? Math.round(remainingPages / pagesPerSecond) : 0;

      onProgress(
        progress,
        estimatedSeconds > 0 ? `~${estimatedSeconds}s remaining` : ""
      );
    }
  }

  return fullText.trim();
}
