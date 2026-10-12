/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let status = ""
   if(api.state.upgradeStage == "none") {
    status = helpers.translateSync("Not scheduled");
  } else if(api.data.upgrade_management___get_upgrade_details_1.output?.upgradeMonitorStatusProviderDetails?.state === 'distUpgrade') {
    status = helpers.translateSync("Installing distribution");
  } else if(api.state.upgradeStage == "Scheduled") {
    status = helpers.translateSync("Scheduled");
  } else if(api.state.upgradeStage == "In progress") {
    status = helpers.translateSync("In progress");
  } else if(api.state.upgradeStage == "Complete") {
    status = helpers.translateSync("Complete");
  }
	return helpers.translateSync("Scheduled Upgrade: {0}", status);
}
