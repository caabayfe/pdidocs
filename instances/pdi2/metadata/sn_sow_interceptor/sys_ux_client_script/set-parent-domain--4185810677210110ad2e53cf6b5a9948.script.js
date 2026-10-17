/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let parentDomain = api.data.look_up_records_1.results[0].sys_domain.value;
    api.setState('parentDomain' , parentDomain );
}
