import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAchievementComponent } from './group-achievement.component';

describe('GroupAchievementComponent', () => {
  let component: GroupAchievementComponent;
  let fixture: ComponentFixture<GroupAchievementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupAchievementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
