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
    let participant = {};
    participant.type = "user";
    participant.value = api.context.props.userSysId;
    api.emit("OPEN_SMS_MODAL", {
        table: api.context.props.table,
        sysId: api.context.props.recordSysId,
        isParentRecordAware: true,
        type: "sendSms",
        participants: [participant]
    });
}
