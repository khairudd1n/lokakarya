import { TestBed } from '@angular/core/testing';

import { EmpAttitudeSkillNewService } from './emp-attitude-skill-new.service';

describe('EmpAttitudeSkillNewService', () => {
  let service: EmpAttitudeSkillNewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpAttitudeSkillNewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
