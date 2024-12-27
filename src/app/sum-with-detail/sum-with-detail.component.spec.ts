import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SumWithDetailComponent } from './sum-with-detail.component';

describe('SumWithDetailComponent', () => {
  let component: SumWithDetailComponent;
  let fixture: ComponentFixture<SumWithDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SumWithDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SumWithDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
