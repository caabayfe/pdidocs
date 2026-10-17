/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {    

    if(event.elementId == "fetch_fallback"){
        console.log("Error: failed to find pageParam prop");
        var results = api.data.fetch_fallback.results;
        if(results.length > 0){
            var teamsApp = results.find(app => app.name.value === "Teams Application");
            var slackApp = results.find(app => app.name.value === "Slack Application");
            if (teamsApp) {
                api.setState("isTeamsConfigured", true);
                api.setState("teamsSetupStatus", teamsApp.setup_status.value);
                api.setState("teamsProviderApplicationId", teamsApp._row_data.uniqueValue);
                api.setState("teamsProviderId", teamsApp.provider.value);
                if (api.context.props.payload.props_details.isForceCreateExternalChatSysPropEnabled === "false") {
                    updateTeamsDropdownItems();
                }
            } else {
                api.setState("isTeamsConfigured", false);
                api.setState("teamsSetupStatus", "incomplete");
            }
            if (slackApp) {
                api.setState("isSlackConfigured", true);
                api.setState("slackSetupStatus", slackApp.setup_status.value);
                api.setState("slackProviderApplicationId", slackApp._row_data.uniqueValue);
                api.setState("slackProviderId", slackApp.provider.value);
            } else {
                api.setState("isSlackConfigured", false);
                api.setState("slackSetupStatus", "incomplete");
            }   
        } else {
            api.setState("isTeamsConfigured", false);
            api.setState("isSlackConfigured", false);
        }
        return;
    }

    try{
        var collabSettings = api.data.collab_chat_settings.output.sys_cs_collab_settings;
        var pageParams = api.context.props.payload.pageParams;
        var isForceCreateExternalChatSysPropEnabled = api.context.props.payload.props_details.isForceCreateExternalChatSysPropEnabled;
        var isSidebarEnabled = collabSettings.fields.enabled.value;
        var preferenceChannel = collabSettings.fields.preference_channel.value;
        var isSlackEnabled = collabSettings.fields.enable_slack.value;
        var isTeamsEnabled = collabSettings.fields.enable_teams.value;
        var readOnly = pageParams.readOnly;

        api.setState("readOnly", readOnly);
        api.setState("isSidebarEnabled", isSidebarEnabled);
        api.setState("isSlackEnabled", isSlackEnabled);
        api.setState("isTeamsEnabled", isTeamsEnabled);
        api.setState("preferenceChannel", preferenceChannel);
        api.setState("isTeamsConfigured", pageParams.isTeamsConfigured);
        api.setState("isSlackConfigured", pageParams.isSlackConfigured);
        api.setState("isIntegrationRemoved", pageParams.isIntegrationRemoved);

        if(pageParams.isTeamsConfigured) {
            var teamsProviderApp = pageParams.providerApplications["Teams Application"];
            api.setState("teamsSetupStatus", teamsProviderApp.setup_status);
            api.setState("teamsProviderApplicationId", teamsProviderApp.sys_id);
            api.setState("teamsProviderId", teamsProviderApp.provider);
            if (api.context.props.payload.props_details.isForceCreateExternalChatSysPropEnabled === "false") {
                updateTeamsDropdownItems();
            }
        } else {
            api.setState("teamsSetupStatus", "incomplete");
        }
        if(pageParams.isSlackConfigured) {
            var slackProviderApp = pageParams.providerApplications["Slack Application"];
            api.setState("slackSetupStatus", slackProviderApp.setup_status);
            api.setState("slackProviderApplicationId", teamsProviderApp.sys_id);
            api.setState("slackProviderId", teamsProviderApp.provider);
        } else {
            api.setState("slackSetupStatus", "incomplete");
        }
    } catch(error) {
        api.data.fetch_fallback.refresh();
    }

    function updateTeamsDropdownItems() {
        var dropdownItems = api.state.teamsDropdownItems;
        var itemExists = dropdownItems.some(obj => obj.id === "view_permissions");
        if (!itemExists) {
            dropdownItems.splice(1, 0, {"id": "view_permissions", "label": "View permissions"});
        }
        api.setState("teamsDropdownItems", dropdownItems);
    }
}
