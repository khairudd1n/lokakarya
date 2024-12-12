import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { TechnicalSkill } from '../../../core/models/technical-skill.model';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';

@Component({
  selector: 'app-create-tech-skill-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-tech-skill-dialog.component.html',
  styleUrl: './create-tech-skill-dialog.component.css',
})
export class CreateTechSkillDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() techSkillSaved: EventEmitter<any> = new EventEmitter();

  @Input() techSkillData: TechnicalSkill | null = null;

  techSkill: any = {
    technical_skill: '',
    enabled: 1,
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['techSkillData']) {
      if (this.techSkillData) {
        // Editing an existing user
        this.techSkill = { ...this.techSkillData };
      } else {
        // Creating a new user
        this.resetForm();
      }
    }
  }
  resetForm() {
    this.techSkill = {
      technical_skill: '',
      enabled: 1,
    };
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  saveUser() {
    this.techSkillSaved.emit(this.techSkill);
    this.closeDialog();
  }
}
