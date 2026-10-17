/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    try {
        const { navigateTo } = imports["sn_oe_sfs.CiNavigationUtils"]();
        const payload = event.payload.eventPayload;
        if ( event.payload.eventName == "NOW_RECORD_LIST_CONNECTED#CREATE_NEW_RECORD") {
            navigateTo(api, {
                route: "record",
                fields: {
                    table: payload.table,
                    sysId:"-1_uid_" + Date.now()
                },
                params: {
                    ...payload.params,
                },
            });
        } else if (event.payload.eventName == "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED") {
            navigateTo(api, {
                route: "record",
                fields: {
                    ...payload.fields,
                    sysId: payload.sys_id,
                    table: payload.table,
                },
                params: {
                    t: Date.now(),
                },
            });
        }
    } catch (e) {}
}
