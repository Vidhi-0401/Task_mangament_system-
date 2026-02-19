export function decodeJwt(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  try {
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
