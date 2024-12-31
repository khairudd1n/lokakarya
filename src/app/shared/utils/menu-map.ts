import { MenuItem } from 'primeng/api';

export const MENU_MAP: {
  [key: string]: { label: string; routerLink: string };
} = {
  ALL_USER: { label: 'User', routerLink: '/user' },
  ALL_DIVISION: { label: 'Division', routerLink: '/division' },
  ALL_APP_ROLE_MENU: { label: 'Role Menu', routerLink: '/role-menu' },
  ALL_GROUP_ATTITUDE_SKILL: {
    label: 'Group Attitude',
    routerLink: '/group-attitude-skill',
  },
  ALL_ATTITUDE_SKILL: {
    label: 'Attitude Skill',
    routerLink: '/attitude-skill',
  },
  ALL_TECHNICAL_SKILL: {
    label: 'Technical Skill',
    routerLink: '/technical-skill',
  },
  ALL_DEV_PLAN: { label: 'Development Plan', routerLink: '/dev-plan' },
  ALL_ACHIEVEMENT: { label: 'Achievement', routerLink: '/achievement' },
  ALL_GROUP_ACHIEVEMENT: {
    label: 'Group Achievement',
    routerLink: '/group-achievement',
  },
  ALL_EMP_ACHIEVEMENT: {
    label: 'Emp Achievement',
    routerLink: '/emp-achievement',
  },
  ALL_EMP_ATTITUDE_SKILL: {
    label: 'Attitude Skill',
    routerLink: '/emp-attitude-skill',
  },
  ALL_EMP_TECHNICAL_SKILL: {
    label: 'Technical Skill',
    routerLink: '/emp-technical-skill',
  },
  ALL_EMP_DEV_PLAN: { label: 'Development Plan', routerLink: '/emp-dev-plan' },
  ALL_EMP_SUGGESTION: { label: 'Suggestion', routerLink: '/emp-suggestion' },
  READ_SUMMARY: { label: 'Summary', routerLink: '/ass-summary' },
  READ_SELF_SUMMARY: { label: 'My Summary', routerLink: '/self-summary' },
  READ_USER: { label: 'View User', routerLink: '/view-user' },
  ALL_ASSESSMENT_FORM: {
    label: 'Assessment Form',
    routerLink: '/assessment-form',
  },
};
