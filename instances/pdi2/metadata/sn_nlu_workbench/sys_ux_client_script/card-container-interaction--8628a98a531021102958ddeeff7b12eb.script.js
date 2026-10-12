/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const interaction = api.context.props.payload.props_details.interaction;

	return interaction === 'none_bordered' ? 'none' : interaction;
}
