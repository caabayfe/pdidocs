/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // p2 is the id of Account level entitlement module. Display cloud entitlement tab if user clicks on Account level entitlement and if cloud entitlement is displayed
  if (api.state.subscriptionsTabId === 'p2' || api.state.subscriptionsTabId === 'p2c1')
    return !api.state.shouldShowCloudEntitlementTab;

  // p2c1 is the id of Cloud Entitlement tab. Hide this container when any other tab is selected
  return api.state.subscriptionsTabId != 'p2c1';
}
