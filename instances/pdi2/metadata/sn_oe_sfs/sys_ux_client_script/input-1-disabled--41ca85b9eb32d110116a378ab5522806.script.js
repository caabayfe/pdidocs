/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !api.data.sso_status_1.output ||
        api.data.sso_status_1.output.tenantName === '' ||
        api.data.sso_status_1.output.tenantName === null ||
        api.data.sso_status_1.output.tenantId === '' ||
        api.data.sso_status_1.output.tenantId === null;
}
