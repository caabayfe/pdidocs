/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { getRelRowDefinitions } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const { 
        showNotificationWithAutoClose, 
        SUCCESS_NOTIFICATION_PROPS, 
        ERROR_NOTIFICATION_PROPS 
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const {
        relProps: {
            selectedPage,
            pageSize,
            rowSelectionObj
        }
    } = api.state;
    const {
        relationships,
        notificationItems
    } = event.payload.data.output;
    let rows = getRelRowDefinitions(relationships, selectedPage, pageSize, rowSelectionObj);
    api.setState('relProps', {
        ...api.state.relProps,
        relationships: relationships,
        rowDefinitions: {
            rows
        },
        stagedRels: []
    });
    let notifications = notificationItems.map((item) => {
        let baseObj = {
            ...item,
            content: item.message
        };
        if (item.type == 'error') {
            return {
                ...baseObj,
                ...ERROR_NOTIFICATION_PROPS,
                id: 'error' + new Date().valueOf()
            };
        } else if (item.type == 'success') {
            return {
                ...baseObj,
                ...SUCCESS_NOTIFICATION_PROPS,
                id: 'success' + new Date().valueOf()
            };
        }
    });
    showNotificationWithAutoClose({api, helpers}, notifications);
}
