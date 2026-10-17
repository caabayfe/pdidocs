/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    // work around for hiding popup window
    if (api.state.currentItemPill == 1) {
        api.setState("currentItemPill", 0);
    } else {
        api.setState("currentItemPill", 1);
    }

    switch (api.state.selectedType) {
        case "class":
            api.setState('selectedID', event.payload.item.id);
            api.setState('selectedLabel', api.state.classLookup[event.payload.item.id]);
            break;
        case "group":
            api.setState('selectedGroup', event.payload.item.id);
            api.setState('selectedLabel', api.state.groupsLookup[event.payload.item.id]);
            break;
        case "service":
            api.setState('selectedService', event.payload.item.id);
            api.setState('selectedLabel', api.state.serviceLookup[event.payload.item.id]);
            break;
    }
}
