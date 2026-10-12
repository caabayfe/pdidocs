/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('polarisTheme', api.data.lookup_polaris_prop.output.properties["glide.ui.polaris.theme.custom"] == null);
}
    
