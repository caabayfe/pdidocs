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
    const results = api.data.look_up_multiple_records_1.results || [];
    const sysId = results?.[0]?.sys_id?.value || '';
    api.setState('upgradeHistorySysId', sysId);

    if (sysId) {
        api.data.get_number_of_rules_applied.refresh()
    }
}
