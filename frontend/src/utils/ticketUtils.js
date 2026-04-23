const KEYWORDS = {
  critical: ['fire', 'danger', 'unauthorized entry', 'intruder', 'intrusion', 'security breach'],
  plumbingHigh: ['flood', 'flooding', 'water leak', 'leak', 'burst pipe', 'overflow'],
  electricalHigh: ['power', 'voltage', 'short circuit', 'spark'],
  networkMedium: ['wifi', 'wi-fi', 'internet', 'network', 'slow', 'latency', 'connection'],
  cleaningLow: ['dirty', 'dust', 'cleaning', 'trash', 'garbage'],
};

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Suggests ticket priority by combining category and description signals.
 *
 * Example mappings:
 * - ELECTRICAL + "Fire near switch" => CRITICAL
 * - NETWORK + "WiFi slow" => MEDIUM
 * - PLUMBING + "Water leak flooding" => HIGH
 * - CLEANING + "Room dirty" => LOW
 * - SECURITY + "Unauthorized entry" => CRITICAL
 */
export function suggestPriority(description = '', category = '') {
  const desc = normalize(description);
  const cat = normalize(category);

  if (hasAny(desc, KEYWORDS.critical)) {
    return {
      priority: 'CRITICAL',
      reason: 'Critical risk detected from description keywords',
    };
  }

  if (cat === 'security') {
    return {
      priority: 'CRITICAL',
      reason: 'Security-related issues are prioritized as critical',
    };
  }

  if (cat === 'plumbing' && hasAny(desc, KEYWORDS.plumbingHigh)) {
    return {
      priority: 'HIGH',
      reason: 'Plumbing issue with leak/flood risk detected',
    };
  }

  if (cat === 'electrical' || hasAny(desc, KEYWORDS.electricalHigh)) {
    return {
      priority: 'HIGH',
      reason: 'Electrical or power-related issue detected',
    };
  }

  if (cat === 'network' || hasAny(desc, KEYWORDS.networkMedium)) {
    return {
      priority: 'MEDIUM',
      reason: 'Network/connectivity performance issue detected',
    };
  }

  if (cat === 'cleaning' || hasAny(desc, KEYWORDS.cleaningLow)) {
    return {
      priority: 'LOW',
      reason: 'Cleaning/housekeeping issue detected',
    };
  }

  return {
    priority: 'LOW',
    reason: 'No urgent risk keywords detected',
  };
}

/**
 * Format priority suggestion message for UI display
 * @param {Object} suggestion - Result from suggestPriority()
 * @returns {string} Formatted message
 */
export function formatSuggestionMessage(suggestion) {
  return `${suggestion.priority} - ${suggestion.reason}`;
}
