//styles
import styles from "./Home.module.css";

import { useEffect, useState } from "react";
import { useGemini } from "../../hooks/useGemini";
import { useJira } from "../../hooks/useJira";
import {
  BrowserCompatibility,
  PDFMetadata,
  extractPDFMetadata,
  extractTextFromPDF,
  generatePDFThumbnail,
  validatePDFFile,
} from "../../lib/pdf";
import { ActionItem } from "../../types/analysis";
import FileUploadArea from "./components/FileUploadArea";
import AnalysisResults from "./components/AnalysisResults";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<PDFMetadata | null>(null);
  const [browserCompatibility, setBrowserCompatibility] = useState<BrowserCompatibility>({
    dragDrop: false,
    fileReader: false,
    canvas: false,
  });

  const { callGemini, loading, error, response, resetState } = useGemini();
  const {
    createJiraTickets,
    loading: jiraLoading,
    error: jiraError,
    response: jiraResponse,
    resetState: resetJiraState,
  } = useJira();

  // Check browser compatibility on component mount
  useEffect(() => {
    setBrowserCompatibility({
      dragDrop: "draggable" in document.createElement("div") && "ondrop" in window,
      fileReader: typeof FileReader !== "undefined",
      canvas: !!document.createElement("canvas").getContext,
    });
  }, []);

  const processFile = async (file: File) => {
    if (!browserCompatibility.fileReader) {
      setExtractionError(
        "❌ Your browser doesn't support file reading. Please use a modern browser like Chrome, Firefox, or Safari."
      );
      return;
    }

    const validationError = validatePDFFile(file);
    if (validationError) {
      setExtractionError(validationError);
      return;
    }

    setSelectedFile(file);
    setExtractionError("");
    setIsExtracting(true);
    setExtractionProgress(0);
    setEstimatedTime("");
    setFilePreview(null);
    setFileMetadata(null);

    try {
      try {
        setFileMetadata(await extractPDFMetadata(file));
      } catch (metadataError) {
        console.warn("Metadata extraction failed:", metadataError);
      }

      try {
        if (browserCompatibility.canvas) {
          setFilePreview(await generatePDFThumbnail(file));
        }
      } catch (thumbnailError) {
        console.warn("Thumbnail generation failed:", thumbnailError);
      }

      const text = await extractTextFromPDF(file, (progress, estimate) => {
        setExtractionProgress(progress);
        setEstimatedTime(estimate);
      });
      setExtractedText(text);
    } catch (err) {
      console.error("PDF extraction error:", err);
      setExtractionError(
        "❌ Failed to extract text from PDF. The file may be corrupted or password-protected. Please try another file."
      );
      setExtractedText("");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      handleClear();
      return;
    }
    void processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!extractedText.trim()) {
      alert("Please upload a PDF file and wait for text extraction to complete.");
      return;
    }

    await callGemini(extractedText.trim());
  };

  const handlePushToJira = async (actionItems: ActionItem[]) => {
    await createJiraTickets(actionItems);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setExtractedText("");
    setExtractionError("");
    setFilePreview(null);
    setFileMetadata(null);
    setExtractionProgress(0);
    setEstimatedTime("");
    resetState();
    resetJiraState();

    const fileInput = document.getElementById("pdfFile") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleReplaceFile = () => {
    setSelectedFile(null);
    setExtractedText("");
    setExtractionError("");
    setFilePreview(null);
    setFileMetadata(null);
    setExtractionProgress(0);
    setEstimatedTime("");
    resetState();

    document.getElementById("pdfFile")?.click();
  };

  return (
    <div className={styles.container}>
      <h1>Policy Compass</h1>
      <p>Upload or paste your policy document to get AI-powered insights and analysis.</p>

      <FileUploadArea
        selectedFile={selectedFile}
        isDragOver={isDragOver}
        browserCompatibility={browserCompatibility}
        filePreview={filePreview}
        fileMetadata={fileMetadata}
        isExtracting={isExtracting}
        extractionProgress={extractionProgress}
        estimatedTime={estimatedTime}
        extractionError={extractionError}
        extractedText={extractedText}
        onFileChange={handleFileChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onReplaceFile={handleReplaceFile}
      />

      <div className={styles.buttonGroup}>
        <button onClick={handleAnalyzeClick} disabled={loading || isExtracting} className={styles.analyzeBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
            <path d="M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            <path d="M9 7h6"></path>
          </svg>
          {loading ? "Processing..." : "Analyze Document"}
        </button>
        <button onClick={handleClear} disabled={loading} className={styles.secondaryBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          </svg>
          Clear
        </button>
        <button onClick={() => window.print()} disabled={loading} className={styles.secondaryBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"></path>
            <path d="M6 14h12"></path>
            <path d="M6 18h12"></path>
          </svg>
          Export Report
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <AnalysisResults
          analysis={response}
          jiraResponse={jiraResponse}
          jiraError={jiraError}
          jiraLoading={jiraLoading}
          onPushToJira={handlePushToJira}
        />
      )}
    </div>
  );
}
