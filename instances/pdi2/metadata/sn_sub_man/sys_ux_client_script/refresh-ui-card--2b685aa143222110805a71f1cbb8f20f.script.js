/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // refreshing UI cards
    if(api.context.props.sm === 'overview') {
        api.data.unmapped_global_custom_tables.refresh();
        api.data.unmapped_custom_applications.refresh();
        api.data.unconfirmed_user_count.refresh();
        api.data.gliderecord_collection_query_4.refresh();
    }
}
