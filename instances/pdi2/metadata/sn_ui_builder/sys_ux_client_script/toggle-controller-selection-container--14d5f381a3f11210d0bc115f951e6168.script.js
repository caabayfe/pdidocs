/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const DELETE_LABEL = await helpers.translate("Delete");
    if (event.payload.buttonId === 'back-to-page-collection') {
        api.setState('showControllerSelection', false);
    } else {
        if (api.state.controllerItems.length === 0) {
            const componentList = api.state.controllerList;
        const subItems = [{
                "label": "",
                "required": true,
                "type": "select",
                "options": componentList,
                "appendToPayload": {
                    "name": "controller"
                }
            },
            {
                "label": "",
                "required": true,
                "type": "text",
                "appendToPayload": {
                    "name": "label"
                }
            },
            {
                "label": "",
                "required": true,
                "type": "text",
                "appendToPayload": {
                    "name": "depKey"
                }
            }

        ];
        const item = [{
            "id": "1",
            "order": 100,
            "isDraggable": false,
            "actions": [
                {
                    "icon": "trash-outline",
                    "label": DELETE_LABEL,
                    "id": "delete-field",
                    "alwaysVisible": true,
                    "disabled": true
                }
            ],
            "appendToPayload": {
                "rowIndex": 0
            },
            "subItems": subItems
        }];
            api.setState('controllerSubItems', subItems);
            api.setState('controllerItems', item);
        }
        api.setState('showControllerSelection', true);
    }
}
