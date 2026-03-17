import { BulelaError } from "../types";

/**
 * ErrorLibrary: Phase 9 Persona-Driven Error Taxonomy
 * Maps technical failures to Bulela's voice to maintain immersion.
 */

export const ErrorLibrary = {
  get: (status: number): BulelaError => {
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'The request was malformed.',
          persona: "My ears did not catch that correctly. Let's try speaking more clearly to the system.",
          severity: 'medium'
        };
      case 401:
      case 403:
        return {
          code: 'AUTH_ERROR',
          message: 'Unauthorized access.',
          persona: "The village gates are closed to this request. Perhaps we should check your credentials?",
          severity: 'high'
        };
      case 402:
        return {
          code: 'PAYMENT_REQUIRED',
          message: 'Payment required for this feature.',
          persona: "This wisdom is reserved for our Pro villagers. Perhaps it's time to visit the shop?",
          severity: 'medium'
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found.',
          persona: "That path seems to have been washed away by the rain. Let's find another way.",
          severity: 'medium'
        };
      case 408:
        return {
          code: 'TIMEOUT',
          message: 'Request timed out.',
          persona: "The message is taking too long to cross the river. Let's try sending it again.",
          severity: 'medium'
        };
      case 413:
        return {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Payload too large.',
          persona: "This bundle is too heavy for the carrier! Let's try sending a smaller piece.",
          severity: 'medium'
        };
      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Too many requests.',
          persona: "You're moving too fast! Let's let the brain rest for a minute.",
          severity: 'medium'
        };
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Internal server error.',
          persona: "A digital storm is passing through our servers. Be patient, it will clear soon.",
          severity: 'high'
        };
      case 502:
      case 503:
      case 504:
        return {
          code: 'SERVER_DOWN',
          message: 'Service unavailable.',
          persona: "Bulela is currently scouting for more honey. He'll be back shortly to guide you.",
          severity: 'high'
        };
      case 0: // Offline
        return {
          code: 'OFFLINE',
          message: 'No internet connection.',
          persona: "Your connection has wandered off into the bush. Don't worry, I'm saving your progress locally for now.",
          severity: 'low'
        };
      default:
        return {
          code: 'UNKNOWN',
          message: 'An unexpected error occurred.',
          persona: "My memory fades like the afternoon sun. Something went wrong, but we shall try again.",
          severity: 'medium'
        };
    }
  }
};
