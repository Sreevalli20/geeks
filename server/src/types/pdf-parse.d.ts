declare module 'pdf-parse' {
  export interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  export default function pdf(data: Buffer, options?: any): Promise<PDFData>;
}
