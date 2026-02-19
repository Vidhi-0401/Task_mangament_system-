import { TaskCategory, TaskStatus } from './enums';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  organizationId: string;
  role?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  order?: number;
  organizationId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  category?: TaskCategory;
  status?: TaskStatus;
  order?: number;
}

export interface TaskQueryDto {
  search?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  sortBy?: 'createdAt' | 'title' | 'order' | 'status' | 'category';
  sortDir?: 'asc' | 'desc';
}
