import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { EmpAchieveService } from './emp-achieve.service';
import { EmpAttitudeSkillNewService } from './emp-attitude-skill-new.service';
import { GroupAttitudeSkillService } from './core/services/group-attitude-skill.service';
import { GroupAchievementsService } from './core/services/group-achievements.service';
import { GroupedData, GroupedResult } from './core/models/summary.model';
import { ApiResponse } from './core/models/api-response.model';

export interface GroupAchieveDto {
  id: UUID;
  group_achievement_name: string;
  percentage: number;
  enabled: number;
}

export interface GroupAttitudeSkillDto {
  id: UUID;
  group_name: string;
  percentage: number;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssSummaryService {
  private url = 'http://localhost:8080/assess-sum';
  private token = localStorage.getItem('token') || '';
  constructor(
    private http: HttpClient,
    private empAchieveService: EmpAchieveService,
    private empAttitudeSkillService: EmpAttitudeSkillNewService,
    private groupAttitudeSkillService: GroupAttitudeSkillService,
    private groupAchievementService: GroupAchievementsService
  ) {}

  saveAssSummary(userId: string, score: number, year: number): Observable<any> {
    console.log('saving ass summary');
    const currentYear = new Date().getFullYear();
    const data = {
      user_id: userId,
      year: year,
      score: score,
      status: 1,
    };
    return this.http
      .post(`${this.url}/save`, data, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(
        map((response) => response)
      );
  }

  generateAssSummary(userId: string, year: number): Observable<any> {
    console.log('generating ass summary');
    return this.http
      .post(
        `${this.url}/generate/${userId}/${year}`, 
        {}, 
        { headers: { Authorization: `Bearer ${this.token}` } } 
      )
      .pipe(map((response) => response));
  }

  getAssSummaryDetail(userId: string, year: number): Observable<any> {
    return this.http
      .get(`${this.url}/detail/${userId}/${year}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(
        map((response) => response)
      );
  }

  getAllAssSummary(): Observable<ApiResponse<any[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(
        map((response) => response)
      );
  }


  getAllAssSummaryByYear(year: number): Observable<ApiResponse<any[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { year: year },
      })
      .pipe(
        map((response) => response)
      );
  }

  fetchCombinedData(userId: string, year: number): Observable<GroupedResult[]> {
    return forkJoin({
      empAttitude:
        this.empAttitudeSkillService.getAllAttitudeSkillsByUserId(userId, year),
      empAchieve: this.empAchieveService.getAllEmpAchieveByUserId(userId, year),
      groupAttitude:
        this.groupAttitudeSkillService.getAllGroupAttitudeSkillWithCount(),
      groupAchievement:
        this.groupAchievementService.getAllGroupAchievementWithCount(),
    }).pipe(
      map((results) => {
        const combinedData = [];

        const groupDataByCategory = (
          data: any[],
          groupNameFn: (item: any) => string,
          percentageFn: (item: any) => number,
          section: string
        ): GroupedResult[] => {
          const groupedData = data.reduce<Record<string, GroupedData>>(
            (acc, item) => {
              const groupName = groupNameFn(item);
              const percentage = percentageFn(item);

              if (!acc[groupName]) {
                acc[groupName] = {
                  totalScore: 0,
                  percentage: percentage,
                  items: [],
                };
              }

              acc[groupName].totalScore += item.score;
              acc[groupName].items.push(item);
              return acc;
            },
            {}
          );

          return Object.entries(groupedData).map(([groupName, details]) => {
            let count: number = 0;
            if (section === 'Attitude and Skills') {
              const group = results.groupAttitude.find(
                (g) => g.group_name === groupName
              );
              count = group ? group.attitude_count : 1;
            } else {
              const group = results.groupAchievement.find(
                (g) => g.group_achievement_name === groupName
              );
              count = group ? group.achievement_count : 1;
            }
            return {
              section,
              groupName,
              totalScore: details.totalScore / count,
              percentage: details.percentage,
              items: details.items,
            };
          });
        };

        const achieveGrouped = groupDataByCategory(
          results.empAchieve,
          (item) => item.achievement.group_achievement.group_achievement_name,
          (item) => item.achievement.group_achievement.percentage,
          'Achievements'
        );

        const attitudeGrouped = groupDataByCategory(
          results.empAttitude,
          (item) => item.attitude_skill.group_attitude_skill.group_name,
          (item) => item.attitude_skill.group_attitude_skill.percentage,
          'Attitude and Skills'
        );

        combinedData.push(...achieveGrouped, ...attitudeGrouped);
        return combinedData;
      })
    );
  }

  calculatePercentage(combinedData: GroupedResult[]): {
    adjustedData: GroupedResult[];
    assScore: number;
  } {
    const totalWeight = combinedData.reduce(
      (acc, item) => acc + item.percentage,
      0
    );

    let totalPercentage = 0;
    let assScore = 0;

    const adjustedData = combinedData.map((item, index) => {
      const calculatedPercentage = (item.percentage / totalWeight) * 100;
      const roundedPercentage = Math.round(calculatedPercentage);

      if (index < combinedData.length - 1) {
        totalPercentage += roundedPercentage;
        assScore += Math.round(item.totalScore * (roundedPercentage / 100));
      }

      return {
        ...item,
        percentage: roundedPercentage,
      };
    });

    const remainingPercentage = 100 - totalPercentage;
    if (adjustedData.length > 0) {
      const lastItem = adjustedData[adjustedData.length - 1];
      lastItem.percentage = remainingPercentage;
      assScore += Math.round(lastItem.totalScore * (remainingPercentage / 100));
    }

    return { adjustedData, assScore };
  }
}
