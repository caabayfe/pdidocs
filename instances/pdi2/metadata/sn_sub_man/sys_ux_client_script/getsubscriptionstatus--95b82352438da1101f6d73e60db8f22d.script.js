/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
//This function sets the subscription status display
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.data.sub_ent_record.result == null) return;
    if (api.data.sub_detail_record.results == null || api.data.sub_detail_record.results.length == 0) return;
    //Reading values from subscription entitlement table
    const purchasedCount = api.data.sub_ent_record.result.purchased_count.value;
    const subscriptionType = api.data.sub_ent_record.result.subscription_type.value;
    //Reading values from subscription details table
    const allocatedCount = api.data.sub_detail_record.results[0].allocated_realtime_count.value;
    const subscriptionStatus = api.data.sub_detail_record.results[0].status.value;
    const subscriptionStatusDisplayValue = api.data.sub_detail_record.results[0].status.displayValue;

    api.setState("isSubscriptionAccountLevel", String(subscriptionStatus) === "account_level");

    const availableCount = Number(purchasedCount - allocatedCount).toLocaleString();

    function getStatusColor(subscriptionStatus) {
        switch (subscriptionStatus) {
            case 'under':
                return 'green';
                break;
            case 'near':
                return 'warning';
                api.setState('isSubscriptionCountCompliant', true);
                break;
            case 'even':
                return 'yellow';
                api.setState('isSubscriptionCountCompliant', true);
                break;
            case 'over':
                return 'orange';
                api.setState('isSubscriptionCountCompliant', false);
                break;
            case 'account_level':
                return 'info';
            default:
                return 'green-yellow';
        }
    }

    function setStateIsSubscriptionCountCompliant(subscriptionStatus) {
        switch (subscriptionStatus) {
            case 'under':
            case 'near':
            case 'even':
                api.setState('isSubscriptionCountCompliant', true);
                break;
            case 'over':
                api.setState('isSubscriptionCountCompliant', false);
                break;
            case 'account_level':
            default:
                break;
        }
    }

    //Setting status
    let statusColor = getStatusColor(subscriptionStatus);


    const statusObject = {
        "displayText": subscriptionStatusDisplayValue,
        "statusValue": subscriptionStatus,
        "color": statusColor,
        "availableCount": availableCount
    };

    api.setState('SubscriptionStatus', statusObject);

    if (api.state.isSubscriptionAccountLevel)
        setAccountLevelStatus(api);

    function setAccountLevelStatus(api) {
        if (api.data.account_level_entitlements_creator.output == null) return;
        const accountEnt = api.data.account_level_entitlements_creator.output.data.GlideRecord_Query.sn_sub_man_st_account_level_entitlement;
        if (accountEnt._rowCount == 0 || !accountEnt._results || accountEnt._results.length == 0) {
            return;
        }

        const creatorRow = accountEnt._results[0];
        const accountLevelStatusValue = creatorRow.status.value;
        const accountLevelStatusDisplayValue = creatorRow.status.displayValue;
        // can't be
        if (accountLevelStatusValue == 'account_level')
            return;

        const accountLevelStatus = {
            color: getStatusColor(accountLevelStatusValue),
            displayText: accountLevelStatusDisplayValue,
            statusValue: accountLevelStatusValue
        };

        setStateIsSubscriptionCountCompliant(accountLevelStatusValue);
        api.setState('SubscriptionStatusAccountLevel', accountLevelStatus);
    }

    if(!api.data.getallocationvisibiltystatus_1.output) return;
    //Insights will be displayed only if subscription type is Per-User
    switch (subscriptionType) {
        case '0': //'Per-User':
            switch (subscriptionStatus) {
                case 'account_level':
                    // if subscription is Per-User, Account-level only (e.g. Creator Plus), then show Unconfirmed-users insight if unconfirmed_user_flow_enabled
                    // FALL-THROUGH
                case 'even':
                    //if status is even but unconfirmed user count > 0, display the insight only for unconfirmed users
                    const hideUnconfirmedInsight = api.state.hideUnconfirmedInsight;
                    const showUnconfirmedUsers = api.state.unconfirmed_user_flow_enabled;
                    if (showUnconfirmedUsers && !hideUnconfirmedInsight) {
                        api.setState('IsInsightsHidden', false);
                        api.setState('IsEmptyInsightsHidden', true);
                    } else {
                        api.setState('IsInsightsHidden', true);
                        api.setState('IsEmptyInsightsHidden', false);
                    }

                    break;
                default:
                    api.setState('IsInsightsHidden', false);
                    api.setState('IsEmptyInsightsHidden', true);
                    break;
            }
            break;
        default:
            api.setState('IsInsightsHidden', true); //when type is anything other than Per-User, hide insights card and show empty insights card
            api.setState('IsEmptyInsightsHidden', false);
            break;
    }


}
