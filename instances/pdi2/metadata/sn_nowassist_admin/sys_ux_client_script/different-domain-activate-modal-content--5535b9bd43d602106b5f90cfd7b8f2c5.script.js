/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("You are currently in the {0} domain. Enabling this skill will only enable it for this domain. If you would like to enable it in all domains within the same parent domain, you can select Cancel and change your domain scope. After you have changed your domain scope to the parent domain, then try activating the skill.", api.state.userSessionDomainDetails);
}
