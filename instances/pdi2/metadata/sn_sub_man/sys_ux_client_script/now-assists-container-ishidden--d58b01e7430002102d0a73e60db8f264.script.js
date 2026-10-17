

/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // p2 is the id of Account level entitlement module. If user clicks on Account level entitlement, hide assist usage tab if
  // usage tab shouldn't be displayed or cloud tab is displayed
  if (api.state.subscriptionsTabId === 'p2')
    return api.state.shouldShowCloudEntitlementTab || !api.state.shouldShowAssistUsageTab;
      
  // p2c2 is the id of Now Assists tab. Hide this container when any other tab is selected
  return api.state.subscriptionsTabId !== 'p2c2';
}
