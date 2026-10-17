/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let sectionLabel = "";

    function updateParticipantsSectionTitle(participants) {
        let isCallActive = api.state.confDetails ? api.state.confDetails.active : false;
        if (isCallActive) {
            if (participants) {
                if (api.state.invitedParticipantCollapse) {
                    return helpers.translateSync("Collapse inactive participants list");
                }
                return helpers.translateSync("Expand inactive participants list");
            }
            return helpers.translateSync("Participants inactive collapsible button");
        }
        if (participants) {
            if (api.state.invitedParticipantCollapse) {
                return helpers.translateSync("Collapse not joined participants list");
            }
            return helpers.translateSync("Expand not joined participants list");
        }
        return helpers.translateSync("Participants not joined collapsible button");
    }
    if (api.state.searchArrayInvited && api.state.searchArrayInvited.length > 0)
        sectionLabel = updateParticipantsSectionTitle(api.state.searchArrayInvited);
    else
        sectionLabel = updateParticipantsSectionTitle(api.state.allParticipantsArrays.participantsInvited);

    return {
        "aria-label": sectionLabel
    };
}
