
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
    var conferenceCallDetails = api.state.reinitiateConfCallDetails;
    var participants = api.data.fetch_participants_to_reinitiate_call.output;
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'modal_viewport',
        route: 'notify-conference-dialog-snc-participants-page',
        fields: {
            table: api.context.props.table,
            sysId: api.context.props.sysId,
            isParentRecordAware: false,
            type: "startConference",
            conferenceId: api.context.props.confId
        },
        params: {
            participants: participants,
            conferenceMessage: conferenceCallDetails.call.message,
            conferenceTitle: conferenceCallDetails.call.title.original,
            serviceProvider: {
                provider: conferenceCallDetails.call.sp.name,
                number: conferenceCallDetails.call.number
            },
        }
    });
}
