/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.findingId || api.state.automatedFindingForm.name.applyToSource == "project" ? true : false;
}
