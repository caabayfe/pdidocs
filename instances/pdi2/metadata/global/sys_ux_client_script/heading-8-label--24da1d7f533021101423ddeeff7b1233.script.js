/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var count = api.state.mid_server_count;
    if(count == null)count = 0;
    return 'MID servers (' + count + ')';
}
