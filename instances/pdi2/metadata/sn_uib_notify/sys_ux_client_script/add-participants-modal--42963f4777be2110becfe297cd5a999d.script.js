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
    if (!api.state.confDetails) return;
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'modal_viewport',
        route: 'notify-conference-dialog-snc-participants-page',
        fields: {
            table: api.state.confDetails.source.table,
            sysId: api.state.confDetails.source.sysId,
            isParentRecordAware: true,
            type: "addParticipants",
            conferenceId: api.context.props.confId
        },
        params: {}
    });

}
