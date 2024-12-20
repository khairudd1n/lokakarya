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
  @Input() nameList: string[] = [];

  techSkill: any = {
    technical_skill: '',
    enabled: 1,
  };
  takenNames: string[] = [];
  nameValid: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['techSkillData']) {
      if (this.techSkillData) {
        this.techSkill = { ...this.techSkillData };
        this.takenNames = this.nameList.filter(
          (name) => name !== this.techSkill.technical_skill.toLowerCase()
        );
      } else {
        this.resetForm();
      }
    }else{
      this.resetForm();
      this.takenNames = this.nameList;
    }
  }
  resetForm() {
    this.techSkill = {
      technical_skill: '',
      enabled: 1,
    };
  }

  isNameValid(name: string) {
    console.log('Taken Names: ', this.takenNames);
    console.log('Name: ', name);
    this.nameValid = this.takenNames.includes(name.toLowerCase());
    return this.nameValid;
  }

  closeDialog() {
    this.visible = false;
    this.resetForm();
    this.visibleChange.emit(this.visible);
  }

  saveUser() {
    this.techSkillSaved.emit(this.techSkill);
    this.closeDialog();
  }
}
