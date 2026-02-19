import { decodeJwt } from './jwt';

describe('decodeJwt', () => {
  it('returns null for invalid token', () => {
    expect(decodeJwt('abc')).toBeNull();
  });

  it('decodes payload', () => {
    const token = [
      btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })),
      btoa(JSON.stringify({ name: 'Test', role: 'Owner' })),
      'sig'
    ].join('.');
    const p = decodeJwt(token);
    expect(p.name).toBe('Test');
    expect(p.role).toBe('Owner');
  });
});
