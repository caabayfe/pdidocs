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
    function extractFilters(filters) {
        const result = {
            appId: '',
            userId: ''
        };

        if (!filters)
            return result;
        filters.forEach(filter => {
            if (filter.apply_to[0] === "sys_user.sys_id") {
                if (filter.values && filter.values[0])
                    result.userId = filter.values[0];
            }
            if (filter.apply_to[0] === "oauth_entity.sys_id") {
                if (filter.values && filter.values[0])
                    result.appId = filter.values[0];
            }
        });

        return result;
    }


    const {
        data
    } = event.payload;
    const element = data.elements[0];
    const listId = event.elementId;
    const sys_id = event.payload.params.sys_id;

    const {
        parFilters = []
    } = api.state;

    const {
        appId,
        userId
    } = extractFilters(parFilters);

    const groupByValue = api.state.groupBys[listId] && api.state.groupBys[listId].groupBy;
    const titleContainsEgress = event.payload.title && event.payload.title.toLowerCase().includes('egress');
    const groupByContainsDomain = groupByValue && groupByValue.toLowerCase().includes('domain');
    
    const filterConfigurations = groupByContainsDomain 
        ? [] 
        : (titleContainsEgress ? api.state.filterConfigurationsEgress : api.state.filterConfigurations);

    if (element.toLowerCase() != "other") {

        let firstgroup = '';
        if(listId== "vertical_bar_1" || listId== "vertical_bar_3" || listId=="vertical_bar_6")
        firstgroup = sys_id;
        else
        firstgroup = data.elements[0];
        let sndgroup;
        if (listId == "vertical_bar_4" || listId == "vertical_bar_5") {
            sndgroup = sys_id;
        } else {
            sndgroup = data.elements[1] || '';
        }

        const filters = {
            [api.state.groupBys[listId].groupBy]: firstgroup
        };
        if (sndgroup) {
            filters[api.state.groupBys[listId].alternateGroupBy] = sndgroup;
        }
        let query = '';
        Object.entries(filters).forEach(([key, value]) => {
            query += `&${key}=${value}`;
        });

        api.emit('NAV_ITEM_SELECTED', {
            route: 'inbound-api-list-page',
            fields: {
                listId,
                title: event.payload.title
            },
            params: {
                filters: `element=${element}${query}`,
                filterConfigurations: filterConfigurations,
                dataCategory: "simple"

            }
        });
    } else {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'inbound-api-list-page',
            fields: {
                listId,
                title: event.payload.title
            },
            params: {
                filters: `element=${element}`,
                filterConfigurations: filterConfigurations,
                dataCategory: "list"
            }
        });

    }

}
