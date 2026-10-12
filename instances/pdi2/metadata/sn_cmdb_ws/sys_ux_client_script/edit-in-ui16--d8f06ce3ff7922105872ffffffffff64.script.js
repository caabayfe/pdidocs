/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { legacyUrl } = api.state;
    helpers.navigate.to(null, null, null, false, false, null, { url: legacyUrl });
}
