function include({
    imports
}, api, event, helpers) {
    class SOWListContextActionHandlerIncidentSNC {
        static handleContextAction(recordSysId, actionId) {
            switch (actionId) {
                case 'reassign_incident':
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
                case 'assign_to_me_incident':
                    var input = {
                        table: api.data.list_controller.current.table,
                        recordSysId: recordSysId,
                    };
                    api.data.assign_to_me.execute(input);
                    break;
            }
        }
    }
    return SOWListContextActionHandlerIncidentSNC;
}
