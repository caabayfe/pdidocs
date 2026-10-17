/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.payload.props_details.button_action_type === 'link' ? 'open-link-right-outline' : null;
}
