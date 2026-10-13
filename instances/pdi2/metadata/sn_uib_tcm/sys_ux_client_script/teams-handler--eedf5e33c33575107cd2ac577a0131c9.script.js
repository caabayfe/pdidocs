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
    const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
    const eventName = event.name;
    const teamsChannel = api.data.get_comm_task_channel_details.output.data && api.data.get_comm_task_channel_details.output.data['ms-teams-message'];
    if (!teamsChannel || !teamsChannel.available) {
        return;
    }

    const setIntitialValue = () => {
        var teamsRecipients =  commMgmtUXFBaseUtil.getChannelRecipients(teamsChannel['recipients']);
        let teamsConfig = { ...api.state.teamsConfig
        };
        teamsConfig.isValid = true;
        teamsConfig.teamsTitle = teamsChannel['display_value'];
        teamsConfig.teamsUsers = teamsRecipients;
        api.setState('teamsConfig', teamsConfig);
    };

    const updateTeamsUsers = () => {
        let teamsConfig = { ...api.state.teamsConfig
        };
        teamsConfig.teamsUsers = event.payload.value;
        api.setState('teamsConfig', teamsConfig);
    };

    const updateTeamsMessage = () => {
        let teamsConfig = { ...api.state.teamsConfig
        };
        teamsConfig.teamsMessage = event.payload.value;
        api.setState('teamsConfig', teamsConfig);
    };

    switch (eventName) {
        case "DATA_FETCH_SUCCEEDED":
            if (event.elementId == "get_comm_task_channel_details")
                setIntitialValue();
            else if (event.elementId == "search_recipients")
                api.setState("searchResult", commMgmtUXFBaseUtil.populateSearchResult(api.data.search_recipients.output));
            break;
        case "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET":
            updateTeamsUsers();
            break;
        case "NOW_TEXTAREA#VALUE_SET":
        case "NOW_TEXTAREA#INPUT":
            updateTeamsMessage();
            break;
        case "NOW_TEXTAREA#INVALID_SET":
            api.setState("fieldsFilled",false);
            break;
    };
}
