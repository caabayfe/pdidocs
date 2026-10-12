/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
  // Both numberOfDuplicates and isDuplicatesSkillConfigured are initialized to -1 (loading).
  // This function returns true only when BOTH values are loaded (not -1).
  // Returns false (shows loader) if either value is still loading.
  return api.state.numberOfDuplicates !== -1 && api.state.isDuplicatesSkillConfigured !== -1;
}
