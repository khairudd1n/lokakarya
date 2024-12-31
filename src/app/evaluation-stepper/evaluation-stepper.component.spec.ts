import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationStepperComponent } from './evaluation-stepper.component';

describe('EvaluationStepperComponent', () => {
  let component: EvaluationStepperComponent;
  let fixture: ComponentFixture<EvaluationStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
