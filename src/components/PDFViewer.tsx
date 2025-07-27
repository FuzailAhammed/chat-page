import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker - use CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function PDFViewer({ file, currentPage = 1, onPageChange }: PDFViewerProps) {
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate PDF file
  const isValidPDF = (file: File) => {
    return file && file.type === 'application/pdf' && file.size > 0;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error details:', {
      error: error.message,
      stack: error.stack,
      worker: pdfjs.GlobalWorkerOptions.workerSrc,
      fileType: file?.type,
      fileSize: file?.size
    });
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    );
  }

  if (!isValidPDF(file)) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <p className="text-destructive">Invalid PDF file. Please upload a valid PDF document.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-foreground min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-foreground min-w-[50px] text-center">
            {zoom}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4">
        <div className="flex justify-center">
          <div 
            className={cn(
              "bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-200",
              "max-w-full"
            )}
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {isLoading && (
              <div className="w-[595px] h-[842px] flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading PDF...</p>
              </div>
            )}
            
            {error && (
              <div className="w-[595px] h-[842px] flex items-center justify-center bg-gray-100">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {file && !error && (
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="w-[595px] h-[842px] flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Loading PDF...</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom / 100}
                  loading={
                    <div className="w-[595px] h-[842px] flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Loading page...</p>
                    </div>
                  }
                />
              </Document>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}