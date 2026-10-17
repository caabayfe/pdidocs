/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!event.payload.data.output.error) {
        if (event.payload.data.output.status) {
            helpers.translate("Activated schedule successfully").then((text) => {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        "id": "successful_run",
                        "status": "positive",
                        "icon": "info-circle-outline",
                        "content": text,
                        "action": {
                            "type": "dismiss"
                        }
                    }]
                });
            });
        } else {
            helpers.translate("Deactivated schedule successfully").then((text) => {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        "id": "successful_run",
                        "status": "positive",
                        "icon": "info-circle-outline",
                        "content": text,
                        "action": {
                            "type": "dismiss"
                        }
                    }]
                });
            });
        }
    } else {
        helpers.translate("Error settings active status").then((text) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    "id": "successful_run",
                    "status": "critical",
                    "icon": "info-circle-outline",
                    "content": text,
                    "action": {
                        "type": "dismiss"
                    }
                }]
            });
        });
    }
}
