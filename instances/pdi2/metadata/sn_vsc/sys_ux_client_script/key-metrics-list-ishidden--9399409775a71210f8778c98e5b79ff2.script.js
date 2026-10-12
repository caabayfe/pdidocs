/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If key security metrics view is not hidden, render this
  const keySecurityMetricsIsHidden = api?.state?.keySecurityMetricsIsHidden;
  if (keySecurityMetricsIsHidden == "false") {
    return false;
  } else {
    return true;
  }
}
