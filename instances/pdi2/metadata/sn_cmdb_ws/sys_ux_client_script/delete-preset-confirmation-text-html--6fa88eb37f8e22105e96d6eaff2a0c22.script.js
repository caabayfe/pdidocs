/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var presetName = api.data.mapSearchFilterController.labelOfCurrentPreset;
	return helpers.translateSync("Are you sure you would to delete the preset <b>{0}</b>?", presetName);
}
