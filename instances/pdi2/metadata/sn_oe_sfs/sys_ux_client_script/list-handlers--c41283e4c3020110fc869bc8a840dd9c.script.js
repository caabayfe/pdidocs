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
    var aceNav = api.context.props.aceNav;
    try {
        const {
            navigateTo
        } = imports["sn_oe_sfs.CiNavigationUtils"]();
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            const {
                table,
                sysId
            } = event.payload.wrappedPayload.fields;
            if (table == 'sys_cs_branding_setup') {
                navigateTo(api, {
                    route: 'branding-settings',
                    fields: {
                        'sysId': sysId
                    },
                    params: {
                        'aceNav': aceNav
                    }
                });
            } else {
                navigateTo(api, {
                    route: 'record',
                    fields: {
                        ...event.payload.wrappedPayload.fields,
                        'sysId': sysId == '-1' ? '-1_uid_' + Date.now() : sysId
                    },
                    params: {
                        ...event.payload.wrappedPayload.params,
                        'aceNav': aceNav
                    }
                });
            }
        }
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
            if (event.payload.table == 'sys_cs_branding_setup') {
                navigateTo(api, {
                    route: 'branding-settings',
                    fields: {
                        'sysId': event.payload.sys_id,
                    },
                    params:{'aceNav':aceNav}
                });
            } else {
                navigateTo(api, {
                    route: 'record',
                    fields: {
                        ...event.payload.fields,
                        'sysId': event.payload.sys_id,
                        'table': event.payload.table
                    },
                    params: {
                        't': Date.now(),
                        'aceNav': aceNav
                    }
                });
            }
        }
    } catch (e) {}
}
