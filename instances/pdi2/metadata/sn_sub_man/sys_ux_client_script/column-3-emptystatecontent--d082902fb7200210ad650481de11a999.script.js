/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isMeterTypeCreator ?
    "" : 
    helpers.translateSync("There is no data available for the selected criteria.");
}
