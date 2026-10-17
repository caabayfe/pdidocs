/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("You are currently in the {0} domain. Editing this skill will copy the skill to current domain.", api.state.userSessionDomainDetails.domainName);
}
