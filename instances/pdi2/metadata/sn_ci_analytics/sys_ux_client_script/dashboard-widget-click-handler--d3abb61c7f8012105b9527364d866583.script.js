/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
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
        } = {}
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
    
    if (dataSourceType === 'indicator' && indicatorSysid === '64710bb077233110dfe21f130e5a99d3') {
        const value = payload.data.elements[0];
        const groupType = payload.data.groupBy[0];

        let query = '';
        if (groupType === 'By Language') {
            query = 'language.name';
        } else if (groupType === 'By Conversation Type') {
            query = 'type';
        }
        query += '=' + value;

        navItemSelected("conversations", {
            encodedQuery: query
        });
    }
}
