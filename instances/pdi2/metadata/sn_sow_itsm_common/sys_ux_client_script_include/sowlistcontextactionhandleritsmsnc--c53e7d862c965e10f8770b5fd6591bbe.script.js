function include({
    imports
}, api, event, helpers) {
    class SOWListContextActionHandlerITSMSNC {
        static handleContextAction(recordSysId, actionId) {
            switch (actionId) {
                case 'copy_url':
                    var expUrl = helpers.getCurrentExperienceUrl();
                    expUrl += "/record/" + api.data.list_controller.current.table + "/" + recordSysId;
                    helpers.writeText(expUrl).then((status) => {
                        helpers.translate('Copied to clipboard').then((value) => {
                            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                                items: [{
                                    id: "copyLinkAlert",
                                    status: "positive",
                                    icon: "check-circle-outline",
                                    content: value,
                                    action: {
                                        type: "dismiss"
                                    }
                                }],
                            });
                        });
                    });
                    break;
                case 'reassign':
                    helpers.translate('Reassign').then((value) => {
                        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                            viewportElementId: 'list_viewport_modal',
                            route: 'sow-list-modal',
                            fields: {
                                table: api.data.list_controller.current.table,
                                sysId: recordSysId,
                                title: value,
                                view: "sow_incident_assign_modal",
                            }
                        });
                    });
                    break;
                case 'assign_to_me':
                    var input = {
                        table: api.data.list_controller.current.table,
                        recordSysId: recordSysId,
                    };
                    api.data.assign_to_me.execute(input);
                    break; 
            }
        }
    }
    return SOWListContextActionHandlerITSMSNC;
}
