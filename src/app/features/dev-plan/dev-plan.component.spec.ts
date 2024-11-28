import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevPlanComponent } from './dev-plan.component';

describe('DevPlanComponent', () => {
  let component: DevPlanComponent;
  let fixture: ComponentFixture<DevPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
