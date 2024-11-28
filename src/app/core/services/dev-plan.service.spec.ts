import { TestBed } from '@angular/core/testing';

import { DevPlanService } from './dev-plan.service';

describe('DevPlanService', () => {
  let service: DevPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
