/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const allowEditingRoles = api.state.allowEditingRMRoles;
  const roleMaskingData = api.state.roleMaskingData;
	return !allowEditingRoles && (roleMaskingData.allowAllSessionRoles ? false : !roleMaskingData?.roles?.length);
}
