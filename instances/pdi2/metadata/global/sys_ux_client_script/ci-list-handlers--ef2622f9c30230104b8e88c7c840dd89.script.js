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
        } = imports["global.CiRoutingUtils"]();
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            if (event.payload.wrappedPayload.fields.table == 'sys_cs_branding_setup') {
                navigateTo(api, {
                    route: 'branding-settings',
                    fields: {
                        'sysId': '-1_uid_' + Date.now()
                    }
                });
            } else {
                navigateTo(api, {
                    route: 'ci-record',
                    fields: {
                        ...event.payload.wrappedPayload.fields,
                        'sysId': event.payload.wrappedPayload.fields.sysId == '-1' ? '-1_uid_' + Date.now() : event.payload.wrappedPayload.fields.sysId
                    },
                    params: {
                        ...event.payload.wrappedPayload.params
                    }
                });
            }
        }
    } catch (e) {

    }
}
