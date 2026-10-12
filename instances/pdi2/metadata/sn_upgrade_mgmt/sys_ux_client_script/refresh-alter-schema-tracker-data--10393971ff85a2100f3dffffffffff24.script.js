/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let timer = helpers.timing.setInterval(()=> api.data.get_schema_alter_tracker_1.refresh(), 10000);
    api.setState('trackerTimer', timer);

}
