/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const res = api.data.gliderecord_collection_query_3.output.data.GlideRecord_Query.sn_sub_man_st_subscription_insights;
    const total_products = Number(res._rowCount);

    if (total_products > 0) {
        let total_available_subs = 0;
        res._results.forEach(e => {
            let count = Number(e.insight.value.match(/\d+/)[0]);
            total_available_subs = count + total_available_subs;
        });
        helpers.translate('You have {0} unconsumed subscriptions for {1} products.', total_available_subs, total_products)
        .then((text) => {
    api.setState('available_subs', text);
        });
    }
    api.setState('showInsightsLoader', false);
}
