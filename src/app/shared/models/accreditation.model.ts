// shared/models/accreditation.model.ts
export interface AccreditationCard {
  id?: number;
  uuid: string;
  jsonTemplate: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Interface for the parsed JSON template data
export interface AccreditationData {
  name: string;
  rank: string;
  country_code: string;
  country: string;
  role: string;
  discipline: string;
  subdiscipline: string;
  accreditation: string;
  function: 'athlete' | 'official' | 'media' | 'vip' | 'staff' | 'delegate';
  zones: string[];
  imageUrl: string;
  qr_sbb: string;
  qr_event: string;
  eventImageUrl: string;
  cardId: string;
  // Extended fields
  birthDate?: string;
  nationality?: string;
  accommodation?: string;
  vehicleAccess?: string[];
  validFrom?: string;
  validUntil?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  specialAccess?: string[];
  availableZones?: string[];
  transportOptions?: string[];
  mealCategories?: string[];
}

export const FUNCTION_COLORS = {
  athlete: '#28a745',    // Green
  official: '#007bff',   // Blue
  media: '#ffc107',      // Yellow
  vip: '#dc3545',        // Red
  staff: '#6c757d',      // Gray
  delegate: '#17a2b8'    // Teal
};

// Template System Interfaces
export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  placeholders: PlaceholderElement[];
  format: 'A5' | 'A4' | 'CUSTOM';
  customWidth?: number;
  customHeight?: number;
  doubleSided: boolean;
}

export interface PlaceholderElement {
  id: string;
  type: 'text' | 'date' | 'dropdown' | 'multiselect' | 'image' | 'qr' | 'barcode';
  dataKey: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  maxLength?: number;
  truncateMode?: 'ellipsis' | 'cut' | 'wrap';
  options?: string[]; // für dropdown/multiselect
  multiSelectSeparator?: string;
  side: 'front' | 'back';
  // Auto-Sizing Options
  autoFontSize?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
  autoWidth?: boolean;
  autoHeight?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

// Utility functions for the template system
export class TemplateUtils {
  // Calculate optimal font size based on text and container
  static calculateOptimalFontSize(
    text: string,
    containerWidth: number,
    containerHeight: number,
    minFontSize: number = 8,
    maxFontSize: number = 48
  ): number {
    if (!text || containerWidth <= 0 || containerHeight <= 0) return minFontSize;

    const textLength = text.length;
    const avgCharWidth = 0.6; // Average character width relative to font size
    const lineHeight = 1.2;

    // Calculation based on width
    const widthBasedFontSize = (containerWidth * 0.9) / (textLength * avgCharWidth);

    // Calculation based on height (single line)
    const heightBasedFontSize = (containerHeight * 0.8) / lineHeight;

    const calculatedSize = Math.min(widthBasedFontSize, heightBasedFontSize);
    return Math.min(Math.max(calculatedSize, minFontSize), maxFontSize);
  }

  // Format multiselect values
  static formatMultiSelectValue(value: any, options: string[] = [], separator: string = ','): string {
    if (!value) return '';
    if (Array.isArray(value)) {
      const selectedValues = value.filter(val => options.length === 0 || options.includes(val));
      return selectedValues.join(separator);
    }
    return String(value);
  }

  // Format date values
  static formatDateValue(value: any, locale: string = 'de-CH'): string {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString(locale);
    } catch {
      return String(value);
    }
  }

  // Truncate text based on mode
  static truncateText(text: string, maxLength: number, mode: 'ellipsis' | 'cut' | 'wrap' = 'ellipsis'): string {
    if (!text || text.length <= maxLength) return text;

    switch (mode) {
      case 'cut':
        return text.substring(0, maxLength);
      case 'ellipsis':
        return text.substring(0, maxLength - 3) + '...';
      case 'wrap':
        // For wrap we'd use CSS, here just return the full text
        return text;
      default:
        return text;
    }
  }

  // Scale image dimensions proportionally
  static calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: originalWidth * ratio,
      height: originalHeight * ratio
    };
  }

  // Parse JSON template safely
  static parseJsonTemplate(jsonTemplate: string): AccreditationData | null {
    try {
      return JSON.parse(jsonTemplate);
    } catch (error) {
      console.error('Error parsing JSON template:', error);
      return null;
    }
  }

  // Create a default template structure
  static createDefaultTemplate(): AccreditationData {
    return {
      name: 'New Card',
      rank: '',
      country_code: '',
      country: '',
      role: '',
      discipline: '',
      subdiscipline: '',
      accreditation: '',
      function: 'athlete',
      zones: [],
      imageUrl: '',
      qr_sbb: '',
      qr_event: '',
      eventImageUrl: '',
      cardId: `CARD-${Date.now().toString().slice(-6)}`,
      availableZones: ['LU', '1', '2', '3', '4', '5', '6', '7', '8', 'VIP', 'MEDIA'],
      transportOptions: ['Bus', 'Shuttle', 'Private'],
      mealCategories: ['Breakfast', 'Lunch', 'Dinner']
    };
  }
}
