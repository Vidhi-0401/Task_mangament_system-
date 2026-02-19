import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiClient } from '../core/api';
import { AuthStore } from '../core/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-semibold">Login</h1>
    <p class="text-sm text-slate-600 mt-1">Use seeded accounts from README (Owner/Admin/Viewer).</p>

    <div class="mt-6 space-y-3">
      <label class="block">
        <span class="text-sm">Email</span>
        <input class="mt-1 w-full border rounded-md px-3 py-2" [(ngModel)]="email" placeholder="owner@acme.com" />
      </label>

      <label class="block">
        <span class="text-sm">Password</span>
        <input class="mt-1 w-full border rounded-md px-3 py-2" type="password" [(ngModel)]="password" placeholder="Password@123" />
      </label>

      <button
        class="w-full rounded-md bg-slate-900 text-white px-3 py-2"
        (click)="onLogin()"
        [disabled]="loading()"
      >
        {{ loading() ? 'Logging in…' : 'Login' }}
      </button>

      <div *ngIf="error()" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {{ error() }}
      </div>
    </div>
  </div>
  `,
})
export class LoginComponent {
  email = 'owner@acme.com';
  password = 'Password@123';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private api: ApiClient, private auth: AuthStore, private router: Router) {}

  onLogin() {
    this.error.set(null);
    this.loading.set(true);

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.setToken(res.accessToken);
        this.router.navigateByUrl('/tasks');
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Login failed');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
