import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './core/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a routerLink="/tasks" class="font-semibold">Secure Tasks</a>

          <div class="flex items-center gap-3">
            <ng-container *ngIf="isAuthed(); else loggedOut">
              <div class="text-sm text-slate-600 hidden sm:block">
                {{ userLabel() }}
              </div>
              <button
                class="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm"
                (click)="logout()"
              >Logout</button>
            </ng-container>

            <ng-template #loggedOut>
              <a routerLink="/login" class="text-sm px-3 py-1.5 rounded-md border">Login</a>
            </ng-template>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {
  private auth = inject(AuthStore);
  isAuthed = computed(() => this.auth.isAuthenticated());
  userLabel = computed(() => this.auth.userLabel());

  logout() {
    this.auth.logout();
  }
}
