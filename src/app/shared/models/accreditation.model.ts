// shared/models/accreditation.model.ts - Erweiterte Version
export interface Accreditation {
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

  // Erweiterte Felder für Template-System
  birthDate?: string;
  nationality?: string;
  accommodation?: string;
  vehicleAccess?: string[];
  validFrom?: string;
  validUntil?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  specialAccess?: string[];

  // Multiselect Beispiele
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

// Template-System Interfaces
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

  // Auto-Sizing Optionen
  autoFontSize?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
  autoWidth?: boolean;
  autoHeight?: boolean;
}

// Erweiterte Sample-Daten
const CISM_LOGO_URL = 'https://www.milsport.one/medias/images/logo_cism_vertical.png';
const SBB_URL = 'https://api.qrserver.com/v1/create-qr-code/?data=https://sbb.ch&size=100x100';
const EVENT_QR = 'https://api.qrserver.com/v1/create-qr-code/?data=https://eventsite.com&size=100x100';
const PERSON_PHOTO_URL = 'https://plus.unsplash.com/premium_photo-1682144187125-b55e638cf286?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG9ydHJhaXQlMjBtYW58ZW58MHx8MHx8fDA%3D';

export const SAMPLE_ACCREDITATIONS: Accreditation[] = [
  {
    name: 'RUETHEMANN, Christoph',
    rank: 'Captain',
    country_code: 'SUI',
    country: 'Switzerland',
    role: 'Athlete',
    discipline: 'Track & Field',
    subdiscipline: 'Cross country Running',
    accreditation: 'DEL',
    function: 'athlete',
    zones: ['LU', '1', '2', '3', '4', '8', 'VIP'],
    imageUrl: PERSON_PHOTO_URL,
    qr_sbb: SBB_URL,
    qr_event: EVENT_QR,
    eventImageUrl: CISM_LOGO_URL,
    cardId: 'CARD-001',

    // Erweiterte Daten
    birthDate: '1990-05-15',
    nationality: 'Swiss',
    accommodation: 'Hotel Lucerne Central',
    vehicleAccess: ['P1', 'P3'],
    validFrom: '2025-02-01',
    validUntil: '2025-02-15',
    emergencyContact: '+41 79 123 45 67',
    availableZones: ['LU', '1', '2', '3', '4', '5', '6', '7', '8', 'VIP', 'MEDIA'],
    transportOptions: ['Bus', 'Shuttle', 'Private'],
    mealCategories: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  {
    name: 'MUELLER, Anna',
    rank: 'Major',
    country_code: 'GER',
    country: 'Germany',
    role: 'Official',
    discipline: 'Alpine Skiing',
    subdiscipline: 'Referee',
    accreditation: 'OFF',
    function: 'official',
    zones: ['LU', '1', '2', 'VIP'],
    imageUrl: PERSON_PHOTO_URL,
    qr_sbb: SBB_URL,
    qr_event: EVENT_QR,
    eventImageUrl: CISM_LOGO_URL,
    cardId: 'CARD-002',

    birthDate: '1985-03-22',
    nationality: 'German',
    accommodation: 'Hotel Schweizerhof',
    vehicleAccess: ['P2'],
    validFrom: '2025-01-30',
    validUntil: '2025-02-16',
    emergencyContact: '+49 173 987 65 43',
    availableZones: ['LU', '1', '2', '3', '4', '5', '6', '7', '8', 'VIP', 'MEDIA'],
    transportOptions: ['Bus', 'Shuttle'],
    mealCategories: ['Breakfast', 'Lunch', 'Dinner']
  },
  {
    name: 'SMITH, John',
    rank: 'Mr.',
    country_code: 'USA',
    country: 'United States',
    role: 'Journalist',
    discipline: 'Media',
    subdiscipline: 'Sports Reporter',
    accreditation: 'MED',
    function: 'media',
    zones: ['LU', '1', '2'],
    imageUrl: PERSON_PHOTO_URL,
    qr_sbb: SBB_URL,
    qr_event: EVENT_QR,
    eventImageUrl: 'https://via.placeholder.com/200x80/0066cc/ffffff?text=LUCERNE+2025',
    cardId: 'CARD-003',

    birthDate: '1978-11-08',
    nationality: 'American',
    accommodation: 'Media Village',
    vehicleAccess: ['MEDIA-P1'],
    validFrom: '2025-01-28',
    validUntil: '2025-02-18',
    emergencyContact: '+1 555 123 4567',
    availableZones: ['LU', '1', '2', '3', 'MEDIA'],
    transportOptions: ['Media Bus'],
    mealCategories: ['Breakfast', 'Lunch', 'Press Buffet']
  },
  {
    name: 'DUBOIS, Marie',
    rank: 'General',
    country_code: 'FRA',
    country: 'France',
    role: 'VIP Guest',
    discipline: 'Administration',
    subdiscipline: 'Honorary',
    accreditation: 'VIP',
    function: 'vip',
    zones: ['LU', '1', '2', '3', '4', '8', 'VIP'],
    imageUrl: PERSON_PHOTO_URL,
    qr_sbb: SBB_URL,
    qr_event: EVENT_QR,
    eventImageUrl: 'https://via.placeholder.com/200x80/0066cc/ffffff?text=LUCERNE+2025',
    cardId: 'CARD-004',

    birthDate: '1965-07-12',
    nationality: 'French',
    accommodation: 'VIP Residence',
    vehicleAccess: ['VIP-P1', 'VIP-P2', 'VIP-GARAGE'],
    validFrom: '2025-01-25',
    validUntil: '2025-02-20',
    emergencyContact: '+33 6 12 34 56 78',
    specialAccess: ['VIP Lounge', 'Executive Dining', 'Private Viewing'],
    availableZones: ['LU', '1', '2', '3', '4', '5', '6', '7', '8', 'VIP', 'MEDIA', 'BACKSTAGE'],
    transportOptions: ['VIP Shuttle', 'Private Car', 'Helicopter'],
    mealCategories: ['VIP Breakfast', 'Executive Lunch', 'Gala Dinner']
  }
];

// Utility-Funktionen für das Template-System
export class TemplateUtils {

  // Berechnet optimale Schriftgröße basierend auf Text und Container
  static calculateOptimalFontSize(
    text: string,
    containerWidth: number,
    containerHeight: number,
    minFontSize: number = 8,
    maxFontSize: number = 48
  ): number {
    if (!text || containerWidth <= 0 || containerHeight <= 0) return minFontSize;

    const textLength = text.length;
    const avgCharWidth = 0.6; // Durchschnittliche Zeichenbreite relativ zur Schriftgröße
    const lineHeight = 1.2;

    // Berechnung basierend auf Breite
    const widthBasedFontSize = (containerWidth * 0.9) / (textLength * avgCharWidth);

    // Berechnung basierend auf Höhe (single line)
    const heightBasedFontSize = (containerHeight * 0.8) / lineHeight;

    const calculatedSize = Math.min(widthBasedFontSize, heightBasedFontSize);
    return Math.min(Math.max(calculatedSize, minFontSize), maxFontSize);
  }

  // Formatiert Multiselect-Werte
  static formatMultiSelectValue(
    value: any,
    options: string[] = [],
    separator: string = ', '
  ): string {
    if (!value) return '';

    if (Array.isArray(value)) {
      const selectedValues = value.filter(val =>
        options.length === 0 || options.includes(val)
      );
      return selectedValues.join(separator);
    }

    return String(value);
  }

  // Formatiert Datumswerte
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

  // Truncate Text basierend auf Modus
  static truncateText(
    text: string,
    maxLength: number,
    mode: 'ellipsis' | 'cut' | 'wrap' = 'ellipsis'
  ): string {
    if (!text || text.length <= maxLength) return text;

    switch (mode) {
      case 'cut':
        return text.substring(0, maxLength);
      case 'ellipsis':
        return text.substring(0, maxLength - 3) + '...';
      case 'wrap':
        // Für wrap würde man CSS verwenden, hier nur den vollen Text zurückgeben
        return text;
      default:
        return text;
    }
  }

  // Skaliert Bildgröße proportional
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
}
