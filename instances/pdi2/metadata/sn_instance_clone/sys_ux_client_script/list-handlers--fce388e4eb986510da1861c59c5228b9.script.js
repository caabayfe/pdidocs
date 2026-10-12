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
            navigateToPage
        } = imports["sn_instance_clone.InstanceCloneUtils"]();
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            if (event.payload.wrappedPayload.fields.table == "instance") {
                api.setState("showErrorMessage", false);
                api.setState("showMsg", false);
                let modelParams = {
                    "instance_name": api.state.translations.addNewCloneInstanceMsg,
                    "instance_url": "",
                    "admin_user": "",
                    "admin_password": "",
                    "show_warning": true,
                    "modal_type": "create"
                };
                api.setState('modelParams', modelParams);
                helpers.modal.open('register_instance');
            } else if (event.payload.wrappedPayload.fields.table == "clone_profile") {
                const isConfigContext = api.context.props.nowUxfParentPageComponentId !== undefined;
                if (isConfigContext) {
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: '/now/clone/ui/list/clone_profile',
                            newTab: true
                        }
                    });
                } else {
                    navigateToPage(api, 'clone-profile', {
                        'sysId': -1
                    }, {
                        aceNav: api.context.props.aceNav
                    });
                }
            } else {
                const isConfigContext = api.context.props.nowUxfParentPageComponentId !== undefined;
                if (!isConfigContext) {
                    navigateToPage(api, 'record', {
                        ...event.payload.wrappedPayload.fields,
                        'sysId': -1 + '_uid_' + Date.now()
                    }, {
                        ...event.payload.wrappedPayload.params,
                        view: 'clone_ui',
                        aceNav: api.context.props.aceNav
                    });
                }
            }
        }
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
            if (event.payload.table == "instance") {
                api.setState("showMsg", false);
                var data = api.data.look_up_instance_record.refresh();
                var record_sys_id = event.payload.row.sys_id.value;
                api.setState('record_sys_id', record_sys_id);
            } else if (event.payload.table == "clone_profile") {
                const isConfigContext = api.context.props.nowUxfParentPageComponentId !== undefined;
                if (isConfigContext) {
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: `/now/clone/ui/clone-profile/${event.payload.sys_id}`,
                            newTab: true
                        }
                    });
                } else {
                    navigateToPage(api, 'clone-profile', {
                        'sysId': event.payload.sys_id
                    }, {
                        aceNav: api.context.props.aceNav
                    });
                }
            } else {
                const isConfigContext = api.context.props.nowUxfParentPageComponentId !== undefined;
                const isAceNav = api.context.props.aceNav !== undefined;
                if (isConfigContext && !["clone_data_exclude", "clone_data_preserver", "clone_cleanup_script"].includes(event.payload.table)) {
                    const sysIdSegment = `sysId_${event.payload.sys_id}_${Date.now()}`;
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: `/now/clone/ui/record/${event.payload.table}/${sysIdSegment}`,
                            newTab: true
                        }
                    });
                }else{
                    if(!isConfigContext){
                    navigateToPage(api, 'record', {
                        ...event.payload.fields,
                        'sysId': 'sysId_' + event.payload.sys_id + '_' + Date.now(),
                        'table': event.payload.table
                    }, {
                        view: 'clone_ui',
                        aceNav: api.context.props.aceNav
                    });
                    }
                }
            }
        }
        if (event.name == 'MACROPONENT_PROPERTY_CHANGED') {
            var timestamp = event.payload.value;
            api.setState("timestamp", timestamp);
        }
    } catch (e) {}
}
