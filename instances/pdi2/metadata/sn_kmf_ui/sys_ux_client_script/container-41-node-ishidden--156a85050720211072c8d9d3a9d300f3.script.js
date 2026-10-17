/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let user_roles = api.context.session.user.roles;
	return !user_roles.includes("maint");
}
