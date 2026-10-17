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
    const showUnconfirmedUsers = api.state.unconfirmed_user_flow_enabled;
    const hideInsightIfZeroCount = api.state.hideUnconfirmedInsight;
    const subscriptionStatus = api.state.SubscriptionStatus;
    //The number of carousel windows is set using this property. 
    //When unconfirmed users flag is not set or when number of unconfirmed users is zero, only 1 carousel window will be displayed. When the flag is set and unconfirmed users count is more than 0, 2 windows will be displayed
    //When subscription status is even and there are more than 1 unconfirmed users, only the insight for unconfirmed users will be displayed
    //Using the default carousel to return the appropriate number of objects
    showUnconfirmedUsers && !hideInsightIfZeroCount && subscriptionStatus.statusValue != 'even' && !api.state.isMeterTypeCreator ? api.setState('insightsRepeaterData', [{
        "insight": "1"
    }, {
        "insight": "2"
    }]) : api.setState('insightsRepeaterData', [{
        "insight": "1"
    }]);
}
