declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[]);
    text(text: string, x: number, y: number, options?: any): void;
    setFontSize(size: number): void;
    setTextColor(r: number, g?: number, b?: number): void;
    setFillColor(r: number, g?: number, b?: number): void;
    setDrawColor(r: number, g?: number, b?: number): void;
    setLineWidth(width: number): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    addPage(): void;
    save(filename: string): void;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
    setFont(fontName?: string, fontStyle?: string): void;
    splitTextToSize(text: string, maxWidth: number): string[];
  }
}

declare module 'html2canvas' {
  export default function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}