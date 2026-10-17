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
    const LIST_ROW_CLICKED = 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED';
    const LIST_NEW_BUTTON_CLICKED = 'NOW_RECORD_LIST_CONNECTED#CREATE_NEW_RECORD';
    const {
        payload
    } = event;
    const {
        aceAppConfigId
    } = api.context.props;
    switch (payload.eventName) {
        case LIST_ROW_CLICKED:
            {
                const {
                    sys_id,
                    table
                } = payload.eventPayload
                api.emit("NAV_ITEM_SELECTED", {
                    route: 'ace-record-page',
                    fields: {
                        aceAppConfigId,
                        table: table,
                        sysId: sys_id
                    },
                    params: {},
                    redirect: "",
                    passiveNavigation: "",
                    title: "",
                    multiInstField: "",
                    external: "",
                });
                break;
            }
        case LIST_NEW_BUTTON_CLICKED:
            {
                api.emit("NAV_ITEM_SELECTED", {
                    route: 'ace-record-page',
                    fields: {
                        aceAppConfigId,
                        table: payload.eventPayload.table,
                        sysId: "-1"
                    },
                    params: {
                        query: api.context.props.filter
                    },
                    redirect: "",
                    passiveNavigation: "",
                    title: "",
                    multiInstField: "",
                    external: "",
                });
                break;
            }
    }
}
