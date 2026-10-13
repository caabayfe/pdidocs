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
    if (!event || !event.payload || !event.context) return;
    if (event.payload.item.id === "add_participants") {
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'modal_viewport',
            route: 'notify-conference-dialog-snc',
            fields: {
                table: event.context.item.value.source.table,
                sysId: event.context.item.value.source.sysId,
                isParentRecordAware: true,
                type: "addParticipants",
            },
            params: {
                conferenceId: event.context.item.value.callID
            }
        });
    } else if (event.payload.item.id === "end_call") {
        api.setState("conferenceID", event.context.item.value.callID);
        api.setState("serviceProvider", event.context.item.value.sp.name);
        helpers.modal.open("end_call_confirm");
    }
}
