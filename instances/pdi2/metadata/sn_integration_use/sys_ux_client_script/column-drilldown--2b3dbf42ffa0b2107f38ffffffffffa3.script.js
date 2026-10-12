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

    function formatTimestampRange(timestampRaw) {
        const ts = Number(timestampRaw);
        const date = new Date(ts);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // 1–12
        const day = date.getUTCDate();   

        const dateStr = `${month} ${day} ${year}`;

        const formattedDate = new Date(dateStr).toISOString().split("T")[0];
        const startDate = `${formattedDate} 00:00:00`;
        const endDate = `${formattedDate} 23:59:59`;

        return {
            startTime: startDate,
            endTime: endDate
        };
    }

    const {
        data
    } = event.payload;
    const element = "ele";
    const listId = event.elementId;
    //   const sys_id = event.payload.params.sys_id;

    const {
        parFilters = []
    } = api.state;

    const groupByValue = api.state.groupBys[listId] && api.state.groupBys[listId].groupBy;
    const titleContainsEgress = event.payload.title && event.payload.title.toLowerCase().includes('egress');
    const groupByContainsDomain = groupByValue && groupByValue.toLowerCase().includes('domain');
    
    const filterConfigurations = groupByContainsDomain 
        ? [] 
        : (titleContainsEgress ? api.state.filterConfigurationsEgress : api.state.filterConfigurations);

    let firstgroup = '';
    const tym = data.timestampRaw;
    const {
        startTime,
        endTime
    } = formatTimestampRange(tym);

    api.emit('NAV_ITEM_SELECTED', {
        route: 'inbound-api-list-page',
        fields: {
            listId,
            title: event.payload.title
        },
        params: {
            filters: `element=${element}`,
            start: startTime,
            endtime: endTime,
            filterConfigurations: filterConfigurations

        }
    });


}
