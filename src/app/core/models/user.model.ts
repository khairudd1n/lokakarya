import { Division } from "./division.model";

export interface User {
    id: string;
  username: string;
  full_name: string;
  position: string;
  email_address: string;
  employee_status: number;
  join_date: string;
  enabled: number;
  password: string;
  role: string | null;
  division: Division;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}
