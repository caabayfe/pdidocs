/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { scopeAnalysisValid } = api.state;
  if (!scopeAnalysisValid.isValid) {
    return scopeAnalysisValid.message;
  }
  return '';
}
