import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiClient } from '../core/api';
import { Task, TaskCategory, TaskStatus } from '@tm/data';

type Column = { key: TaskStatus; title: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Tasks</h1>
        <p class="text-sm text-slate-600">RBAC enforced by API. Viewer is read-only.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input class="border rounded-md px-3 py-2 text-sm" placeholder="Search title…" [(ngModel)]="search" (ngModelChange)="reload()" />

        <select class="border rounded-md px-3 py-2 text-sm" [(ngModel)]="category" (ngModelChange)="reload()">
          <option value="">All categories</option>
          <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
        </select>

        <select class="border rounded-md px-3 py-2 text-sm" [(ngModel)]="sortBy" (ngModelChange)="reload()">
          <option value="order">Sort: Order</option>
          <option value="createdAt">Sort: Created</option>
          <option value="title">Sort: Title</option>
        </select>

        <button class="rounded-md bg-slate-900 text-white px-3 py-2 text-sm" (click)="openCreate()">New</button>
      </div>
    </div>

    <div *ngIf="error()" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {{ error() }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div *ngFor="let col of columns" class="bg-white border rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">{{ col.title }}</div>
          <div class="text-xs text-slate-500">{{ tasksByStatus(col.key).length }}</div>
        </div>

        <div
          cdkDropList
          [cdkDropListData]="tasksByStatus(col.key)"
          class="min-h-[140px] flex flex-col gap-2"
          (cdkDropListDropped)="drop($event, col.key)"
        >
          <div
            *ngFor="let t of tasksByStatus(col.key)"
            cdkDrag
            class="border rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-medium truncate">{{ t.title }}</div>
                <div class="text-xs text-slate-600 mt-1">
                  <span class="inline-flex items-center rounded-full border px-2 py-0.5 bg-white">{{ t.category }}</span>
                </div>
              </div>

              <div class="flex gap-2 shrink-0">
                <button class="text-xs px-2 py-1 rounded-md border bg-white" (click)="openEdit(t)">Edit</button>
                <button class="text-xs px-2 py-1 rounded-md border bg-white" (click)="remove(t)">Del</button>
              </div>
            </div>

            <div *ngIf="t.description" class="text-sm text-slate-700 mt-2 line-clamp-3">
              {{ t.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="modalOpen()" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-lg bg-white rounded-xl border shadow-xl p-4">
        <div class="flex items-center justify-between">
          <div class="font-semibold">{{ editing() ? 'Edit Task' : 'Create Task' }}</div>
          <button class="text-sm px-2 py-1 rounded-md border" (click)="closeModal()">Close</button>
        </div>

        <div class="mt-4 space-y-3">
          <label class="block">
            <span class="text-sm">Title</span>
            <input class="mt-1 w-full border rounded-md px-3 py-2" [(ngModel)]="formTitle" />
          </label>

          <label class="block">
            <span class="text-sm">Description</span>
            <textarea class="mt-1 w-full border rounded-md px-3 py-2" rows="3" [(ngModel)]="formDesc"></textarea>
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="block">
              <span class="text-sm">Category</span>
              <select class="mt-1 w-full border rounded-md px-3 py-2" [(ngModel)]="formCategory">
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </label>

            <label class="block">
              <span class="text-sm">Status</span>
              <select class="mt-1 w-full border rounded-md px-3 py-2" [(ngModel)]="formStatus">
                <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
              </select>
            </label>
          </div>

          <button class="w-full rounded-md bg-slate-900 text-white px-3 py-2" (click)="save()">
            {{ editing() ? 'Save changes' : 'Create' }}
          </button>

          <div *ngIf="modalError()" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {{ modalError() }}
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class TasksComponent {
  categories = Object.values(TaskCategory);
  statuses = Object.values(TaskStatus);
  columns: Column[] = [
    { key: TaskStatus.Todo, title: 'Todo' },
    { key: TaskStatus.InProgress, title: 'In Progress' },
    { key: TaskStatus.Done, title: 'Done' },
  ];

  tasks = signal<Task[]>([]);
  error = signal<string | null>(null);

  search = '';
  category = '';
  sortBy: 'order' | 'createdAt' | 'title' = 'order';

  modalOpen = signal(false);
  editing = signal<Task | null>(null);
  modalError = signal<string | null>(null);

  formTitle = '';
  formDesc = '';
  formCategory: TaskCategory = TaskCategory.Work;
  formStatus: TaskStatus = TaskStatus.Todo;

  constructor(private api: ApiClient) {
    this.reload();
  }

  tasksByStatus = (s: TaskStatus) => this.tasks().filter((t) => t.status === s).sort((a, b) => a.order - b.order);

  reload() {
    this.error.set(null);
    this.api
      .listTasks({
        search: this.search || undefined,
        category: (this.category as any) || undefined,
        sortBy: this.sortBy,
        sortDir: 'asc',
      })
      .subscribe({
        next: (ts) => this.tasks.set(ts),
        error: (e) => this.error.set(e?.error?.message || 'Failed to load tasks'),
      });
  }

  openCreate() {
    this.editing.set(null);
    this.formTitle = '';
    this.formDesc = '';
    this.formCategory = TaskCategory.Work;
    this.formStatus = TaskStatus.Todo;
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(t: Task) {
    this.editing.set(t);
    this.formTitle = t.title;
    this.formDesc = t.description || '';
    this.formCategory = t.category;
    this.formStatus = t.status;
    this.modalError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  save() {
    this.modalError.set(null);

    const payload: any = {
      title: this.formTitle,
      description: this.formDesc || null,
      category: this.formCategory,
      status: this.formStatus,
    };

    const t = this.editing();
    if (!t) {
      this.api.createTask(payload).subscribe({
        next: () => {
          this.modalOpen.set(false);
          this.reload();
        },
        error: (e) => this.modalError.set(e?.error?.message || 'Create failed (RBAC?)'),
      });
      return;
    }

    this.api.updateTask(t.id, payload).subscribe({
      next: () => {
        this.modalOpen.set(false);
        this.reload();
      },
      error: (e) => this.modalError.set(e?.error?.message || 'Update failed (RBAC?)'),
    });
  }

  remove(t: Task) {
    if (!confirm('Delete task?')) return;
    this.api.deleteTask(t.id).subscribe({
      next: () => this.reload(),
      error: (e) => alert(e?.error?.message || 'Delete failed (RBAC?)'),
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus) {
    const all = this.tasks().slice();

    const fromStatus = (event.previousContainer.data?.[0]?.status as TaskStatus) || targetStatus;
    const prevList = all.filter((t) => t.status === fromStatus).sort((a, b) => a.order - b.order);
    const nextList = all.filter((t) => t.status === targetStatus).sort((a, b) => a.order - b.order);

    if (event.previousContainer === event.container) {
      moveItemInArray(nextList, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(prevList, nextList, event.previousIndex, event.currentIndex);
      const moved = nextList[event.currentIndex];
      moved.status = targetStatus;
    }

    prevList.forEach((t, i) => (t.order = i));
    nextList.forEach((t, i) => (t.order = i));

    const byId = new Map<string, Task>();
    [...prevList, ...nextList].forEach((t) => byId.set(t.id, t));
    const merged = all.map((t) => byId.get(t.id) ?? t);

    this.tasks.set(merged);

    const changed = [...prevList, ...nextList];
    changed.forEach((t) => {
      this.api.updateTask(t.id, { status: t.status, order: t.order }).subscribe({ error: () => {} });
    });
  }
}
