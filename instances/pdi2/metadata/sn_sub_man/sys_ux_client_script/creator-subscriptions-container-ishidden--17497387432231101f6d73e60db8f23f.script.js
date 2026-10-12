/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // p2 is the id of Account level entitlement module. If user clicks on Account level entitlement, hide creator tab if
  // creator tab shouldn't be displayed or cloud or assist tab is displayed
  if (api.state.subscriptionsTabId === 'p2')
    return api.state.shouldShowCloudEntitlementTab || api.state.shouldShowAssistUsageTab || !api.state.shouldShowAssistCreatorTab;

  //p2c3 is the id of Creator Subscriptions tab. Hide this container when any other tab is selected
  return api.state.subscriptionsTabId != 'p2c3';
}
