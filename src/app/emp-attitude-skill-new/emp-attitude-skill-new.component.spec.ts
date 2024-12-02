import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAttitudeSkillNewComponent } from './emp-attitude-skill-new.component';

describe('EmpAttitudeSkillNewComponent', () => {
  let component: EmpAttitudeSkillNewComponent;
  let fixture: ComponentFixture<EmpAttitudeSkillNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpAttitudeSkillNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpAttitudeSkillNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
