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
    const agendaItemState = api.context.props.agendaItemRecordData.state.value;
    if (!agendaItemState)
        return;

    const agendaItemId = api.context.props.agendaItemRecordData.sys_id.value;
    if (agendaItemState === "in_progress")
        api.emit("CAB_MEETING_CARD#PAUSE_CURRENT_AGENDA_ITEM");
    else if (agendaItemState === "paused")
        api.emit("CAB_MEETING_CARD#RESUME_CURRENT_AGENDA_ITEM");

}
