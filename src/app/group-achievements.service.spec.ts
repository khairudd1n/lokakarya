import { TestBed } from '@angular/core/testing';

import { GroupAchievementsService } from './group-achievements.service';

describe('GroupAchievementsService', () => {
  let service: GroupAchievementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupAchievementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
