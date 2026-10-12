/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const ext = 'subscription-data-sharing&version=latest';
    let docLink = api.data.look_up_doc_property.properties.value;
    
    docLink = docLink+ext;
    // set State
    api.setState('docLink',docLink);
}
