import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAchieveComponent } from './emp-achieve.component';

describe('EmpAchieveComponent', () => {
  let component: EmpAchieveComponent;
  let fixture: ComponentFixture<EmpAchieveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpAchieveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpAchieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
