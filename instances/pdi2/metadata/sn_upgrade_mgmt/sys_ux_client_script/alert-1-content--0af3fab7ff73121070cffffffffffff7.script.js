/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const selectedText = api.state.alertMessageRows === 1 ? 'selected record has' : `${api.state.alertMessageRows} selected records have`;
	return `The ${selectedText} been assigned to user: ${api.state.selectedUserToAssignName}`;
}
