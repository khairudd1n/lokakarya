import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpDevPlanComponent } from './emp-dev-plan.component';

describe('EmpDevPlanComponent', () => {
  let component: EmpDevPlanComponent;
  let fixture: ComponentFixture<EmpDevPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpDevPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpDevPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
