import { TestBed } from '@angular/core/testing';

import { EmpSuggestService } from './emp-suggest.service';

describe('EmpSuggestService', () => {
  let service: EmpSuggestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpSuggestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
