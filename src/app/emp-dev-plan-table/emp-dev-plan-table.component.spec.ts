import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpDevPlanTableComponent } from './emp-dev-plan-table.component';

describe('EmpDevPlanTableComponent', () => {
  let component: EmpDevPlanTableComponent;
  let fixture: ComponentFixture<EmpDevPlanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpDevPlanTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpDevPlanTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
