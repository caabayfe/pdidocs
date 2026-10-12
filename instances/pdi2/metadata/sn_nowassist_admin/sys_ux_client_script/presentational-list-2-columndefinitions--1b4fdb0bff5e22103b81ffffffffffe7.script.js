/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var result = api.data.get_acl_data_for_skill_config_1.output;
    if (result?.columnDefinitions &&  result?.columnDefinitions?.columns?.length > 4)
        result.columnDefinitions.columns = result?.columnDefinitions?.columns?.slice(0, -2);
    return result?.columnDefinitions;
}
