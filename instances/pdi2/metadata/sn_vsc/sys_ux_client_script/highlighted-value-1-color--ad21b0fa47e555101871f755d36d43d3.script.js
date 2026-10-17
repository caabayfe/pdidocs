/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const configured = "Compliant";
    const notConfigured = "Not compliant";
    if (api.context.props.payload.props_details.compliance_state == configured) {
        return "green";
    } else if (api.context.props.payload.props_details.compliance_state == notConfigured) {
        return "warning";
    } else {
        return "";
    }
}
