/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.store_app_update_query.output.data.GlideAggregate_Query[0].count > 0) {
        api.setState('hide_store_update_alert', false); 
    }
}
