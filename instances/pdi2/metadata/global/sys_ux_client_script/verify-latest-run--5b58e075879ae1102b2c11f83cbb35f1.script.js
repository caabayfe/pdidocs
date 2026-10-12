/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('mostRecentRun', !(api.data.look_up_latest_run.results[0].sys_id.value === api.context.props.runRecordId));
}
