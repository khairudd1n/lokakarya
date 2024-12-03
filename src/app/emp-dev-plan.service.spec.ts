import { TestBed } from '@angular/core/testing';

import { EmpDevPlanService } from './emp-dev-plan.service';

describe('EmpDevPlanService', () => {
  let service: EmpDevPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpDevPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
