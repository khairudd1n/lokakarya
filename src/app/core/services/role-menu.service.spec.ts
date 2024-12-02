import { TestBed } from '@angular/core/testing';

import { RoleMenuService } from './role-menu.service';

describe('RoleMenuService', () => {
  let service: RoleMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
