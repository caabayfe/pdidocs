/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(api.context.props.table == "sc_request"){
        var result = api.data.look_up_records_1.results[0];
        return '/sp?id=ticket&table=sc_req_item&sys_id=' + result.sys_id.displayValue;
    }
    return '/sp?id=ticket&table='+ api.context.props.table + '&sys_id=' + api.context.props.sysId;
}
