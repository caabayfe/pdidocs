/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const output = api.data.upgrade_management___updateRetainedSkippedRecords.output || {};
    if (output.success && !api.state.ranUpdateRetainedSkippedRecords) {
        api.setState('ranUpdateRetainedSkippedRecords', true);
        api.data.upgrade_management___overview_page_apis_1.refresh();
        api.data.upgrade_management___get_skipped_records_1.refresh();
        api.data.look_up_multiple_records_3.refresh();
    }
}
