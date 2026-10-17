/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

	return helpers.translateSync('Your configurations will be saved for {0} on click of Complete.', api.state.setupName);
}
