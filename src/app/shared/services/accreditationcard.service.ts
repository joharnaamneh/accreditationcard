// src/app/shared/services/accreditation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { AccreditationCard, AccreditationData, TemplateUtils } from '../models/accreditation.model';

@Injectable({
  providedIn: 'root'
})
export class AccreditationService {
  private readonly apiUrl = 'http://localhost:8080/accreditationcards';

  // BehaviorSubject to manage the current cards state
  private cardsSubject = new BehaviorSubject<AccreditationCard[]>([]);
  public cards$ = this.cardsSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Current selected card
  private currentCardSubject = new BehaviorSubject<AccreditationCard | null>(null);
  public currentCard$ = this.currentCardSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllCards();
  }

  /**
   * Get all accreditation cards
   */
  getAllCards(): Observable<AccreditationCard[]> {
    this.loadingSubject.next(true);
    return this.http.get<AccreditationCard[]>(this.apiUrl).pipe(
      tap(cards => {
        this.cardsSubject.next(cards);
        this.loadingSubject.next(false);
        // Set first card as current if none selected
        if (cards.length > 0 && !this.currentCardSubject.value) {
          this.setCurrentCard(cards[0]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific card by UUID
   */
  getCardByUUID(uuid: string): Observable<AccreditationCard> {
    this.loadingSubject.next(true);
    return this.http.get<AccreditationCard>(`${this.apiUrl}/${uuid}`).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new accreditation card
   */
  createCard(jsonTemplate: AccreditationData): Observable<AccreditationCard> {
    this.loadingSubject.next(true);
    const cardData: Partial<AccreditationCard> = {
      uuid: this.generateUUID(),
      jsonTemplate: JSON.stringify(jsonTemplate)
    };

    return this.http.post<AccreditationCard>(this.apiUrl, cardData).pipe(
      tap(newCard => {
        const currentCards = this.cardsSubject.value;
        this.cardsSubject.next([...currentCards, newCard]);
        this.setCurrentCard(newCard);
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing accreditation card
   */
  updateCard(uuid: string, jsonTemplate: AccreditationData): Observable<AccreditationCard> {
    this.loadingSubject.next(true);
    const updateData: Partial<AccreditationCard> = {
      jsonTemplate: JSON.stringify(jsonTemplate)
    };

    return this.http.put<AccreditationCard>(`${this.apiUrl}/${uuid}`, updateData).pipe(
      tap(updatedCard => {
        const currentCards = this.cardsSubject.value;
        const updatedCards = currentCards.map(c => c.uuid === uuid ? updatedCard : c);
        this.cardsSubject.next(updatedCards);

        // Update current card if it's the one being updated
        if (this.currentCardSubject.value?.uuid === uuid) {
          this.setCurrentCard(updatedCard);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete an accreditation card
   */
  deleteCard(uuid: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`).pipe(
      tap(() => {
        const currentCards = this.cardsSubject.value;
        const filteredCards = currentCards.filter(c => c.uuid !== uuid);
        this.cardsSubject.next(filteredCards);

        // If deleted card was current, set new current card
        if (this.currentCardSubject.value?.uuid === uuid) {
          this.setCurrentCard(filteredCards.length > 0 ? filteredCards[0] : null);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Duplicate a card (create a copy)
   */
  duplicateCard(card: AccreditationCard): Observable<AccreditationCard> {
    const parsedData = TemplateUtils.parseJsonTemplate(card.jsonTemplate);
    if (!parsedData) {
      return throwError(() => new Error('Invalid card template'));
    }

    const duplicatedData: AccreditationData = {
      ...parsedData,
      name: `${parsedData.name} (Copy)`,
      cardId: `CARD-${Date.now().toString().slice(-6)}`
    };

    return this.createCard(duplicatedData);
  }

  /**
   * Parse card data from JSON template
   */
  parseCardData(card: AccreditationCard): AccreditationData | null {
    return TemplateUtils.parseJsonTemplate(card.jsonTemplate);
  }

  /**
   * Set current card
   */
  setCurrentCard(card: AccreditationCard | null): void {
    this.currentCardSubject.next(card);
  }

  /**
   * Get current card data parsed
   */
  getCurrentCardData(): AccreditationData | null {
    const currentCard = this.currentCardSubject.value;
    return currentCard ? this.parseCardData(currentCard) : null;
  }

  /**
   * Create a new empty card
   */
  createEmptyCard(): Observable<AccreditationCard> {
    const defaultTemplate = TemplateUtils.createDefaultTemplate();
    return this.createCard(defaultTemplate);
  }

  /**
   * Load all cards initially
   */
  private loadAllCards(): void {
    this.getAllCards().subscribe({
      next: (cards) => {
        console.log('Cards loaded successfully:', cards.length);
      },
      error: (error) => {
        console.error('Failed to load cards:', error);
        // Create a default card if none exist
        this.createEmptyCard().subscribe();
      }
    });
  }

  /**
   * Get current cards synchronously
   */
  getCurrentCards(): AccreditationCard[] {
    return this.cardsSubject.value;
  }

  /**
   * Generate UUID for new cards
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    this.loadingSubject.next(false);
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      // Log additional server error details if available
      if (error.error?.message) {
        errorMessage += ` (${error.error.message})`;
      }
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}
