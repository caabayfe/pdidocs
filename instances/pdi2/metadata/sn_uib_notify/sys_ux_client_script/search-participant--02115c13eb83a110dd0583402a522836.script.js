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

    let filteredParticipantsJoined = [];
    let filteredParticipantsInvited = [];
    api.setState('searchEmptyState', false);
    let searchText = "";
    if (event.elementId === "clear_search" && event.name === "NOW_BUTTON_ICONIC#CLICKED") {
        searchText = "";
        api.setState("searchText", searchText);
    }
    if (event.elementId === "search_input" && event.name === "NOW_INPUT#INPUT") {
        api.setState('searchText', event.payload.fieldValue);
        searchText = event.payload.fieldValue.toLowerCase().trim();
    }

    if (searchText != "") {
        var joined = api.state.allParticipantsArrays.participants;
        var invited = api.state.allParticipantsArrays.participantsInvited;

        for (let i = 0; i < joined.length; i++) {
            let name = (joined[i].name).toLowerCase().trim();
            if (name.includes(searchText)) {
                filteredParticipantsJoined.push(joined[i]);
            }
        }

        for (let i = 0; i < invited.length; i++) {
            let name = (invited[i].name).toLowerCase();
            if (name.includes(searchText)) {
                filteredParticipantsInvited.push(invited[i]);
            }
        }

        if (filteredParticipantsInvited.length == 0)
            api.setState('searchArrayInvited', []);

        if (filteredParticipantsJoined == 0)
            api.setState('searchArrayJoined', []);

        if (filteredParticipantsJoined.length == 0 && filteredParticipantsInvited.length == 0) {
            api.setState('searchEmptyState', true);
        } else {
            if (filteredParticipantsInvited.length > 0) {
                api.setState('searchArrayInvited', filteredParticipantsInvited);
                api.setState('invitedParticipantCollapse', true);
            }
            if (filteredParticipantsJoined.length > 0) {
                api.setState('searchArrayJoined', filteredParticipantsJoined);
                api.setState('joinedParticipantCollapse', true);
            }
        }
    } else {
        api.setState('searchArrayInvited', []);
        api.setState('searchArrayJoined', []);
    }
}
