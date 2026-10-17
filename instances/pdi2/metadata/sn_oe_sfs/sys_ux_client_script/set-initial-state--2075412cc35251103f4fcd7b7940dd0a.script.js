/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var settings = api.data.sidebar_teams_setting.output;
    var configs = settings.sidebar_teams_config;

     if(settings.error){
        displayError(api, settings.error);
        api.setState("readOnly", true);
        return;
    } else if (settings.crossScopeMessage) {
        displayWarning(api, settings.crossScopeMessage);
        api.setState("readOnly", true);
    }

    api.setState("readOnly", settings.readOnly);
    api.setState("isTeamsEnabled", settings.isTeamsEnabled);
    api.setState("preferenceChannel", settings.preferenceChannel);
    api.setState("toggleValue", settings.isTeamsEnabled);
    api.setState("isTeamsConfigured", settings.isTeamsConfigured);
    api.setState("setupStatus", settings.setupStatus);
    api.setState("sys_cs_collab_settings_id", configs.sys_cs_collab_settings.sys_id);
    api.setState("configs", configs);

    var input = {};
    var sys_cs_collab_provider_application = configs.sys_cs_collab_provider_application;

    input.application_id = sys_cs_collab_provider_application.application_id;
    input.redirect_url = sys_cs_collab_provider_application.redirect_url;
    input.directory_id = sys_cs_collab_provider_application.directory_id;
    input.teams_app_id = sys_cs_collab_provider_application.app_id;
    input.client_secret = configs.oAuthEntity.client_secret;
    input.callback_url = configs.collab_chat_webhook_registry.callback_url;
    input.newValues = false;

    if(settings.isTeamsConfigured) {
        api.setState("inputs", input);
        if(settings.setupStatus == "incomplete") {
            var message = api.data.translations.output.sidebar_importing_data || "We’re loading your data. We’ll notify you once your integration is ready to use.";
            displayMessage(api, message);
            api.setState("readOnly", true);
        } else if(settings.setupStatus == "error") {
            var message = api.data.translations.output.sidebar_teams_import_user_error || "We’ve run into a technical issue. Please verify your API permissions on Azure and try again.";
            displayError(api, message);
        }
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

    function displayWarning(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'ac_scope_alert',
                status: 'warning',
                icon: 'circle-info-outline',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }
}
