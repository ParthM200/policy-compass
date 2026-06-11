import styles from "../Home.module.css";
import { BrowserCompatibility, PDFMetadata, formatFileSize } from "../../../lib/pdf";

interface FileUploadAreaProps {
  selectedFile: File | null;
  isDragOver: boolean;
  browserCompatibility: BrowserCompatibility;
  filePreview: string | null;
  fileMetadata: PDFMetadata | null;
  isExtracting: boolean;
  extractionProgress: number;
  estimatedTime: string;
  extractionError: string;
  extractedText: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onReplaceFile: () => void;
}

export default function FileUploadArea({
  selectedFile,
  isDragOver,
  browserCompatibility,
  filePreview,
  fileMetadata,
  isExtracting,
  extractionProgress,
  estimatedTime,
  extractionError,
  extractedText,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onReplaceFile,
}: FileUploadAreaProps) {
  return (
    <div className={styles.inputSection}>
      {!browserCompatibility.fileReader && (
        <div className={styles.compatibilityWarning}>
          <strong>⚠️ Browser Compatibility Issue:</strong> Your browser doesn't support file reading. Please use a modern browser.
        </div>
      )}

      {!browserCompatibility.dragDrop && (
        <div className={styles.compatibilityWarning}>
          <strong>ℹ️ Limited Functionality:</strong> Drag and drop is not supported in your browser. You can still upload files using the file picker.
        </div>
      )}

      <label htmlFor="pdfFile" className={styles.label}>
        Upload your PDF policy document to analyze:
      </label>

      <div
        className={`${styles.fileUploadArea} ${isDragOver ? styles.dragOver : ""}`}
        onClick={() => document.getElementById("pdfFile")?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <div className={styles.uploadText}>
          {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
        </div>
        <div className={styles.uploadSubtext}>PDF files only, up to 10MB</div>
      </div>

      <input
        type="file"
        id="pdfFile"
        accept=".pdf"
        onChange={onFileChange}
        className={styles.fileInput}
      />

      {selectedFile && (
        <div className={styles.fileInfo}>
          <div className={styles.fileHeader}>
            <p>Selected: {selectedFile.name}</p>
            {filePreview && (
              <div className={styles.filePreview}>
                <img src={filePreview} alt="PDF Preview" className={styles.thumbnail} />
                <div className={styles.fileDetails}>
                  <span className={styles.fileType}>PDF Document</span>
                  <span className={styles.fileSize}>
                    {fileMetadata?.fileSizeFormatted || formatFileSize(selectedFile.size)}
                  </span>
                  {fileMetadata && (
                    <div className={styles.metadataInfo}>
                      <span className={styles.pageCount}>{fileMetadata.pageCount} pages</span>
                      {fileMetadata.title !== "Untitled" && (
                        <span className={styles.documentTitle}>{fileMetadata.title}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {isExtracting && (
            <div className={styles.processingContainer}>
              <p className={styles.processing}>Extracting text from PDF...</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${extractionProgress}%` }}></div>
              </div>
              <div className={styles.progressInfo}>
                <span className={styles.progressPercentage}>{extractionProgress}%</span>
                {estimatedTime && <span className={styles.estimatedTime}>{estimatedTime}</span>}
              </div>
            </div>
          )}

          {extractionError && <p className={styles.error}>{extractionError}</p>}

          {extractedText && !isExtracting && (
            <div className={styles.fileActions}>
              <p className={styles.success}>
                ✓ Text extracted successfully ({extractedText.length} characters)
              </p>
              <button className={styles.replaceButton} onClick={onReplaceFile} title="Replace with a different PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
                Replace File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
