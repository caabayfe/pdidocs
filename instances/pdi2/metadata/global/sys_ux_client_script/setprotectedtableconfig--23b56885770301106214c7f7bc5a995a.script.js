/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var json = api.data.ptc_lookup.output.data.GlideRecord_Query.protected_table_configuration._results;
    api.setState('ptcData', json);
}
