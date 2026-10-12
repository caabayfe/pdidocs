/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    let schedule = JSON.parse(JSON.stringify(api.state.schedule));
    schedule.sys_id = event.payload.data.output.result.sys_id;
    query.has_schedule = true;
    api.setState('query',query);
    api.setState('schedule',schedule);
}
