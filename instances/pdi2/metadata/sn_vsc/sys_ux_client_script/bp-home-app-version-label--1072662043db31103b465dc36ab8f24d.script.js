/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.bestPracticesAffectedData) {
    return "Security Center " + api.state.bestPracticesAffectedData.release_version;
  } 
  return "";
}
