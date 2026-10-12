/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 if(api.state.viewMode == "template") {
        api.data.look_up_template.refresh();
    }
    api.data.deduplication_template_get_library_tree.refresh();
    
}
