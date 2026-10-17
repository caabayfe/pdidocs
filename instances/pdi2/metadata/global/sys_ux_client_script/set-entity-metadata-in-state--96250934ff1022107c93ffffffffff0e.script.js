/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let entityMetadata = api.data.get_oauth_entity_metadata_1.output;
    for(let key in entityMetadata) {
        api.state.formFieldAndValues[key] = entityMetadata[key];
    }
}
