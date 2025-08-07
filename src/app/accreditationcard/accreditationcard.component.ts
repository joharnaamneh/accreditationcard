//accreditationcard.component.ts
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { AccreditationData, FUNCTION_COLORS } from '../shared/models/accreditation.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CardFormat {
  name: string;
  width: number; // in mm
  height: number; // in mm
}

@Component({
  selector: 'app-accreditation-card',
  standalone: false,
  templateUrl: './accreditationcard.component.html',
  styleUrl: './accreditationcard.component.scss'
})
export class AccreditationCardComponent {
  @Input() data!: AccreditationData;
  @Input() cardFormat?: CardFormat;
  @ViewChild('cardWrapper', { static: false }) cardWrapper!: ElementRef;

  constructor() {
    // Set default format if none provided
    if (!this.cardFormat) {
      this.cardFormat = { name: 'A5 Landscape', width: 148, height: 105 };
    }
  }

  getFunctionColor(): string {
    return FUNCTION_COLORS[this.data.function] || '#6c757d';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-CH');
    } catch {
      return dateString;
    }
  }

  // Calculate optimal font size based on text length and container size
  calculateOptimalFontSize(text: string, containerWidth: number, containerHeight: number): number {
    if (!text || containerWidth <= 0 || containerHeight <= 0) return 14;

    const textLength = text.length;
    const avgCharWidth = 0.6; // Average character width relative to font size
    const lineHeight = 1.2;

    // Calculate based on width
    const widthBasedFontSize = (containerWidth * 0.9) / (textLength * avgCharWidth);

    // Calculate based on height (single line)
    const heightBasedFontSize = (containerHeight * 0.8) / lineHeight;

    const calculatedSize = Math.min(widthBasedFontSize, heightBasedFontSize);
    return Math.min(Math.max(calculatedSize, 8), 24); // Min 8px, max 24px
  }

  // Truncate text with ellipsis
  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  async exportAsPDF(): Promise<void> {
    try {
      const cardElement = this.cardWrapper.nativeElement;
      if (!cardElement) {
        console.error('Card element not found');
        return;
      }

      // Create canvas from the card element with higher resolution
      const canvas = await html2canvas(cardElement, {
        scale: 3, // Higher resolution for better PDF quality
        useCORS: true,
        backgroundColor: '#ffffff',
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: this.cardFormat!.width > this.cardFormat!.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [this.cardFormat!.width, this.cardFormat!.height]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add front side
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // For double-sided cards, add back side on new page
      const backSide = cardElement.querySelector('.card-side.back') as HTMLElement;
      if (backSide) {
        const backCanvas = await html2canvas(backSide, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: backSide.offsetWidth,
          height: backSide.offsetHeight,
          logging: false
        });

        const backImgData = backCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(backImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      // Generate filename
      const fileName = `${this.data.name.replace(/\s+/g, '_')}_${this.data.function}_card.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }

  exportAsImage(): void {
    const cardElement = this.cardWrapper.nativeElement;
    if (!cardElement) {
      console.error('Card element not found');
      return;
    }

    html2canvas(cardElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    }).then(canvas => {
      // Create download link
      const link = document.createElement('a');
      link.download = `${this.data.name.replace(/\s+/g, '_')}_${this.data.function}_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(error => {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    });
  }

  printCard(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardHTML = this.cardWrapper.nativeElement?.outerHTML || '';

    // Get all relevant styles
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Accreditation Card - ${this.data.name}</title>
      <style>
        ${styles}

        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .card-container {
          display: block;
          page-break-inside: avoid;
        }

        .card-side {
          page-break-inside: avoid;
          margin-bottom: 1rem;
        }

        .card-side.back {
          page-break-before: always;
        }

        @media print {
          body { margin: 0; padding: 0; }
          .card-container { margin: 0; }
          .card-side {
            width: ${this.cardFormat!.width}mm !important;
            height: ${this.cardFormat!.height}mm !important;
            margin: 0;
            box-shadow: none;
            border: 1px solid #000;
          }
          .card-header, .back-header {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .zone-badge, .transport-item, .meal-item {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      ${cardHTML}
    </body>
    </html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  }

  // Helper method for batch printing multiple cards
  static async printMultipleCards(cards: AccreditationData[], format: CardFormat): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let cardsHTML = '';

    // Generate HTML for all cards
    for (const card of cards) {
      // This would need to be implemented to generate card HTML from data
      // For now, this is a placeholder for the batch printing functionality
      cardsHTML += `<div class="card-page"><!-- Card for ${card.name} --></div>`;
    }

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Accreditation Cards - Batch Print</title>
      <style>
        body { margin: 0; padding: 0; }
        .card-page {
          width: ${format.width}mm;
          height: ${format.height}mm;
          page-break-after: always;
          page-break-inside: avoid;
        }
        .card-page:last-child {
          page-break-after: auto;
        }
        @media print {
          .card-page {
            margin: 0;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      ${cardsHTML}
    </body>
    </html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  }
}
