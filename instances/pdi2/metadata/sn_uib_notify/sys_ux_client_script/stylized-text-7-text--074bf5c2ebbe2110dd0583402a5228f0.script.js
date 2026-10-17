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
                return helpers.translateSync("Participants inactive ({0})", participants.length);
            }
            return helpers.translateSync("Participants inactive");
        }
        if (participants) {
            return helpers.translateSync("Participants not joined ({0})", participants.length);
        }
        return helpers.translateSync("Participants not joined");
    }
    if (api.state.searchArrayInvited && api.state.searchArrayInvited.length > 0)
        return updateParticipantsSectionTitle(api.state.searchArrayInvited);
    else
        return updateParticipantsSectionTitle(api.state.allParticipantsArrays.participantsInvited);


}
