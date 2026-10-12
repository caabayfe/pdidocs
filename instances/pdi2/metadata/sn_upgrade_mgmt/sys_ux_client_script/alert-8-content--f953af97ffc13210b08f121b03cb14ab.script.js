/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var preservedApps =  api.data.get_preserved_app_list.output ?? {};

  if(Object.keys(preservedApps).length === 0) {
    return helpers.translateSync("The data on this page couldn't be saved during the upgrade. You can view your selected apps in the Upgrade Plan.");
  }

  
	return helpers.translateSync("The selections on this page were applied during the upgrade and can't be edited.");
}
