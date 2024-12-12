import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpSuggestComponent } from './emp-suggest.component';

describe('EmpSuggestComponent', () => {
  let component: EmpSuggestComponent;
  let fixture: ComponentFixture<EmpSuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpSuggestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
