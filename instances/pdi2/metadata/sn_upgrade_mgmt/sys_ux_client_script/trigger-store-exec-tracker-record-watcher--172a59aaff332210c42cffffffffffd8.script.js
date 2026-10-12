/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.store_exec_tracker_record_watcher.subscribe({
        table: 'sys_execution_tracker',
        filterConditions: `sys_id=${api.data.trigger_store_apps_fetch.output}`,
        subscribe: true
    });
}
