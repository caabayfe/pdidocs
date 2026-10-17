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
    //Get carousel indicator value. This is set only when the carousel index is updated.
    //If not (on initial load), the value is undefined.
    const insightSelectedIndex = (event.payload.indicator != undefined) ? event.payload.indicator : api.state.insightSelectedIndex;
    if (event.payload.indicator != undefined)
        api.setState('insightSelectedIndex', event.payload.indicator);
    const subscriptionStatus = api.state.SubscriptionStatus.statusValue;
    const showUnconfirmedUsers = api.state.unconfirmed_user_flow_enabled;
    const hideUnconfirmedInsight = api.state.hideUnconfirmedInsight;
    const availableCount = api.state.SubscriptionStatus.availableCount;
    const unconfirmedUserCount = api.state.unconfirmedUserCount;
    const unconfirmedGroupCount = api.state.unconfirmedGroupCount;
    let insightLabel = '';
    let insightText = '';
    let insightActionButtonText = '';
    let insightsIcon = '';

    function getInsightsColor(subscriptionStatus, subscriptionStatusColor) {
        switch (subscriptionStatus) {
            case 'under':
            case 'near':
                return 'green-yellow';
            default:
                return subscriptionStatusColor;
        }
    }

    const insightColor = getInsightsColor(subscriptionStatus, api.state.SubscriptionStatus.color);

    //If the unconfirmed users flag is set, the first insight is always going to be for unconfirmed users
    if (showUnconfirmedUsers && insightSelectedIndex == 0 && !hideUnconfirmedInsight) {
        helpers.translate('{0} user(s) have consumed subscriptions that need to be reviewed.', unconfirmedUserCount)
            .then((text) => {
                GetUnconfirmedUsersInsight(text);
            });
    } else {
        switch (subscriptionStatus) {
            case 'under':
                helpers.translate('You have {0} unconsumed subscriptions.', availableCount)
                    .then((text) => {
                        GetCompliantInsight(availableCount, insightColor, text);
                    });
                break;
            case 'near':
                helpers.translate('You have {0} unconsumed subscriptions.', availableCount)
                    .then((text) => {
                        GetCompliantInsight(availableCount, insightColor, text);
                    });
                break;
            case 'over':
                helpers.translate('You consumed more subscriptions than you purchased.')
                    .then((text) => {
                        GetOverAllocatedInsight(insightColor, text);
                    });
                break;
            case 'even':
                api.setState('InsightsContent', GetEvenInsight(insightColor));
                break;
        }
    }


    function GetCompliantInsight(availableCount, insightColor, text) {
        helpers.translate('Available subscriptions')
            .then((label) => {
                const insigh = {
                    "insightLabel": label,
                    "insightColor": insightColor,
                    "insightText": text,
                    "insightActionButtonText": api.state.allocatesubscriptions,
                    "insightIcon": 'Component Outline'
                };
                api.setState('InsightsContent', insigh);
            });
    }

    function GetOverAllocatedInsight(insightColor, text) {
        helpers.translate('Over-consumed subscriptions')
            .then((label) => {
                const insigh = {
                    "insightLabel": label,
                    "insightColor": insightColor,
                    "insightText": text,
                    "insightActionButtonText": api.state.reviewsubscribedgroups,
                    "insightIcon": 'Gear Changes Outline'
                };
                api.setState('InsightsContent', insigh);
            });
    }

    function GetEvenInsight() {
        return {
            "insightLabel": '',
            "insightColor": insightColor,
        };
    }

    function GetUnconfirmedUsersInsight(text) {
        helpers.translate('Unconfirmed users')
            .then((label) => {
                const insigh = {
                    "insightLabel": label,
                    "insightColor": 'purple',
                    "insightText": text,
                    "insightActionButtonText": api.state.reviewgroups,
                    "insightIcon": 'User Group Outline'
                };
                api.setState('InsightsContent', insigh);
            });
    }
}
