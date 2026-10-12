/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Primary entity cannot be deleted
  const currentEntity = api.item.value;
	return !Boolean(currentEntity.parentId) || api.state.projectDetails.readonly;
}
