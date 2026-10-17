/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api?.context?.session?.user?.roles?.includes('admin') || api?.context?.session?.user?.roles?.includes('access_analyzer_admin')) {
        return false;
    }
    return true;
}
