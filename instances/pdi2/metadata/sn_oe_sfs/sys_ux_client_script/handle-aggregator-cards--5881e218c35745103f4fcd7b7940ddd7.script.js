/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        name,
        payload: {
            eventName,
            eventPayload
        }
    } = event;

    var settings = api.state.settings;
    var fields ={};

    if (eventName == "HANDLE_COLLAB_CHAT_CONTROL_CHANGE" || eventName == "HANDLE_SIDEBAR_BACKWARD_COMPATIBILITY") {
        var propertyIds = Object.keys(eventPayload);
        propertyIds.forEach(sysId => {
            try{
                var payload = eventPayload[sysId];
                var value = payload.new_value;
                var field_name = payload.field_name;
                fields[field_name] = {"value": value};
            } catch(error) {
                console.error("Error updating sys property state: " + error.toString());
            }
        });
        const keys = Object.keys(fields);
        keys.map(key => {
            settings.fields[key] = fields[key];
        });
        api.setState("settings", settings);
    }

    if (eventName == "SIDEBAR#TEAMS_DROPDOWN_ITEM_CLICKED" && eventPayload.dropdownId == "remove") {
        api.setState("teamsProviderId", eventPayload.providerId);
        api.setState("teamsProviderAppId", eventPayload.providerAppId);
        helpers.modal.open("modal_remove_teams");
    }

    if (eventName == "SIDEBAR#SLACK_DROPDOWN_ITEM_CLICKED" && eventPayload.dropdownId == "remove") {
        if (eventPayload.dropdownId == "remove")
            helpers.modal.open("modal_remove_slack");
    }
    
    if (eventName == "PARTICIPANT_SUGGESTIONS_CARD") {
        var records = Object.keys(eventPayload);
        var field_name;
        records.forEach(sysId => {
            try{
                var payload = eventPayload[sysId];
                var value = payload.new_value;
                field_name = payload.field_name === "enable_expert_finder" ? "enable_participant_suggestions" : payload.field_name;
                fields[field_name] = {"value": value};
            } catch(error) {
                console.error("Error from PARTICIPANT_SUGGESTIONS_CARD: " + error.toString());
            }
        });
        settings.fields[field_name] = fields[field_name];
        api.setState("settings", settings);
    }

    function displayMessage(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'info',
                icon: 'check_fill',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }

    function displayError(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }
}
