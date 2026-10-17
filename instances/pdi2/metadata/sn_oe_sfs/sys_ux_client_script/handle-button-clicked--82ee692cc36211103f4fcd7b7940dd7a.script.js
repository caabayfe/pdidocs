/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var elementId = event.elementId;
    api.setState('readOnly', true);

    switch(elementId) {
        case "button_1": //save button
            var message = api.data.translations.output.sidebar_updating_settings || "Give us a minute to update your settings.";
            displayMessage(api, 'circle-check-outline', message);
        break;
        case "button_2": //submit button
            api.emit("SCREEN_STATUS_CHANGED", {
                isDirty: false
            });
            var message = api.data.translations.output.sidebar_importing_data || "We’re loading your data. We’ll notify you once your integration is ready to use.";
            displayMessage(api, 'circle-check-outline', message);
        break;
    }

    function displayMessage(api, icon,message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'info',
                icon: icon,
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }
}
