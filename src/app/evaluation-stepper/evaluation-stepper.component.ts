import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { EmpAttitudeSkillNewComponent } from '../emp-attitude-skill-new/emp-attitude-skill-new.component';
import { EmpTechnicalSkillComponent } from '../emp-technical-skill/emp-technical-skill.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EmpDevPlanComponent } from '../emp-dev-plan/emp-dev-plan.component';
import { EmpSuggestComponent } from '../emp-suggest/emp-suggest.component';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';

@Component({
  selector: 'app-evaluation-stepper',
  standalone: true,
  imports: [
    CommonModule,
    StepperModule,
    ButtonModule,
    NavBarComponent,
    EmpAttitudeSkillNewComponent,
    EmpTechnicalSkillComponent,
    EmpDevPlanComponent,
    EmpSuggestComponent,
  ],
  templateUrl: `./evaluation-stepper.component.html`,
  styleUrl: './evaluation-stepper.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EvaluationStepperComponent {
  user: any;
}
