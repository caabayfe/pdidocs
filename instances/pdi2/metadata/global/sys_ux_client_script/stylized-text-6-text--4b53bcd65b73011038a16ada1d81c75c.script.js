/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.table == "sc_request"){
        var result = api.data.look_up_records_1.results[0];
        return result.state.displayValue;
    }
    return api.data.look_up_record_1.result.state.displayValue;
}
