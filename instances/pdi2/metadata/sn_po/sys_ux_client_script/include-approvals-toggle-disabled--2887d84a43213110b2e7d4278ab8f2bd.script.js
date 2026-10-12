/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !api.state.projectPermissions.promin_project_entity.fields.include_approvals.canWrite || api.state.projectDetails.ismining;
}
