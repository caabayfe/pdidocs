/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("readOnly", false);
    try {
        var success = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.saveTeamsConfiguration.success;
        var message = event.payload.data.output.data.snOeSfs.sidebarAdminConsole.saveTeamsConfiguration.message;

        if(success){
            displayMessage(api, message);
            api.setState("toggleValue", api.state.isTeamsEnabled);
            api.emit('SCREEN_STATUS_CHANGED', {
                isDirty: false
            });
        } else {
            displayError(api, message);
        }
    } catch(error) {
        message = api.data.translations.output.sidebar_unknown_error || "We’ve run into an issue. Please contact technical support for details.";
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
