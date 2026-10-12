/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("You are currently in the {0} domain. Enabling this skill will only enable it for this domain.", api.state.userSessionDomainDetails.domainName);
}
