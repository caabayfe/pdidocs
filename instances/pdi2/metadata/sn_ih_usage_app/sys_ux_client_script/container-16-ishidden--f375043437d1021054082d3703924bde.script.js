/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.dataEgressSelectedView === "api") {
    return false;
  } else {
    return true;
  }
}
