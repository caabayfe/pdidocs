/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        payload
    } = event.payload;
    
    let groupName = payload.data.elements[0];
    let visQuery = payload.params.query;
    let table = '';

    let splitQuery = visQuery.split('^');
    // Check if query specifies a sys_class_name
    let classIndex = splitQuery.findIndex((x) => x.startsWith('sys_class_name='));
    if (classIndex > -1) {
        // If class name is provided, get the table name to pass to drilldown
        table = splitQuery[classIndex].split('=')[1];
    }
    visQuery = splitQuery.join('^');
    
    let params = {
        groupName,
        query: visQuery,
        table
    };

    const customPayload = {
        route: 'ci-overview',
        fields: {
            overviewType: 'my-cis'
        },
        params
    };

    api.emit('NAV_ITEM_SELECTED', customPayload);
}
