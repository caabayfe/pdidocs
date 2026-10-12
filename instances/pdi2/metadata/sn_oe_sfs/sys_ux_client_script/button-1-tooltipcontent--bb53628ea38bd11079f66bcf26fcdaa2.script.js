/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const button_type = api.context.props.payload.props_details.header;
    if (button_type == 'Now Virtual Agent') {
	    return 'Add Integration for Now Virtual Agent';
    }
    else{
      return 'Add Integration for self configured bot';
    }
}
