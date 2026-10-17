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
    let selectedAction = event.payload.item.id;
    switch (selectedAction) {
        case "view_record":
            api.emit('NAV_ITEM_SELECTED', {
                "route": "record",
                "targetRoute": "current",
                "fields": {
                    "table": event.context.item.value.sys_class_name.value,
                    "sysId": event.context.item.value.sys_id.value
                }
            });
            break;
        case "manage_recipients":
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: "manageRecipientsModalViewport",
                route: 'manage-communication-recipients-modal',
                fields: {
                    table: 'comm_plan',
                    sysId: event.context.item.value.commPlanSysId,
                    type: 'communicationTask'
                },
                params: {
                    origin: 'record'
                }
            });
            break;
        case "close":
            setStateAndOpenModal("close");
            break;
        case "snooze":
            setStateAndOpenModal("snooze");
            break;
        case "start":
            api.setState("confirmedCommTaskToBeUpdated", {
                sysId: event.context.item.value.sys_id.value,
                action: "start"
            });
            break;

    }
    api.setState("selectedOverflowActions", []);

    function setStateAndOpenModal(type) {
        api.setState("commTaskToBeUpdated", {
            sysId: event.context.item.value.sys_id.value,
            action: type
        });
        helpers.modal.open('confirm_state_change');
    }
}
