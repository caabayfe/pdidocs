/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        let participants = api.data.fetch_participants_to_reinitiate_call.output;
        let conferenceCallDetails = api.state.reinitiateConfCallDetails;
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'modal_viewport',
        route: 'notify-conference-dialog-snc',
        fields: {
            table: api.context.props.table,
            sysId: api.context.props.sysId,
            isParentRecordAware: false,
            type: "startConference",
        },
        params: {
            conferenceMessage: conferenceCallDetails.message,
            conferenceTitle: conferenceCallDetails.conferenceTitle,
            participants: participants,
            serviceProvider: {
                provider: conferenceCallDetails.provider,
                number: conferenceCallDetails.number
            }
        }
    });
}
