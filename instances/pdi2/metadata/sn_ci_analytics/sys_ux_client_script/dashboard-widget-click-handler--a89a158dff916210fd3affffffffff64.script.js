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
        endDate,
        topicId
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
        api.emit('NAV_ITEM_SELECTED', {
            route,
            params: {
                startDate,
                endDate,
                ...extraParams
            }
        });
    };
  
    if (dataSourceType === 'indicator' && indicatorSysid === 'd12820d2775142109cc2da3ccd5a99d0') {
        const isAgentChat = data.elements[0] === 'True';
        if (isAgentChat) {
            let query = 'conversation.live_agent_transfer_timeISNOTEMPTY';
            if (topicId) {
                query += `^topicsLIKE${topicId}`;
            }
            navItemSelected('conversations', {
                encodedQuery: query
            });
        }
    }
}
