/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const lastRefreshed = new Date(api.state.lastRefreshTime);
  const now = new Date(api.state.now);
  const diffInMinutes = Math.floor((now - lastRefreshed) / (1000 * 60));
  if(diffInMinutes === 0) {
    return helpers.translateSync("Last refreshed just now");
  }
  return helpers.translateSync("Last refreshed {0} minutes ago",[diffInMinutes]);
}
