import { Menu } from "./menu.model"
import { Role } from "./role.model"

export interface RoleMenu {
    id: string;
    role: Role;
    menu: Menu;
}
