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
    /**
     * Event handler for clicking any of the 
     * child tabs (unconfirmedgroups, customtables, customapps) of isuues tab 
     * and adding optional params (menu) to the URL based on its tab index.
     */
    const subscriptionChildTab = api.state.subscriptionsTabId;
    const params = {};
    const tabs = {
        p1c1: 'all',
        p2c1: 'cloud',
        p2c2: 'nowassists',
        p2c3: 'creator'
    };
    const menuName = tabs[subscriptionChildTab];
    params['menu'] = menuName;
    //Hide total utilization chart container when user clicks on Now Assist Usage tab or Account level entitlement tab in the content tree. Corresponding dashboard will be displayed based on the container logic for that dashboard
    api.setState('hideTotalUtilizationContainer', (subscriptionChildTab == 'p2c2') || (subscriptionChildTab == 'p2'));
    api.emit("CONTENT_UPDATED", {
        params
    });

    emitNavToSubEvent(getMenuName(menuName));

    function getMenuName(menuName) {
        if (menuName == "all")
            return "all_entitlements";

        return menuName;
    }

    function emitNavToSubEvent(menuName) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            "event": "Navigate to Subscriptions",
            "value": {
                "menu": menuName
            }
        });
    }

}
