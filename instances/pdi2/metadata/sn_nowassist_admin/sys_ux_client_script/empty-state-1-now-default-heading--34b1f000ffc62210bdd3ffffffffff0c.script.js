/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.state?.scopeTypeSelection == 'instanceLevel' ? {"label":helpers.translateSync("No Impact to Show")} :{"label":helpers.translateSync("No skills")};
}
