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
api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
    viewportElementId: "modal_viewport_chat",
    route: "start-msteams-chat-modal",
    fields: null,
    params: {
        table: api.context.props.table,
        sysId: api.context.props.sysId,
        descriptionField: "short_description",
        preSelectedParticipants: event.context.item.value.id
    }
});
}
