/**
 * Sign-in providers offered on the login page.
 *
 * This app uses email + password only — no third-party OAuth broker.
 * The array is kept so downstream imports (gates.tsx, login.tsx, client.ts)
 * remain unchanged; it is empty, so no OAuth buttons are rendered.
 */
export type AppProvider = {
  /** Local provider id (used as a key). */
  providerId: string;
  /** Human label for a sign-in button. */
  label: string;
};

/** No external OAuth providers — email / password is the only sign-in method. */
export const GROK_PROVIDERS: readonly AppProvider[] = [];
