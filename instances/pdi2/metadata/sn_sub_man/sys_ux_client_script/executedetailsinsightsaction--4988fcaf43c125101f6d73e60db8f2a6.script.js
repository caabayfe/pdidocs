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
    const hideUnconfirmedInsight = api.state.hideUnconfirmedInsight;
    //execute action for unconfirmed users button click if the flow is enabled and unconfirmed user count > 0
    if (showUnconfirmedUsers && !hideUnconfirmedInsight && event.context.item.index == 0) {
        api.setState('DetailsListTabSelectedIndex', 2);
    } else {
        const subscriptionStatus = api.state.SubscriptionStatus.statusValue;
        //If status is compliant,open modal on button click. If status is over allocated, display Subscribed groups tab
        switch (subscriptionStatus) {
            case 'under':
                helpers.modal.open("[component-id$='allocate_licenses']");
                break;
            case 'near':
                helpers.modal.open("[component-id$='allocate_licenses']");
                break;
            case 'over':
                api.setState('DetailsListTabSelectedIndex', 0);
                break;
        }
    }

}
