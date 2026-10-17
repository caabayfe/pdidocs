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
    try {
        const {
            navigateTo
        } = imports["sn_oe_sfs.CiNavigationUtils"](); 
        const {
            eventName, eventPayload
        } = event.payload;
        if (eventName == 'NOW_RECORD_LIST_CONNECTED#CREATE_NEW_RECORD') { 
            navigateTo(api, {
                route: 'record',
                fields: {
                    'table': eventPayload.table,
                    'sysId': eventPayload.sysId == '-1' ? '-1_uid_' + Date.now() : eventPayload.sysId
                },
                params: {
                    'query': eventPayload.query
                }
            });
        }
        else if (eventName == 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
                navigateTo(api, {
                    route: 'record',
                    fields: {
                        'sysId': eventPayload.sys_id,
                        'table': eventPayload.table
                    },
                    params: {
                        't': Date.now()
                    }
                });
        }
    } catch (e) {}
}
