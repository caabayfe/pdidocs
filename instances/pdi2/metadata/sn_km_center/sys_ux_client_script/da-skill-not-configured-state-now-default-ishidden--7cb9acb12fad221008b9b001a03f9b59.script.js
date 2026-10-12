/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
  // numberOfDuplicates and isDuplicatesSkillConfigured are both initialized as -1.
  // This statement will return false (show "DA Skill Not Configured" state) only if:
  //   - isDuplicatesSkillConfigured is exactly 0 (inactive)
  //   - AND numberOfDuplicates is loaded (not -1)
  // In all other cases (including loading), returns true (hides the state).
  return api.state.isDuplicatesSkillConfigured !== 0 || api.state.numberOfDuplicates === -1;
}
