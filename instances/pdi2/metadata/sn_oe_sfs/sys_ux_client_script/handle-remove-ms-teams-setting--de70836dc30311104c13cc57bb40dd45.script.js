/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        var success = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.deleteTeamsConfiguration.success;
        var message = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.deleteTeamsConfiguration.message;

        if(success){
            var pageParams = api.state.pageParams;
            delete pageParams.providerApplications["Teams Application"];
            pageParams.readOnly = false;
            pageParams.isTeamsConfigured = false;
            api.setState("pageParams", pageParams);
            api.data.ace_fetch_content_blocks.refresh();
            displayMessage(api, message);
        } else {
            displayError(api, message);
        }
    } catch(error) {
        message = api.data.translations.output.sidebar_unknown_error || "There was an unknown error. Please contact your admin for details";
        displayError(api, message);
        console.error("Error: " + error.toString());

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
}
