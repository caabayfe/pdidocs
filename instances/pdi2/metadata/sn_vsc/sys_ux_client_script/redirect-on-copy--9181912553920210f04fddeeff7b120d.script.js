/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api?.data?.duplicate_sc_policy?.output) {
        return;
    }
    helpers.navigate.to('security_policy_details', {
        "table": "sn_vsc_security_policy",
        "sysId": api.data.duplicate_sc_policy.output
    });
}
