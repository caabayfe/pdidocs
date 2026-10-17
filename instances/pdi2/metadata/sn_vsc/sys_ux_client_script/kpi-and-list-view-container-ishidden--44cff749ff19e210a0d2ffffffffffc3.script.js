/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const indicatorId = api?.context?.props?.indicatorId;
  // Get rid of the KPI and page headers/subheaders when it is active user session
  if (indicatorId == "active_user_session") {
    return true;
  }
  return false;
}
