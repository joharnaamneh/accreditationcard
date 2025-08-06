// accreditationcard.component.ts
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { AccreditationData, FUNCTION_COLORS } from '../shared/models/accreditation.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-accreditation-card',
  standalone: false,
  templateUrl: './accreditationcard.component.html',
  styleUrl: './accreditationcard.component.scss'
})
export class AccreditationCardComponent {
  @Input() data!: AccreditationData;
  @ViewChild('cardWrapper', { static: false }) cardWrapper!: ElementRef;

  getFunctionColor(): string {
    return FUNCTION_COLORS[this.data.function] || '#6c757d';
  }

  async exportAsPDF(): Promise<void> {
    try {
      const cardElement = document.querySelector('.card-container') as HTMLElement;
      if (!cardElement) {
        console.error('Card element not found');
        return;
      }

      // Create canvas from the card element
      const canvas = await html2canvas(cardElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF in landscape mode to fit both sides
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit the card properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Generate filename
      const fileName = `${this.data.name.replace(/\s+/g, '_')}_${this.data.function}_card.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }

  exportAsImage(): void {
    const cardElement = document.querySelector('.card-container') as HTMLElement;
    if (!cardElement) {
      console.error('Card element not found');
      return;
    }

    html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
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

    const cardHTML = document.querySelector('.card-container')?.outerHTML || '';
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Accreditation Card - ${this.data.name}</title>
        <style>
          ${styles}
          body { margin: 20px; font-family: Arial, sans-serif; }
          @media print {
            body { margin: 0; }
            .card-container { gap: 1rem; }
          }
        </style>
      </head>
      <body>
        ${cardHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
