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
    const {
        startDate,
        endDate
    } = api.context.props;
    const {
        payload = {}
    } = event;
    const {
        params: {
            dataSourceType,
            indicatorSysid,
            table
        } = {},
        data
    } = payload;

    const navItemSelected = (route, extraParams = {}) => {
        api.emit("NAV_ITEM_SELECTED", {
            route,
            params: {
                startDate,
                endDate,
                ...extraParams
            }
        });
    };

    function getConversationEndStateValue(endState) {
        const endStateValueMap = {
            'User Closed VA – Clicked End/X': 0,
            'System Closed VA – User No Response': 1,
            'System Closed VA – Topic Complete': 2,
            'System Closed VA – Left With AI Search': 3,
            'System closed VA – Auto Closed': 4,
            'System Closed VA – User Never Engaged': 5,
            'User Closed LA – Clicked End/X': 6,
            'System Closed LA – User No Response': 7,
            'System Closed LA – Chat Complete': 8,
            'Agent Closed LA – Clicked End/X': 9,
            'User Closed LA - Before Agent Engagement': 10,
            'System Closed LA–Before Agent Engagement': 11
        };
        return endStateValueMap[endState];
    };

    if (dataSourceType === 'table' && table === 'sn_ci_analytics_cs_details') {
        navItemSelected("users");
    } else if (dataSourceType === 'indicator') {
        let query = '';
        if (indicatorSysid === '64710bb077233110dfe21f130e5a99d3') {
            const groupType = data.groupBy ? data.groupBy[0] : '';
            if (groupType === 'By Channel') {
                query = data.elements[0] ? 'channel.breakdown_value' + '=' + data.elements[0] : '';
            } else if (groupType === 'By Conversation End State') {
                const endStateValue = getConversationEndStateValue(data.elements[0]);
                query = 'end_stateIN' + endStateValue;
            } else if (groupType === 'By Feedback Result') {
                query = data.elements[0] ? 'feedback_result.display=' + data.elements[0]:'';
            }
            navItemSelected("conversations", {
                encodedQuery: query
            });
        } else if (indicatorSysid === '85e8cfb877233110dfe21f130e5a991e') {
            api.data.get_id.execute({
                "event_type": "Topic Category",
                "name": data.elements[0]
            });
        } else if (indicatorSysid === '2596cf3877233110dfe21f130e5a9925' || indicatorSysid === 'd12820d2775142109cc2da3ccd5a99d0') {
            api.data.get_id.execute({
                "event_type": "Topic",
                "name": data.elements[0]
            });
        } else if (indicatorSysid === '68de2cdd7747c210a102da3ccd5a9941') {
            navItemSelected("conversations", {
                encodedQuery: 'self_solve=true'
            });
        }
    }
}
