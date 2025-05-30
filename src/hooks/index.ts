import { useEffect, useRef, useState } from 'react';

export function useScrollToBottom(ref: React.RefObject<HTMLDivElement | null>, dependencies: any[]) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, dependencies);
}
export const useFileHandling = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
    // Increase size limit for PDFs
    const maxSize = file.type === 'application/pdf' ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    
    if (file.size > maxSize) {
      alert(`File ${file.name} exceeds ${maxSize/1024/1024}MB limit`);
      return false;
    }
    return true;
    });
    setAttachments((prev: any) => [...prev, ...validFiles]);
  };

  return {
    attachments,
    setAttachments,
    fileInputRef,
    handleFiles
  };
};