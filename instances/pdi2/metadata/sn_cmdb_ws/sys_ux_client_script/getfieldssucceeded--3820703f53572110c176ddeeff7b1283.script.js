/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let classFieldAttributes = JSON.parse(JSON.stringify(api.data.multisource_get_fields.output));
     api.setState('classFieldAttributes',classFieldAttributes);
}
