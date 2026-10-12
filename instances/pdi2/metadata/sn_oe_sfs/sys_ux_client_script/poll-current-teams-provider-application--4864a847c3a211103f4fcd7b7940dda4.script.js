/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var status = api.data.current_teams_provider_application.result.setup_status.value;
    if(status != "incomplete") {
        if(status == "error") {
            var message = api.data.translations.output.sidebar_teams_import_user_error || "We’ve run into a technical issue. Please verify your API permissions on Azure and try again.";

            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'teams_setup_alert',
                    status: 'critical',
                    icon: 'circle-check-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + message + '</span>'
                    },
                    action: {type: 'dismiss'}
                }]
            });
        } else if(status == "complete"){
            var message = api.data.translations.output.sidebar_integration_success || "Success!  Your integration is complete.";
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'teams_setup_alert',
                    status: 'positive',
                    icon: 'circle-check-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + message + '</span>'
                    },
                    action: {type: 'dismiss'}
                }]
            });
        }
        api.setState("teamsSetupStatus", status);

        var pageParams = api.state.pageParams;
        var settings_output = api.data.collab_chat_settings.output;
        pageParams.providerApplications = settings_output.providerApplications;
        pageParams.readOnly = settings_output.readOnly;
        api.setState("pageParams", pageParams);
        api.data.ace_fetch_content_blocks.refresh();

        return;
    }
        

    helpers.timing.setTimeout(() => {
        api.data.current_provider_application.refresh();
    }, 5000);
}
