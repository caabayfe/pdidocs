/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const roles = api.context.session.user.roles;
  if (roles.includes("catalog_builder_developer")) {
    return false;
  }
	return true;
}
