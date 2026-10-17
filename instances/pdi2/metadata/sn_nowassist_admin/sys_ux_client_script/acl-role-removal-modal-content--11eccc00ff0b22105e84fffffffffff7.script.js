/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `${api.state.roleToBeRemoved} is selected in the ‘Select display’ step. Removing this role will remove it from the display location and affect the visibility of the skill. Therefore, this role cannot be removed.`; 
}
