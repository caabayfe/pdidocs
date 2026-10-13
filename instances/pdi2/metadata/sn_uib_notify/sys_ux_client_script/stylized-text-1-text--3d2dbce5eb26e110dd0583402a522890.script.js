/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    function updateParticipantsSectionTitle(participants) {
        var isCallActive = api.state.confDetails ? api.state.confDetails.active : false;
        if (isCallActive) {
            if (participants) {
                return helpers.translateSync("Participants active ({0})", participants.length);
            }
            return helpers.translateSync("Participants active");
        }
        if (participants) {
            return helpers.translateSync("Participants joined ({0})", participants.length);
        }
        return helpers.translateSync("Participants joined");
    }
    if (api.state.searchArrayJoined && api.state.searchArrayJoined.length > 0)
        return updateParticipantsSectionTitle(api.state.searchArrayJoined);
    else
        return updateParticipantsSectionTitle(api.state.allParticipantsArrays.participants);
}
