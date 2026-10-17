/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('{0} CIs were auto-attested via Smart detection on {1}', api.state.smartDetectionCount, api.state.smartDetectionRunOn);
}
