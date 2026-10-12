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
    const {
        DM_POLICY_TYPE_IDS
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        sysId
    } = api.context.props;

    let route;
    if (api.data.task_detail_record.result) {
        const policyType = api.data.task_detail_record.result.policy_id._reference.cmdb_policy_type.value;
        if (policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION) {
            route = 'attestation-review-cis';
        } else if (policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION) {
            route = 'certification-review';
        }
    }

    if (!route)
        return;

    helpers.navigate.to(
        route,
        {
            sysId
        },
        {},
        false,
        false,
        'current'
    );
}
