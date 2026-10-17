/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.dmOverviewController.importCertSchsProgressPercent == "0") {
    return helpers.translateSync("Preparing to import...");
  } else {
    return helpers.translateSync("{0}% completed", api.data.dmOverviewController.importCertSchsProgressPercent);
  }
	
}
