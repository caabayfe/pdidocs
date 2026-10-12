/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If key security metrics view is hidden, render this
  const keySecurityMetricsIsHidden = api?.state?.keySecurityMetricsIsHidden;
  if (keySecurityMetricsIsHidden == "true") {
    return false;
  } else {
    return true;
  }
}
