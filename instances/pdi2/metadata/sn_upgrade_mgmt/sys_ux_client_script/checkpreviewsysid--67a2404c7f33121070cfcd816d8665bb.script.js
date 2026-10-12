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
    if (!api.context.props.experienceProperties.upgrade_preview_sys_id.value ||
        !api.state.previewingVersionSysId) {
        // fetch upgrade preview sys id, if not passed from inputs
        api.data.get_upgrade_preview_sys_id.refresh();
    } else {
        // directly fetch count as we have preview id
        api.data.get_predicted_skipped_records_count_1.refresh();
    }
}
