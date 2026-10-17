/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.isPreviewTableLoading) {
    return true;
  }
  var sessionType = api.data.look_up_user_lane?.results?.[0]?.session_type?.value;
  var isUpgradeComplete = api.state.upgradeState === "complete";
  // Show only for system upgrades, hide for bulk app updates
  return !(isUpgradeComplete && sessionType !== "bulk_app_update");
}
