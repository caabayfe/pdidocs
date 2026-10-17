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
    // Redirect to Subscriptions tab on card clicks
    const subscriptionsTabs = {
        p1c1: 'all',
        p2c1: 'cloud',
        p2c2: 'nowassists',
        p2c3: 'creators'
    };
    
    if(event.elementId === 'view_all_button') {
        const params = {
            sm: 'subscriptions',
            menu: 'all'
        };
        api.emit("CONTENT_UPDATED", {
            params
        });    
    } else {
        const params = {
            sm: 'subscriptions',
            menu: subscriptionsTabs[api.state.subscriptionsTabId]
        };
        api.emit("CONTENT_UPDATED", {
            params
        });
    }
}
