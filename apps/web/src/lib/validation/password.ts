/**
 * The one password rule, PRD US-01 and US-02: "At least 8 characters with a
 * letter and a number."
 *
 * It lived as a literal inside the signup page, which was fine while signup was
 * the only screen that set a password. The reset screen sets one too, and two
 * copies of a security rule drift -- one gets tightened and the other does not,
 * and nobody notices until someone sets a weak password through the door that
 * was left open. So it lives here, and both screens import it.
 */

export const PASSWORD_MIN_LENGTH = 8;

/** The line shown under the password field. Same words on every screen. */
export const PASSWORD_RULE_TEXT =
  'At least 8 characters with a letter and a number.';

/**
 * Returns an error message, or null when the password is acceptable.
 * Messages are unchanged from the signup page so behaviour there is identical.
 */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

/**
 * US-01 and US-02 both require the confirmation field to match before the
 * form can be submitted.
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}
