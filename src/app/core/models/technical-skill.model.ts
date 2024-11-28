import { User } from "./user.model";

export interface TechnicalSkill {
    id: string | null;
    technical_skill: string | null;
    enabled: number | null;
    created_at: string | null;
    created_by: User | null;
    updated_at: string | null;
    updated_by: User | null;
}
