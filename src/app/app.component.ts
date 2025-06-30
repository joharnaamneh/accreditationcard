// app.component.ts
import { Component, ViewChild } from '@angular/core';
import { Accreditation, SAMPLE_ACCREDITATIONS } from './shared/models/accreditation.model';
import { AccreditationCardComponent } from './accreditationcard/accreditationcard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('accreditationCard') accreditationCardComponent!: AccreditationCardComponent;

  // Sample cards data
  sampleCards: Accreditation[] = SAMPLE_ACCREDITATIONS;

  // Currently selected card
  selectedCardIndex: number = 0;
  currentCard: Accreditation = this.sampleCards[0];

  // View mode: 'view' or 'edit'
  viewMode: 'view' | 'edit' = 'view';

  // Store custom HTML/CSS from editor
  customCardHtml: string = '';
  customCardCss: string = '';

  selectCard(index: number): void {
    this.selectedCardIndex = index;
    this.currentCard = this.sampleCards[index];
    // Reset custom HTML/CSS when switching cards
    this.customCardHtml = '';
    this.customCardCss = '';
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

    // Optionally switch back to view mode to see the changes
    // this.switchToViewMode();
  }

  onCardDataUpdated(data: Accreditation): void {
    // Update the current card data
    this.currentCard = { ...data };
    this.sampleCards[this.selectedCardIndex] = { ...data };
    console.log('Card data updated:', data);
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

  // Save all cards to local storage (since we can't use browser storage in artifacts, this would be for real implementation)
  saveCardsToStorage(): void {
    console.log('Saving cards to storage:', this.sampleCards);
    // In a real app, you'd save to localStorage or send to a server
    alert('Cards saved successfully!');
  }

  // Load cards from storage
  loadCardsFromStorage(): void {
    console.log('Loading cards from storage');
    // In a real app, you'd load from localStorage or fetch from a server
    alert('Cards loaded successfully!');
  }

  // Create a new card based on the current one
  duplicateCurrentCard(): void {
    const newCard: Accreditation = {
      ...this.currentCard,
      name: this.currentCard.name + ' (Copy)',
      cardId: 'CARD-' + String(Date.now()).slice(-6)
    };

    this.sampleCards.push(newCard);
    this.selectCard(this.sampleCards.length - 1);
    alert('Card duplicated successfully!');
  }

  // Reset current card to default
  resetCurrentCard(): void {
    if (confirm('Are you sure you want to reset this card to its original state?')) {
      const originalIndex = this.selectedCardIndex;
      this.currentCard = { ...SAMPLE_ACCREDITATIONS[originalIndex] };
      this.sampleCards[originalIndex] = { ...SAMPLE_ACCREDITATIONS[originalIndex] };
      this.customCardHtml = '';
      this.customCardCss = '';
      alert('Card reset successfully!');
    }
  }
}
