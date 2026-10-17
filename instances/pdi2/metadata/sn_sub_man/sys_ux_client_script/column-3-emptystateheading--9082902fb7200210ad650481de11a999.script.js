/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isMeterTypeCreator ?
    helpers.translateSync("This product does not offer consumption history.") :
    helpers.translateSync("No data available.");
}
