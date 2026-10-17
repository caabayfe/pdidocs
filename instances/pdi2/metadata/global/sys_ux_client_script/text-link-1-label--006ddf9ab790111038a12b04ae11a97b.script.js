/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.table == "sc_request") {
        var result = api.data.look_up_records_1.results[0];
        if (result.universal_request.displayValue != null){
            return result.universal_request.displayValue;
        }
        return result.number.displayValue;
    }
    return api.context.props.number;
}
