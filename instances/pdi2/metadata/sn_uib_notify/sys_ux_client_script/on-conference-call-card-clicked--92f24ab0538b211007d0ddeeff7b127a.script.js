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
    if (!event) return;
    const confCardClickPayloadObj = {
        table: api.context.props.table,
        sysId: api.context.props.sysId,
        confId: event.context.item.value.callID
    };
    api.emit("NOTIFY_CONFERENCE_CARD_CLICKED", confCardClickPayloadObj);
}
