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
    let groupSysId = payload.params.breakdowns[0].elements[0];

    const customPayload = {
        route: 'ci-overview',
        fields: {
            overviewType: 'summary'
        },
        params: {
            groupName: groupName,
            query: `encoded_query.group.sys_id=${groupSysId}^ORDERBYDESCci_count`
        }
    };

    api.emit('NAV_ITEM_SELECTED', customPayload);
}
