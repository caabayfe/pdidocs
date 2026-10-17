/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    console.log(event);
    const LIST_ROW_CLICKED = 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED';
    const LIST_NEW_BUTTON_CLICKED = 'NOW_RECORD_LIST_CONNECTED#CREATE_NEW_RECORD';
    const {
        payload
    } = event;
    const {
        aceAppConfigId
    } = api.context.props;
    switch (event.name) {
        case LIST_ROW_CLICKED:
            {
                const {
                    sys_id,
                    table
                } = payload;
                api.emit("NAV_ITEM_SELECTED", {
                    route: 'record',
                    fields: {
                        aceAppConfigId,
                        table: table,
                        sysId: sys_id
                    },
                    reload: true
                });
                break;
            }
        case LIST_NEW_BUTTON_CLICKED:
            {
                api.emit("NAV_ITEM_SELECTED", {
                    route: 'record',
                    fields: {
                        aceAppConfigId,
                        table: payload.table,
                        sysId: "-1_uid_1"
                    },
                    params: {
                        query: api.context.props.filter
                    },
                    reload: true
                });
                break;
            }
    }
}
