import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccreditationcardComponent } from './accreditationcard.component';

describe('AccreditationcardComponent', () => {
  let component: AccreditationcardComponent;
  let fixture: ComponentFixture<AccreditationcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccreditationcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccreditationcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
