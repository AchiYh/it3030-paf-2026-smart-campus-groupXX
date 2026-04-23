/**
 * Suggests a priority level based on ticket description and category
 * Uses keyword analysis to recommend appropriate priority
 * 
 * Rules:
 * 1. IF description contains "fire" OR "danger" → CRITICAL
 * 2. ELSE IF category = "Electrical" OR description contains "power" → HIGH
 * 3. ELSE IF description contains "equipment" → MEDIUM
 * 4. ELSE → LOW
 * 
 * @param {string} description - Ticket description
 * @param {string} category - Ticket category
 * @returns {Object} { priority: string, reason: string }
 */
export function suggestPriority(description = '', category = '') {
  const desc = (description || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  // Rule 1: Check for critical keywords
  if (desc.includes('fire') || desc.includes('danger')) {
    return {
      priority: 'CRITICAL',
      reason: 'Critical incident detected (fire/danger keywords)',
    };
  }

  // Rule 2: Check for electrical/power keywords
  if (cat.includes('electrical') || desc.includes('power')) {
    return {
      priority: 'HIGH',
      reason: 'Electrical/power-related issue detected',
    };
  }

  // Rule 3: Check for equipment keywords
  if (desc.includes('equipment')) {
    return {
      priority: 'MEDIUM',
      reason: 'Equipment issue detected',
    };
  }

  // Rule 4: Default to LOW
  return {
    priority: 'LOW',
    reason: 'No urgent keywords detected',
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
