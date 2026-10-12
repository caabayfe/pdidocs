/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var cloneExcludeList = api.data.upgrade_management___get_upgrade_details_1?.output?.upgradeMonitorStatusProviderDetails?.skippedCloneExcludeList;
  if(cloneExcludeList && cloneExcludeList.length > 0) {
    return false;
  } else {
    return true;
  }
}
