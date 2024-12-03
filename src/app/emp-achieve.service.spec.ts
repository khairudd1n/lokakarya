import { TestBed } from '@angular/core/testing';

import { EmpAchieveService } from './emp-achieve.service';

describe('EmpAchieveService', () => {
  let service: EmpAchieveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpAchieveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
