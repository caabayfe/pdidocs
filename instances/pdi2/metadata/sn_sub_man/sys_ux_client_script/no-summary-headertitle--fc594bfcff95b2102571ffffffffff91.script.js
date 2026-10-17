/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.isMeterTypeCreator ?
        helpers.translateSync("Account-level consumption") :
        helpers.translateSync("Consumption summary");
}
