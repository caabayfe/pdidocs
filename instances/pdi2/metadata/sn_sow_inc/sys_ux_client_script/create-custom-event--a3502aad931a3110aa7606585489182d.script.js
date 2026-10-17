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
    if (api.state.customEvent.message != "" && api.state.customEvent.timestamp != "" && api.state.customEventValid.isDateTimeValid && api.state.customEventValid.isMessageValid) {
        delete api.state.customEvent.formattedDateTime;
        api.data.update_pir_timeline.execute({
            sys_id: api.context.props.sysId,
            event: JSON.parse(JSON.stringify(api.state.customEvent))
        });
    }
    if (api.state.customEvent.id) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: 'Timeline Event Edited From PIR',
            value: {
                type: "Timeline Event"
            }
        });
    }
}
