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
    if (event.payload.context.columnKey === 'name') {
        helpers.timing.setTimeout(function() {
            this.window.open('/upgrade_preview_log.do?sys_id=' + event.payload.cell.sys_id, '_blank');
        });
    } else if (event.payload.context.columnKey === 'test') {
        api.setState('skippedRecordFileName', event.payload.cell.file_name);
        api.data.get_linked_test_url___tracing_metadata_1.refresh();
    }
}
