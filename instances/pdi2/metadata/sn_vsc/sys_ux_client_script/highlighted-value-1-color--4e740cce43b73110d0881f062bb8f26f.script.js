/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var state = api.context.props.payload.props_details.compliance_state;
    return state == "Compliant" ? "green" : "warning";
}
