
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';

// Configure worker loader
GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs';

export const extractPDFText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf: PDFDocumentProxy = await getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      fullText += textContent.items
        .map(item => ('str' in item) ? item.str : '')
        .join(' ') + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${file.name}`);
  }
};