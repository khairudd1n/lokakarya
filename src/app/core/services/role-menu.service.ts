import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RoleMenu } from '../models/role-menu.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { Menu } from '../models/menu.model';

interface RoleMenuByRoleData {
  role: Role;
  menu: Menu;
}

@Injectable({
  providedIn: 'root'
})
export class RoleMenuService {
  url: string = 'http://localhost:8080/';
  token: string = localStorage.getItem('token') || '';

  constructor(readonly http: HttpClient) { }



  getAllRoleMenuByRole(): Observable<RoleMenuByRoleData[]> {
    return this.http.get<RoleMenuByRoleData[]>(`${this.url}role-menu/role`, { headers: { Authorization: `Bearer ${this.token}` } });
  }

  updateRoleMenu(roleId: string, menus: string[]): Observable<RoleMenu> {
    return this.http.put<RoleMenu>(`${this.url}role-menu/role/${roleId}`, {menu: menus}, { headers: { Authorization: `Bearer ${this.token}` } });
  }

}
