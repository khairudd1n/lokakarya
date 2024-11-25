import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttitudeSkillComponent } from './attitude-skill.component';

describe('AttitudeSkillComponent', () => {
  let component: AttitudeSkillComponent;
  let fixture: ComponentFixture<AttitudeSkillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttitudeSkillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttitudeSkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
