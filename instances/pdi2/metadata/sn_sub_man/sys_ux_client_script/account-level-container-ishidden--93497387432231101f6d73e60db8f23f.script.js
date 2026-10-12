/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.state.subscriptionsTabId != 'p2c1' && api.state.subscriptionsTabId != 'p2c2' && api.state.subscriptionsTabId != 'p2c3' && api.state.subscriptionsTabId != 'p2';
}
