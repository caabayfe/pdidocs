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
    const payload = event.payload;
    const updatedControllerDepObj = { ...(api.state.controllerDepObj || {})
    };
    const newValue = {};
    if (!newValue.definition) {
        if (updatedControllerDepObj[payload.id] && updatedControllerDepObj[payload.id].definition) {
            newValue.definition = updatedControllerDepObj[payload.id].definition;
        } else {
            newValue.definition = {};
        }
    }
    if (payload.name === "controller") {
        newValue.definition.id = payload.value;
        newValue.definition.name = payload.item.label;
    }
    if (payload.name === "label") {
        newValue.definition.name = payload.fieldValue || payload.value;
    }
    if (payload.name === "depKey") {
        newValue.depKey = payload.fieldValue || payload.value;
    }
    updatedControllerDepObj[payload.id] = {
        ...updatedControllerDepObj[payload.id],
        ...newValue
    };
    api.setState('controllerDepObj', updatedControllerDepObj);

    // Actions handled here
    if (payload.actionId === "delete-field") {
        const idToDelete = payload.id;
        delete updatedControllerDepObj[idToDelete];
        const updatedControllerItems = api.state.controllerItems.filter(elem => elem.id !== idToDelete);
        if(updatedControllerItems.length === 1) {
            // Make the first controller action item to disabled so no one can delete it
            updatedControllerItems[0].actions = [{
                    "icon": "trash-outline",
                    "label": DELETE_LABEL,
                    "id": "delete-field",
                    "alwaysVisible": true,
                    "disabled": true
                }];
        }
        api.setState('controllerItems', updatedControllerItems);
    }

    
}
