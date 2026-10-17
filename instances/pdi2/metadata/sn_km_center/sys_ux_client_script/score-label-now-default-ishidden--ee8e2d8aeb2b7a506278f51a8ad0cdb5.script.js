/**
 * Determines if the score label should be hidden.
 * Returns true when the health score is not available (undefined, null,
 * or -1, the sentinel for excluded from AO evaluation).
 * @param {Object} params - The parameters object
 * @param {Object} params.api - API object containing data and state
 * @param {TransformApiHelpers} params.helpers - Helper utilities for transforms
 * @returns {boolean} True if score label should be hidden, false otherwise
 */
function evaluateProperty({api, helpers}) {
  var score = api.data?.fetch_homepage_healthscores_data_1?.output?.knowledgeBaseHealth?.score;
  return score === undefined || score === null || score === -1;
}
