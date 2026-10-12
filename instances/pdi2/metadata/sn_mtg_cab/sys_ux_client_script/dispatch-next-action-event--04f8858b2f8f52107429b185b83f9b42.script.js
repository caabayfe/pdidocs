/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    const decisionTaken = api.context.props.agendaItemRecordData.decision.value;

    if (decisionTaken === '' || !decisionTaken)
        api.emit("CAB_MEETING#DEMOTE_CURRENT_AGENDA_ITEM");
    else
        api.emit("CAB_MEETING#NEXT_AGENDA_ITEM");
}
