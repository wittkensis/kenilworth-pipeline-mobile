export const AUTH_COOKIE = 'pipeline_auth';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function checkPassword(input: string): boolean {
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error('APP_PASSWORD not set');
  return input === password;
}
