// card-editor.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AccreditationData } from '../shared/models/accreditation.model';

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

  // Additional properties that were missing
  multiSelectSeparator?: string;
  truncateMode?: 'ellipsis' | 'cut' | 'wrap';
  autoFontSize?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
  selected?: boolean;
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
  @Input() cardData!: AccreditationData;
  @Output() cardUpdated = new EventEmitter<{ html: string, css: string }>();
  @Output() dataUpdated = new EventEmitter<AccreditationData>();

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

  // Seitenwechsel
  switchSide(side: 'front' | 'back') {
    this.currentSide = side;
    this.selectedElement = null;
  }

  getCurrentSideElements() {
    return this.placeholderElements.filter(el => el.side === this.currentSide);
  }

// Text-Optimierung basierend auf Container-Größe
  calculateOptimalFontSize(text: string, containerWidth: number, containerHeight: number, minSize: number = 8, maxSize: number = 48): number {
    const baseSize = 14;
    const textLength = text.length;
    const widthFactor = containerWidth / (textLength * 0.6); // Approximation
    const heightFactor = containerHeight / 1.2;
    return Math.min(Math.max(Math.min(widthFactor, heightFactor), minSize), maxSize);
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
      <div class="custom-card-container" style="width: ${this.selectedFormat.width}mm; height: ${this.selectedFormat.height}mm;">
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
        return `
          <img src="${value}" alt="${el.label}"
               style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; object-fit: cover;"
               onerror="this.style.display='none'"/>
        `;
      }

      return `
        <div class="placeholder-element"
             style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; font-size: ${fontSize}px; overflow: hidden; text-overflow: ellipsis;">
          ${value}
        </div>
      `;
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
  // Additional methods to add to card-editor.component.ts

// Fix for options handling in multiselect/dropdown
  updateElementOptions(element: PlaceholderElement, optionsText: string): void {
    if (element.type === 'multiselect' || element.type === 'dropdown') {
      element.options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
      this.updateElement();
    }
  }

// Get options as comma-separated string for display
  getElementOptionsText(element: PlaceholderElement): string {
    return element.options ? element.options.join(', ') : '';
  }

// Set options from textarea input
  setElementOptions(element: PlaceholderElement, event: any): void {
    const optionsText = event.target.value;
    element.options = optionsText.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0);
    this.updateElement();
  }

// Format date value for display
  formatDateValue(value: any): string {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString('de-CH');
    } catch {
      return String(value);
    }
  }

// Handle image scaling
  scaleImageToFit(imgElement: HTMLImageElement, maxWidth: number, maxHeight: number): {width: number, height: number} {
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;

    if (imgWidth === 0 || imgHeight === 0) {
      return { width: maxWidth, height: maxHeight };
    }

    const widthRatio = maxWidth / imgWidth;
    const heightRatio = maxHeight / imgHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: imgWidth * ratio,
      height: imgHeight * ratio
    };
  }

// Enhanced element value getter with better formatting
  getElementValueFormatted(element: PlaceholderElement): string {
    const value = (this.cardData as any)[element.dataKey];

    if (!value) return element.label || '';

    switch (element.type) {
      case 'multiselect':
        if (Array.isArray(value)) {
          const separator = element.multiSelectSeparator || ', ';
          if (element.options && element.options.length > 0) {
            return value.filter(val => element.options!.includes(val)).join(separator);
          }
          return value.join(separator);
        }
        return String(value);

      case 'dropdown':
        return String(value);

      case 'date':
        return this.formatDateValue(value);

      case 'text':
        const text = String(value);
        if (element.maxLength && text.length > element.maxLength) {
          switch (element.truncateMode || 'ellipsis') {
            case 'cut':
              return text.substring(0, element.maxLength);
            case 'ellipsis':
              return text.substring(0, element.maxLength - 3) + '...';
            case 'wrap':
            default:
              return text;
          }
        }
        return text;

      case 'image':
        return value; // Return URL for images

      default:
        return String(value);
    }
  }

// Auto-resize font based on content and container
  autoResizeFont(element: PlaceholderElement): number {
    if (!element.autoFontSize) {
      return element.fontSize || 14;
    }
    const text = this.getElementValueFormatted(element);
    const minSize = element.minFontSize || 8;
    const maxSize = element.maxFontSize || 48;
    return this.calculateOptimalFontSize(text, element.width, element.height, minSize, maxSize);
  }

// Better canvas scaling for different formats
  getCanvasScale(): number {
    const baseWidth = 148; // A5 width in mm
    const scale = Math.min(3, Math.max(1, baseWidth / this.selectedFormat.width));
    return scale;
  }

// Snap to grid functionality
  snapToGrid(value: number, gridSize: number = 5): number {
    return Math.round(value / gridSize) * gridSize;
  }

// Apply snap to grid when moving elements
  onMouseMoveWithSnap(event: MouseEvent): void {
    if (!this.isMovingElement || !this.movingElement) return;

    const deltaX = event.clientX - this.moveStartPos.x;
    const deltaY = event.clientY - this.moveStartPos.y;

    const newX = this.snapToGrid(Math.max(0, this.moveStartPos.elementX + deltaX));
    const newY = this.snapToGrid(Math.max(0, this.moveStartPos.elementY + deltaY));

    // Keep element within canvas bounds
    const maxX = (this.selectedFormat.width * this.getCanvasScale()) - this.movingElement.width;
    const maxY = (this.selectedFormat.height * this.getCanvasScale()) - this.movingElement.height;

    this.movingElement.x = Math.min(newX, Math.max(0, maxX));
    this.movingElement.y = Math.min(newY, Math.max(0, maxY));

    this.updateElement();
  }

// Validate element placement
  validateElementPlacement(element: PlaceholderElement): boolean {
    const maxX = (this.selectedFormat.width * this.getCanvasScale()) - element.width;
    const maxY = (this.selectedFormat.height * this.getCanvasScale()) - element.height;

    if (element.x > maxX || element.y > maxY || element.x < 0 || element.y < 0) {
      return false;
    }

    return true;
  }

// Generate better card styles with responsive design
  generateResponsiveCardCSS(): string {
    return `
    .custom-card-container {
      width: ${this.selectedFormat.width}mm;
      height: ${this.selectedFormat.height}mm;
      position: relative;
      background: white;
      border: 1px solid #ddd;
      margin: 20px auto;
      box-sizing: border-box;
      font-family: 'Arial', sans-serif;
      overflow: hidden;
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
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      background: rgba(255, 255, 255, 0.9);
      font-family: Arial, sans-serif;
      word-wrap: break-word;
      line-height: 1.2;
      box-sizing: border-box;
      overflow: hidden;
    }

    .placeholder-element img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media print {
      .custom-card-container {
        margin: 0;
        border: none;
        box-shadow: none;
      }

      .card-side.back {
        display: block;
        page-break-before: always;
      }

      .placeholder-element {
        border: none !important;
        background: transparent !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      .placeholder-element * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }

    @media screen and (max-width: 768px) {
      .custom-card-container {
        width: 100%;
        height: auto;
        aspect-ratio: ${this.selectedFormat.width}/${this.selectedFormat.height};
      }
    }
  `;
  }

// Enhanced template export with better error handling
  exportTemplateEnhanced(): void {
    try {
      const html = this.generateCardHTML();
      const css = this.generateResponsiveCardCSS();

      // Validate template before export
      if (this.placeholderElements.length === 0) {
        alert('No elements to export. Please add some elements first.');
        return;
      }

      // Check if all elements are within bounds
      const invalidElements = this.placeholderElements.filter(el => !this.validateElementPlacement(el));
      if (invalidElements.length > 0) {
        const proceed = confirm(`${invalidElements.length} elements are outside the canvas bounds. Export anyway?`);
        if (!proceed) return;
      }

      this.cardUpdated.emit({ html, css });

      // Show success message
      const toast = document.createElement('div');
      toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
      toast.textContent = 'Template applied successfully!';
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);

    } catch (error) {
      console.error('Error exporting template:', error);
      alert('Error exporting template. Please try again.');
    }
  }

// Batch operations for elements
// Batch operations for elements
  selectAllElements(): void {
    // Implementation for selecting all elements
    this.getCurrentSideElements().forEach(el => {
      (el as any).selected = true;
    });
  }

  deleteSelectedElements(): void {
    const elementsToDelete = this.placeholderElements.filter(el => (el as any).selected);
    if (elementsToDelete.length === 0) return;

    if (confirm(`Delete ${elementsToDelete.length} selected elements?`)) {
      elementsToDelete.forEach(el => this.deleteElement(el));
      this.selectedElement = null;
    }
  }

  alignElements(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const selectedElements = this.getCurrentSideElements().filter(el => (el as any).selected || el === this.selectedElement);
    if (selectedElements.length < 2) return;

    switch (alignment) {
      case 'left':
        const minX = Math.min(...selectedElements.map(el => el.x));
        selectedElements.forEach(el => el.x = minX);
        break;
      case 'right':
        const maxX = Math.max(...selectedElements.map(el => el.x + el.width));
        selectedElements.forEach(el => el.x = maxX - el.width);
        break;
      case 'center':
        const centerX = selectedElements.reduce((sum, el) => sum + el.x + el.width/2, 0) / selectedElements.length;
        selectedElements.forEach(el => el.x = centerX - el.width/2);
        break;
      case 'top':
        const minY = Math.min(...selectedElements.map(el => el.y));
        selectedElements.forEach(el => el.y = minY);
        break;
      case 'bottom':
        const maxY = Math.max(...selectedElements.map(el => el.y + el.height));
        selectedElements.forEach(el => el.y = maxY - el.height);
        break;
      case 'middle':
        const centerY = selectedElements.reduce((sum, el) => sum + el.y + el.height/2, 0) / selectedElements.length;
        selectedElements.forEach(el => el.y = centerY - el.height/2);
        break;
    }

    this.updateElement();
  }

// Keyboard shortcuts handler
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (!this.selectedElement) return;

    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.selectedElement.x = Math.max(0, this.selectedElement.x - step);
        this.updateElement();
        break;
      case 'ArrowRight':
        event.preventDefault();
        const maxX = (this.selectedFormat.width * this.getCanvasScale()) - this.selectedElement.width;
        this.selectedElement.x = Math.min(maxX, this.selectedElement.x + step);
        this.updateElement();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedElement.y = Math.max(0, this.selectedElement.y - step);
        this.updateElement();
        break;
      case 'ArrowDown':
        event.preventDefault();
        const maxY = (this.selectedFormat.height * this.getCanvasScale()) - this.selectedElement.height;
        this.selectedElement.y = Math.min(maxY, this.selectedElement.y + step);
        this.updateElement();
        break;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        this.deleteElement(this.selectedElement);
        break;
    }
  }

// Copy/Paste functionality
  copyElement(element: PlaceholderElement): void {
    const elementCopy = JSON.parse(JSON.stringify(element));
    elementCopy.id = `${element.type}_${Date.now()}`;
    elementCopy.x += 20;
    elementCopy.y += 20;
    elementCopy.label = `${element.label} (Copy)`;

    this.placeholderElements.push(elementCopy);
    this.selectedElement = elementCopy;
  }

// Layer management
  bringToFront(element: PlaceholderElement): void {
    const index = this.placeholderElements.indexOf(element);
    if (index > -1) {
      this.placeholderElements.splice(index, 1);
      this.placeholderElements.push(element);
    }
  }

  sendToBack(element: PlaceholderElement): void {
    const index = this.placeholderElements.indexOf(element);
    if (index > -1) {
      this.placeholderElements.splice(index, 1);
      this.placeholderElements.unshift(element);
    }
  }

// Undo/Redo functionality (basic implementation)
  private history: PlaceholderElement[][] = [];
  private historyIndex = -1;

  saveToHistory(): void {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.placeholderElements)));
    this.historyIndex = this.history.length - 1;

    // Limit history to 50 steps
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.placeholderElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.selectedElement = null;
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.placeholderElements = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.selectedElement = null;
    }
  }
}
