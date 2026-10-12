/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Display instance container when either Instance Entitlement module is clicked or if All entitleent module is clicked
  return api.state.subscriptionsTabId !== 'p1' && api.state.subscriptionsTabId !== 'p1c1';
}
