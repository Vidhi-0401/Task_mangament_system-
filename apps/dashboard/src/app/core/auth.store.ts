import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { decodeJwt } from './jwt';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private tokenSig = signal<string | null>(localStorage.getItem('tm_token'));
  token = computed(() => this.tokenSig());
  isAuthenticated = computed(() => !!this.tokenSig());

  userLabel = computed(() => {
    const t = this.tokenSig();
    if (!t) return '';
    const p = decodeJwt(t);
    return p ? `${p.name} • ${p.role}` : '';
  });

  constructor(private router: Router) {}

  setToken(token: string) {
    localStorage.setItem('tm_token', token);
    this.tokenSig.set(token);
  }

  logout() {
    localStorage.removeItem('tm_token');
    this.tokenSig.set(null);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.tokenSig();
  }
}
