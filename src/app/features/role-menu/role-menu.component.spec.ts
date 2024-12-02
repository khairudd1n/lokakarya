import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleMenuComponent } from './role-menu.component';

describe('RoleMenuComponent', () => {
  let component: RoleMenuComponent;
  let fixture: ComponentFixture<RoleMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
