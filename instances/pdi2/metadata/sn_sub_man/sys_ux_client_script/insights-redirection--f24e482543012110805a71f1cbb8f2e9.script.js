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
    const sysId = api.data.gliderecord_query_1.output.data.GlideRecord_Query.subscription_entitlement._results[0].sys_id.value;
    const category = api.state.insightsCategory.toLowerCase().replace(' ', '');
    
    // navigate to details page with sysId and category
    helpers.navigate.to('subscription-details', {
        sysId,
        category
    });

}
