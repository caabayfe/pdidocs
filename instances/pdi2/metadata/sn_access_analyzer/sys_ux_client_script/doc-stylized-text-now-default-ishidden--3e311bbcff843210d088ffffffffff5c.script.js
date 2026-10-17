/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api?.data?.look_up_a_single_record?.result?.check?._reference.documentation_url?.value) {
        return false;
    }
    return true;
}
