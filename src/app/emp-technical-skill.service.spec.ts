import { TestBed } from '@angular/core/testing';

import { EmpTechnicalSkillService } from './emp-technical-skill.service';

describe('EmpTechnicalSkillService', () => {
  let service: EmpTechnicalSkillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpTechnicalSkillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
