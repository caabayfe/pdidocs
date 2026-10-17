/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const firstRole = api.state.roleMaskingList.roles[0];
  const scope = firstRole.scope_name ? firstRole.scope_name : firstRole.scope;
	return helpers.translateSync("To edit role restrictions, please change the application scope to {0}", scope);
}
