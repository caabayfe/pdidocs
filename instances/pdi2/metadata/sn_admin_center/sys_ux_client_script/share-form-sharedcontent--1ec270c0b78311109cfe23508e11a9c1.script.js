/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `app-details/${api.context.props.applicationId}/${api.context.props.businessObjectiveId}`;
}
