/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const userRoles = api.context.session.user.roles;
  if (userRoles && (userRoles.includes("admin") || userRoles.includes("viz_creator") || userRoles.includes("viz_admin")))
    return false;

	return true;
}
