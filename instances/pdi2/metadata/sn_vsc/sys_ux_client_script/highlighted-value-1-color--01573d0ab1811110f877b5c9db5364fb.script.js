/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.context.props.payload.props_details.compliance_state == "Compliant"){
    return "green";
  }else if(api.context.props.payload.props_details.compliance_state == "Not compliant"){
    return "yellow";
  }
}
