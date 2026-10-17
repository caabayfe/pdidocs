/**
 * Evaluates the health score and returns a descriptive text label.
 * Maps score ranges to human-readable health status messages for display in the UI.
 * @param {Object} params - The parameters object
 * @param {Object} params.api - API object containing data and state
 * @param {TransformApiHelpers} params.helpers - Helper utilities for transforms
 * @returns {string} Descriptive text for the health score range, or empty string if invalid
 */
function evaluateProperty({api, helpers}) {
  var score = api.data?.fetch_homepage_healthscores_data_1.output?.knowledgeBaseHealth?.score;

  const HEALTH_SCORE_CONFIG = {
    ranges: {
      severe: { min: 0, max: 25 },
      poor: { min: 26, max: 50 },
      fair: { min: 51, max: 75 },
      good: { min: 76, max: 99 },
      perfect: { value: 100 }
    },
    messages: {
      severe: "Immediate attention required",
      poor: "Multiple improvements needed",
      fair: "Good health with areas to improve",
      good: "Good health with minor improvements",
      perfect: "Great knowledge base health"
    }
  };

  const { ranges, messages } = HEALTH_SCORE_CONFIG;

  if (score >= ranges.severe.min && score <= ranges.severe.max) {
    return helpers.translateSync(messages.severe);
  } else if (score >= ranges.poor.min && score <= ranges.poor.max) {
    return helpers.translateSync(messages.poor);
  } else if (score >= ranges.fair.min && score <= ranges.fair.max) {
    return helpers.translateSync(messages.fair);
  } else if (score >= ranges.good.min && score <= ranges.good.max) {
    return helpers.translateSync(messages.good);
  } else if (score === ranges.perfect.value) {
    return helpers.translateSync(messages.perfect);
  }
  return "";
}
