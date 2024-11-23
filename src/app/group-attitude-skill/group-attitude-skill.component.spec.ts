import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAttitudeSkillComponent } from './group-attitude-skill.component';

describe('GroupAttitudeSkillComponent', () => {
  let component: GroupAttitudeSkillComponent;
  let fixture: ComponentFixture<GroupAttitudeSkillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupAttitudeSkillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupAttitudeSkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
