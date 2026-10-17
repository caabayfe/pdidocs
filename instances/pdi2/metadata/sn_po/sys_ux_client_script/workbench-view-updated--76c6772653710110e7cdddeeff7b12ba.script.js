/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {views} = event.payload;

    if(views.right){
        api.setState('compare_mode_on', true);
    }
    api.setState('current_view', views);
}
