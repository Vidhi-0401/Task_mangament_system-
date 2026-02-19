import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTaskDto, LoginRequestDto, LoginResponseDto, Task, TaskQueryDto, UpdateTaskDto } from '@tm/data';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  constructor(private http: HttpClient) {}

  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>('/api/auth/login', dto);
  }

  listTasks(q: TaskQueryDto): Observable<Task[]> {
    let params = new HttpParams();
    Object.entries(q || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Task[]>('/api/tasks', { params });
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>('/api/tasks', dto);
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`/api/tasks/${id}`, dto);
  }

  deleteTask(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`/api/tasks/${id}`);
  }

  auditLog(): Observable<any[]> {
    return this.http.get<any[]>('/api/audit-log');
  }
}
