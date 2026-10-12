/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const footerType = api.context.props.payload.props_details.footer_type;
  return (footerType === 'status');
}
