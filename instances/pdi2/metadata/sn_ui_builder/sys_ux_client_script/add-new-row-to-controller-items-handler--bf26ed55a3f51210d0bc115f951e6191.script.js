/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const DELETE_LABEL = await helpers.translate("Delete");

    const subItems = api.state.controllerSubItems;
    const newControllerItems = api.state.controllerItems.map(elem => {
        return {
            ...elem,
            actions: [
                {
                    "icon": "trash-outline",
                    "label": DELETE_LABEL,
                    "id": "delete-field",
                    "alwaysVisible": true,
                    "disabled": false
                }
            ]
        };
    });
    const newItem = {
            "id": `${newControllerItems.length + 1}`,
            "order": 100,
            "isDraggable": false,
            "actions": [
                {
                    "icon": "trash-outline",
                    "label": DELETE_LABEL,
                    "id": "delete-field",
                    "alwaysVisible": true,
                    "disabled": false
                }
            ],
            "appendToPayload": {
                "rowIndex": 0
            },
            "subItems": subItems
        };
    newControllerItems.push(newItem);
    api.setState('enableDeleteForFirstAction', true);
    api.setState('controllerItems', newControllerItems);
}
