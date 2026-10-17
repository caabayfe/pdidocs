/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("Edit skill in the {0} domain?" ,api.state.userSessionDomainDetails.domainName);
}
