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
    const results = api.data.upgrade_management___get_predicted_skipped_records_1.output || [];
    const sysId = results?.[0]?.sys_id?.value || '';
    api.setState('previewingVersionSysId', sysId);

    if (sysId) {
        api.data.get_predicted_skipped_records_count_1.refresh();
    }
}
