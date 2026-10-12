/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var pageParams = api.state.pageParams;

    if (api.data.collab_chat_settings.output.error) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: api.data.collab_chat_settings.output.error,
                action: {type: 'dismiss'}
            }]
        });

        pageParams.readOnly = true;
        api.setState("pageParams", pageParams);
        api.setState("readOnly", true);
        return;
}

    try {
        var settings_output = api.data.collab_chat_settings.output;
        var sys_cs_collab_settings = settings_output.sys_cs_collab_settings;
        var sys_properties = settings_output.sys_properties;
        var isTeamsConfigured = settings_output.providerApplications["Teams Application"] !== undefined;
        var isSlackConfigured = settings_output.providerApplications["Slack Application"] !== undefined;

        api.setState("settings", sys_cs_collab_settings);
        api.setState("toggleValue", sys_cs_collab_settings.fields.enabled.value);
        api.setState("isTeamsConfigured", isTeamsConfigured);
        api.setState("isSlackConfigured", isSlackConfigured);
        api.setState("sysProperties", sys_properties);
        api.setState("readOnly", settings_output.readOnly);
        api.setState("teamsProviderApplications", settings_output.providerApplications);

        pageParams.providerApplications = settings_output.providerApplications;
        pageParams.isTeamsConfigured = isTeamsConfigured;
        pageParams.isSlackConfigured = isSlackConfigured;
        pageParams.readOnly = settings_output.readOnly;
        api.setState("pageParams", pageParams);
        api.data.ace_fetch_content_blocks.refresh();

        if (settings_output.crossScopeMessage) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'ac_scope_alert',
                    status: 'warning',
                    icon: 'circle-info-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + settings_output.crossScopeMessage + '</span>'
                    },
                    action: {type: 'dismiss'}
                }]
            });
        }
        if(settings_output.providerApplications.length > 0) {
            if(settings_output.providerApplications["Teams Application"].setupStatus == "incomplete") {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'teams_setup_alert',
                        status: 'info',
                        icon: 'circle-check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + settings_output.teamsDataImportingMessage + '</span>'
                        },
                        action: {type: 'dismiss'}
                    }]
                });
            }
            if(settings_output.providerApplications["Teams Application"].setupStatus == "error") {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'teams_setup_alert',
                        status: 'critical',
                        icon: 'circle-check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + settings_output.teamsDataImportingMessage + '</span>'
                        },
                        action: {type: 'dismiss'}
                    }]
                });
            }
            if(settings_output.providerApplications["Slack Application"].setupStatus == "incomplete") {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'slack_setup_alert',
                        status: 'info',
                        icon: 'circle-check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + settings_output.slackDataImportingMessage + '</span>'
                        },
                        action: {type: 'dismiss'}
                    }]
                });
            }
            if(settings_output.providerApplications["Slack Application"].setupStatus == "error") {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'slack_setup_alert',
                        status: 'critical',
                        icon: 'circle-check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + settings_output.slackDataImportingMessage + '</span>'
                        },
                        action: {type: 'dismiss'}
                    }]
                });
            }
        }
    } catch(error) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: api.data.collab_chat_settings.output.error,
                action: {type: 'dismiss'}
            }]
        });
        console.error("Error loading Collab Chat Settings: " + error.toString());
        api.setState("readOnly", true);
        pageParams.readOnly = true;
        api.setState("pageParams", pageParams);
        return;
    }
}
