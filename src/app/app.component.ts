// app.component.ts
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AccreditationCard, AccreditationData, TemplateUtils } from './shared/models/accreditation.model';
import { AccreditationCardComponent } from './accreditationcard/accreditationcard.component';
import { AccreditationService } from './shared/services/accreditationcard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('accreditationCard') accreditationCardComponent!: AccreditationCardComponent;

  // Observable data
  cards: AccreditationCard[] = [];
  currentCard: AccreditationCard | null = null;
  currentCardData: AccreditationData | null = null;
  isLoading = false;

  // Currently selected card index
  selectedCardIndex: number = 0;

  // View mode: 'view' or 'edit'
  viewMode: 'view' | 'edit' = 'view';

  // Store custom HTML/CSS from editor
  customCardHtml: string = '';
  customCardCss: string = '';

  // Component lifecycle
  private destroy$ = new Subject<void>();

  constructor(private accreditationService: AccreditationService) {}

  ngOnInit(): void {
    // Subscribe to cards
    this.accreditationService.cards$.pipe(takeUntil(this.destroy$)).subscribe(cards => {
      this.cards = cards;
      if (cards.length > 0 && !this.currentCard) {
        this.selectCard(0);
      }
    });

    // Subscribe to current card
    this.accreditationService.currentCard$.pipe(takeUntil(this.destroy$)).subscribe(card => {
      this.currentCard = card;
      if (card) {
        this.currentCardData = this.accreditationService.parseCardData(card);
        // Find the index of current card
        this.selectedCardIndex = this.cards.findIndex(c => c.uuid === card.uuid);
      }
    });

    // Subscribe to loading state
    this.accreditationService.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCard(index: number): void {
    if (index >= 0 && index < this.cards.length) {
      this.selectedCardIndex = index;
      this.accreditationService.setCurrentCard(this.cards[index]);
      // Reset custom HTML/CSS when switching cards
      this.customCardHtml = '';
      this.customCardCss = '';
    }
  }

  switchToEditMode(): void {
    this.viewMode = 'edit';
  }

  switchToViewMode(): void {
    this.viewMode = 'view';
  }

  onCardUpdated(data: { html: string, css: string }): void {
    this.customCardHtml = data.html;
    this.customCardCss = data.css;
    console.log('Card updated:', data);
  }

  onCardDataUpdated(data: AccreditationData): void {
    if (this.currentCard) {
      this.accreditationService.updateCard(this.currentCard.uuid, data).subscribe({
        next: (updatedCard) => {
          console.log('Card data updated successfully:', updatedCard);
        },
        error: (error) => {
          console.error('Error updating card:', error);
          alert('Error updating card. Please try again.');
        }
      });
    }
  }

  async exportCurrentCardAsPDF(): Promise<void> {
    if (this.accreditationCardComponent) {
      await this.accreditationCardComponent.exportAsPDF();
    }
  }

  exportCurrentCardAsImage(): void {
    if (this.accreditationCardComponent) {
      this.accreditationCardComponent.exportAsImage();
    }
  }

  printCurrentCard(): void {
    if (this.accreditationCardComponent) {
      this.accreditationCardComponent.printCard();
    }
  }

  // Save all cards to backend (they're already saved via service)
  saveCardsToStorage(): void {
    // Cards are automatically saved to backend via service
    // This could trigger a refresh or show a success message
    console.log('Cards are automatically saved to backend');
    alert('Cards are automatically synchronized with the server!');
  }

  // Refresh cards from backend
  loadCardsFromStorage(): void {
    this.accreditationService.getAllCards().subscribe({
      next: (cards) => {
        console.log('Cards refreshed from server:', cards);
        alert('Cards refreshed from server successfully!');
      },
      error: (error) => {
        console.error('Error loading cards:', error);
        alert('Error loading cards from server. Please try again.');
      }
    });
  }

  // Create a new empty card
  createNewCard(): void {
    this.accreditationService.createEmptyCard().subscribe({
      next: (newCard) => {
        console.log('New card created successfully:', newCard);
        alert('New card created successfully!');
      },
      error: (error) => {
        console.error('Error creating new card:', error);
        alert('Error creating new card. Please try again.');
      }
    });
  }

  // Delete current card
  deleteCurrentCard(): void {
    if (this.currentCard && confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      this.accreditationService.deleteCard(this.currentCard.uuid).subscribe({
        next: () => {
          console.log('Card deleted successfully');
          alert('Card deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting card:', error);
          alert('Error deleting card. Please try again.');
        }
      });
    }
  }

  // Get function color for display
  getFunctionColor(functionType: string): string {
    const colors = {
      athlete: '#28a745',
      official: '#007bff',
      media: '#ffc107',
      vip: '#dc3545',
      staff: '#6c757d',
      delegate: '#17a2b8'
    };
    return colors[functionType as keyof typeof colors] || '#6c757d';
  }

  // Get display name for card
  getCardDisplayName(card: AccreditationCard): string {
    const data = this.accreditationService.parseCardData(card);
    return data ? data.name : 'Unknown Card';
  }

  // Get function type for card
  getCardFunction(card: AccreditationCard): string {
    const data = this.accreditationService.parseCardData(card);
    return data ? data.function : 'unknown';
  }
}
