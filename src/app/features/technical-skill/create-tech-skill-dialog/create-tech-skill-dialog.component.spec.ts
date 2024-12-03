import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTechSkillDialogComponent } from './create-tech-skill-dialog.component';

describe('CreateTechSkillDialogComponent', () => {
  let component: CreateTechSkillDialogComponent;
  let fixture: ComponentFixture<CreateTechSkillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTechSkillDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateTechSkillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
