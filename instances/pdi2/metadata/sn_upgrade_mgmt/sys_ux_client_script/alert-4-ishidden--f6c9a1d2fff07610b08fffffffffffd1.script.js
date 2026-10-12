/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.upgradeState === "in_progress" || api.state.upgradeState === "complete")
    return true;
  return api.state.isProcessing || !api.state.showErrorProcessBanner;
}
