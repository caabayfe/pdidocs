/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const res = api.data.gliderecord_collection_query_2.output.data.GlideRecord_Query.sn_sub_man_st_subscription_insights;
    const over_allocated_subs = res._rowCount;
    if(over_allocated_subs > 0) {
        // save it to state
        helpers.translate('You consumed more subscriptions than you purchased for {0} products.', over_allocated_subs)
        .then((text) => {
        api.setState('over_allocated_subs', text);
        });
    }
}
