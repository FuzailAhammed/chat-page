import { useState } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { ChatInterface } from '@/components/ChatInterface';
import { PDFViewer } from '@/components/PDFViewer';
import { useToast } from '@/hooks/use-toast';

export default function PDFChat() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadedFile(file);
          toast({
            title: "PDF uploaded successfully!",
            description: "You can now start chatting about your document.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handlePageNavigate = (page: number) => {
    setCurrentPage(page);
  };

  if (!uploadedFile) {
    return (
      <PDFUpload
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Panel */}
      <div className="w-1/3 min-w-[400px] border-r border-border">
        <ChatInterface
          fileName={uploadedFile.name}
          onPageNavigate={handlePageNavigate}
        />
      </div>

      {/* PDF Viewer */}
      <div className="flex-1">
        <PDFViewer
          file={uploadedFile}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}