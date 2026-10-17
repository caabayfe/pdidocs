/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
  // numberOfDuplicates and isDuplicatesSkillConfigured are both initialized as -1.
  // This statement will return false (show "DA Empty State") only if:
  //   - isDuplicatesSkillConfigured is exactly 1 (active)
  //   - AND numberOfDuplicates is exactly 0 (no duplicates)
  // In all other cases (including loading), returns true (hides the state).
  return api.state.isDuplicatesSkillConfigured !== 1 || api.state.numberOfDuplicates !== 0;
}
