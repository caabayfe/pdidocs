/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const footerType = api.context.props.payload.props_details.footer_type;
  if(footerType === 'status') {
    const status = api.context.props.payload.props_details.status;
    if(!!status && (status === 'on')) {
      return 'check-outline';
    } else {
      return 'ban-outline';
    }
  }
	return '';
}
