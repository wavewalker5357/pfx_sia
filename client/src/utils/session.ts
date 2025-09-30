/**
 * Session management utility for participant identification
 * Uses localStorage to persist session ID across page refreshes
 */

const SESSION_STORAGE_KEY = 'summit_session_id';

/**
 * Get or create a unique session ID for the current participant
 * @returns {string} The session ID (UUID format)
 */
export function getOrCreateSessionId(): string {
  // Check if session ID already exists in localStorage
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  
  if (!sessionId) {
    // Generate new UUID-style session ID
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the current session ID (for testing purposes)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Get the current session ID without creating a new one
 * @returns {string | null} The session ID or null if not set
 */
export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}
