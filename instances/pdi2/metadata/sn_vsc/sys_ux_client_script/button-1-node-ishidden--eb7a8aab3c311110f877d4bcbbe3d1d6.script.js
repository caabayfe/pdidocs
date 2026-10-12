/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.table == "scan_check_suite" && api.context.props.sysId != "-1") {
        return false;
    } else {
        return true;
    }
}
