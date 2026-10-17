/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const indicatorId = api?.context?.props?.indicatorId;
  // Display only list view, for when it is active user session
  if (indicatorId == "active_user_session") {
    return false;
  }
  return true;
}
