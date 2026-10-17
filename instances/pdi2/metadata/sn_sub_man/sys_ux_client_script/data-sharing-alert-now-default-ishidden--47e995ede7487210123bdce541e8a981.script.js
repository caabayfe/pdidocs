/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api.context.props.templateInput.isDataSharingRestricted && !api.state.dismissDataSharingAlert);
}
