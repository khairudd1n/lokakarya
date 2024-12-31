import { TestBed } from '@angular/core/testing';

import { SumWithDetailService } from './sum-with-detail.service';

describe('SumWithDetailService', () => {
  let service: SumWithDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SumWithDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
