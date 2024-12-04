import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTechnicalSkillComponent } from './emp-technical-skill.component';

describe('EmpTechnicalSkillComponent', () => {
  let component: EmpTechnicalSkillComponent;
  let fixture: ComponentFixture<EmpTechnicalSkillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTechnicalSkillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpTechnicalSkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
