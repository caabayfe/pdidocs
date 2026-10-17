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
                if (api.state.joinedParticipantCollapse) {
                    return helpers.translateSync("Collapse active participants list");
                }
                return helpers.translateSync("Expand active participants list");
            }
            return helpers.translateSync("Participants active collapsible button");
        }
        if (participants) {
            if (api.state.joinedParticipantCollapse) {
                return helpers.translateSync("Collapse joined participants list");
            }
            return helpers.translateSync("Expand joined participants list");
        }
        return helpers.translateSync("Participants joined collapsible button");
    }
    if (api.state.searchArrayJoined && api.state.searchArrayJoined.length > 0)
        sectionLabel = updateParticipantsSectionTitle(api.state.searchArrayJoined);
    else
        sectionLabel = updateParticipantsSectionTitle(api.state.allParticipantsArrays.participants);
    return {
        "aria-label": sectionLabel
    };
}
