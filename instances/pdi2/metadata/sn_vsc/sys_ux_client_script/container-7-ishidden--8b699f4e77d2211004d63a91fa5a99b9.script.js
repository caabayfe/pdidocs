/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api?.context?.props?.listTable == 'adaptive_auth_event') {
        return api?.state?.hideEmptyState ?? true;
    }
    return true;
}
