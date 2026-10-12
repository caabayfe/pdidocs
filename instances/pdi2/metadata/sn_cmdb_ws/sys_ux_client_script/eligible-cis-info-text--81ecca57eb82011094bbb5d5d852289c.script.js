/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const count = api.state.smartDetectionCount;
  const percentage = api.state.smartDetectionPercentage;
  return helpers.translateSync('Based on recent discovery results, {0} CIs were automatically detected (representing {1}% of the total number of CIs for this task). Those CIs are available for auto-attestation.', count, percentage);
}
