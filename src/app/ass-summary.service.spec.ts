import { TestBed } from '@angular/core/testing';

import { AssSummaryService } from './ass-summary.service';

describe('AssSummaryService', () => {
  let service: AssSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
