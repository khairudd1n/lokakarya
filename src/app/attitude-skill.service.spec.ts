import { TestBed } from '@angular/core/testing';

import { AttitudeSkillService } from './attitude-skill.service';

describe('AttitudeSkillService', () => {
  let service: AttitudeSkillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttitudeSkillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
