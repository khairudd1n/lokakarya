import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserListComponent } from './view-user-list.component';

describe('ViewUserListComponent', () => {
  let component: ViewUserListComponent;
  let fixture: ComponentFixture<ViewUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUserListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
