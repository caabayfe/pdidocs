/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.context.props.payload.props_details.compliance_state == "Compliant"){
    return "Circle Check Outline";
  }else if(api.context.props.payload.props_details.compliance_state == "Not compliant"){
    return "Diamond Exclamation Outline";
  }
}
