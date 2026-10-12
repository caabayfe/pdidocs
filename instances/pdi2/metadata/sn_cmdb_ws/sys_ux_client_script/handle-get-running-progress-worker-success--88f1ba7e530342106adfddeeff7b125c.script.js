/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.get_running_progress.output?.data?.GlideRecord_Query?.sn_cmdb_ws_progress_monitor?._results?.length) {
        const {
            percent_complete,
            sys_id
        } = api.data.get_running_progress.output.data.GlideRecord_Query.sn_cmdb_ws_progress_monitor._results[0];
        if (percent_complete && sys_id) {
            api.setState('progressId', sys_id.value);
            api.setState('progressValue', percent_complete.value);
        }
    }
}
