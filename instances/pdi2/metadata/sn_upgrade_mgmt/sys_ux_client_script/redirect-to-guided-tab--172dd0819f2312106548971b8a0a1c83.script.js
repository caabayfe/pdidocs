/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        helpers.timing.setTimeout( () => {
            api.emit("NOW_TABS#SELECTED_ITEM_SET", {
                "value": "guided_upgrade",
                "item": {
                    "label": "Guided Upgrade",
                    "order": 20,
                    "route": "playbook-vertical-focused",
                    "id": "guided_upgrade",
                    "type": "template",
                    "conditional": null
                }
            });
        }, 300);
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Redirect to guided tab", e);
    }
}
