/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    // Visible when duplicates single scores container is visible
    return api.state.isDuplicatesSkillConfigured !== 1 || api.state.numberOfDuplicates <= 0;
}
