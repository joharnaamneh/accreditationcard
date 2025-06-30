// card-editor.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Accreditation } from '../shared/models/accreditation.model';

export interface PlaceholderElement {
  id: string;
  type: 'text' | 'date' | 'dropdown' | 'multiselect' | 'image';
  dataKey: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  maxLength?: number;
  options?: string[]; // für dropdown/multiselect
  side: 'front' | 'back';
}

export interface CardFormat {
  name: string;
  width: number; // in mm
  height: number; // in mm
}

@Component({
  selector: 'app-card-editor',
  standalone: false,
  templateUrl: './card-editor.component.html',
  styleUrls: ['./card-editor.component.scss']
})
export class CardEditorComponent implements OnInit {
  @Input() cardData!: Accreditation;
  @Output() cardUpdated = new EventEmitter<{html: string, css: string}>();
  @Output() dataUpdated = new EventEmitter<Accreditation>();

  // Template-Management
  currentSide: 'front' | 'back' = 'front';
  placeholderElements: PlaceholderElement[] = [];
  selectedElement: PlaceholderElement | null = null;

  // Format-Management
  availableFormats: CardFormat[] = [
    { name: 'A4 Hochformat', width: 210, height: 297 },
    { name: 'A4 Querformat', width: 297, height: 210 },
    { name: 'A5 Hochformat', width: 148, height: 210 },
    { name: 'A5 Querformat', width: 210, height: 148 },
    { name: 'A6 Hochformat', width: 105, height: 148 },
    { name: 'A6 Querformat', width: 148, height: 105 }
  ];
  selectedFormat: CardFormat = this.availableFormats[3]; // A5 Querformat as default

  // Preview-Management
  showPreview = false;

  // Drag & Drop
  isDragging = false;
  draggedElementType: string = '';

  // Element Moving
  isMovingElement = false;
  movingElement: PlaceholderElement | null = null;
  moveStartPos = { x: 0, y: 0, elementX: 0, elementY: 0 };

  // Verfügbare Datentypen
  availableDataTypes = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'date', label: 'Datum', icon: '📅' },
    { type: 'dropdown', label: 'Dropdown', icon: '📋' },
    { type: 'multiselect', label: 'Multiselect', icon: '☑️' },
    { type: 'image', label: 'Bild', icon: '🖼️' }
  ];

  // Verfügbare JSON-Keys (werden aus cardData extrahiert)
  availableKeys: string[] = [];

  ngOnInit() {
    this.extractAvailableKeys();
    this.initializeDefaultPlaceholders();
  }

  extractAvailableKeys() {
    if (this.cardData) {
      this.availableKeys = Object.keys(this.cardData);
    }
  }

  initializeDefaultPlaceholders() {
    // Standard-Platzhalter für Vorderseite
    this.placeholderElements = [
      {
        id: 'name',
        type: 'text',
        dataKey: 'name',
        label: 'Name',
        x: 50,
        y: 100,
        width: 200,
        height: 30,
        fontSize: 16,
        side: 'front'
      },
      {
        id: 'rank',
        type: 'text',
        dataKey: 'rank',
        label: 'Rang',
        x: 50,
        y: 60,
        width: 150,
        height: 25,
        fontSize: 14,
        side: 'front'
      },
      {
        id: 'photo',
        type: 'image',
        dataKey: 'imageUrl',
        label: 'Foto',
        x: 280,
        y: 50,
        width: 80,
        height: 100,
        side: 'front'
      },
      {
        id: 'zones',
        type: 'multiselect',
        dataKey: 'zones',
        label: 'Zonen',
        x: 50,
        y: 200,
        width: 300,
        height: 40,
        side: 'front'
      }
    ];
  }

  // Format-Management
  onFormatChange() {
    // Optionally adjust existing elements if they're outside new bounds
  }

  // Preview-Management
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  // Drag & Drop Events
  onDragStart(elementType: string) {
    this.isDragging = true;
    this.draggedElementType = elementType;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.isDragging) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.addPlaceholder(this.draggedElementType, x, y);
    this.isDragging = false;
  }

  // Element Moving Events
  onElementMouseDown(event: MouseEvent, element: PlaceholderElement) {
    event.preventDefault();
    event.stopPropagation();

    this.isMovingElement = true;
    this.movingElement = element;
    this.selectedElement = element;

    this.moveStartPos = {
      x: event.clientX,
      y: event.clientY,
      elementX: element.x,
      elementY: element.y
    };

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isMovingElement || !this.movingElement) return;

    const deltaX = event.clientX - this.moveStartPos.x;
    const deltaY = event.clientY - this.moveStartPos.y;

    this.movingElement.x = Math.max(0, this.moveStartPos.elementX + deltaX);
    this.movingElement.y = Math.max(0, this.moveStartPos.elementY + deltaY);

    this.updateElement();
  }

  onMouseUp() {
    this.isMovingElement = false;
    this.movingElement = null;

    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  addPlaceholder(type: string, x: number, y: number) {
    const newElement: PlaceholderElement = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      dataKey: this.availableKeys[0] || 'name',
      label: `Neuer ${type}`,
      x: x,
      y: y,
      width: type === 'image' ? 80 : 150,
      height: type === 'image' ? 80 : 30,
      fontSize: 14,
      side: this.currentSide
    };

    this.placeholderElements.push(newElement);
    this.selectedElement = newElement;
  }

  selectElement(element: PlaceholderElement) {
    this.selectedElement = element;
  }

  deleteElement(element: PlaceholderElement) {
    this.placeholderElements = this.placeholderElements.filter(el => el.id !== element.id);
    if (this.selectedElement?.id === element.id) {
      this.selectedElement = null;
    }
  }

  updateElement() {
    if (this.selectedElement) {
      const index = this.placeholderElements.findIndex(el => el.id === this.selectedElement!.id);
      if (index !== -1) {
        this.placeholderElements[index] = { ...this.selectedElement };
      }
    }
  }

  // Seitenwechseln
  switchSide(side: 'front' | 'back') {
    this.currentSide = side;
    this.selectedElement = null;
  }

  getCurrentSideElements() {
    return this.placeholderElements.filter(el => el.side === this.currentSide);
  }

  // Text-Optimierung basierend auf Container-Größe
  calculateOptimalFontSize(text: string, containerWidth: number, containerHeight: number): number {
    const baseSize = 14;
    const textLength = text.length;
    const widthFactor = containerWidth / (textLength * 0.6); // Approximation
    const heightFactor = containerHeight / 1.2;
    return Math.min(Math.max(Math.min(widthFactor, heightFactor), 8), 24);
  }

  // Multiselect Logik
  getMultiselectDisplay(dataKey: string, options: string[]): string {
    const cardValue = (this.cardData as any)[dataKey];
    if (Array.isArray(cardValue)) {
      return cardValue.filter(val => options.includes(val)).join(', ');
    }
    return '';
  }

  // HTML/CSS Generierung
  generateCardHTML(): string {
    const frontElements = this.placeholderElements.filter(el => el.side === 'front');
    const backElements = this.placeholderElements.filter(el => el.side === 'back');

    return `
      <div class="custom-card-container" style="width:${this.selectedFormat.width}mm;height:${this.selectedFormat.height}mm;">
        <div class="card-side front">
          ${this.generateElementsHTML(frontElements)}
        </div>
        <div class="card-side back">
          ${this.generateElementsHTML(backElements)}
        </div>
      </div>
    `;
  }

  generateElementsHTML(elements: PlaceholderElement[]): string {
    return elements.map(el => {
      const value = this.getElementValue(el);
      const fontSize = el.fontSize || this.calculateOptimalFontSize(value, el.width, el.height);

      if (el.type === 'image') {
        return `<img src="${value}" alt="${el.label}" style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;object-fit:cover;" onerror="this.style.display='none'"/>`;
      }

      return `<div class="placeholder-element" style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;font-size:${fontSize}px;overflow:hidden;text-overflow:ellipsis;">${value}</div>`;
    }).join('');
  }

  getElementValue(element: PlaceholderElement): string {
    const value = (this.cardData as any)[element.dataKey];

    if (element.type === 'multiselect' && Array.isArray(value)) {
      return value.join(', ');
    }

    if (element.type === 'date' && value) {
      return new Date(value).toLocaleDateString('de-CH');
    }

    return value || '';
  }

  generateCardCSS(): string {
    return `
      .custom-card-container {
        width: ${this.selectedFormat.width}mm;
        height: ${this.selectedFormat.height}mm;
        position: relative;
        background: white;
        border: 1px solid #ddd;
        margin: 20px;
        box-sizing: border-box;
      }

      .card-side {
        width: 100%;
        height: 100%;
        position: relative;
        page-break-after: always;
      }

      .card-side.back {
        display: none;
      }

      .placeholder-element {
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        padding: 2px;
        background: rgba(255, 255, 255, 0.9);
        font-family: Arial, sans-serif;
        word-wrap: break-word;
        line-height: 1.2;
      }

      @media print {
        .custom-card-container {
          margin: 0;
          border: none;
        }
        .card-side.back {
          display: block;
        }
        .placeholder-element {
          border: none;
          background: transparent;
        }
      }
    `;
  }

  // Export-Funktionen
  exportTemplate() {
    const html = this.generateCardHTML();
    const css = this.generateCardCSS();
    this.cardUpdated.emit({ html, css });
  }

  saveTemplate() {
    const template = {
      placeholders: this.placeholderElements,
      cardData: this.cardData,
      format: this.selectedFormat
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'card-template.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  loadTemplate(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          this.placeholderElements = template.placeholders || [];
          if (template.cardData) {
            this.cardData = template.cardData;
            this.dataUpdated.emit(this.cardData);
          }
          if (template.format) {
            this.selectedFormat = template.format;
          }
        } catch (error) {
          alert('Fehler beim Laden der Template-Datei');
        }
      };
      reader.readAsText(file);
    }
  }
}
