/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    switch(event.name) {
        case "LIST_SELECTOR_CANCEL_BUTTON":
        helpers.timing.setTimeout(() => {
            api.emit("LIST_SELECTOR_CANCEL_BUTTON_FROM_CONTROLLER");
        }, 0);
        break;
        case "SET_SELECTED_COLUMNS_CONTROLLER":
        api.setState("selectedCols",event.payload.selectedCols);
        api.setState("selectedColsDefault",event.payload.selectedColsDefault);
        break;
        case "SET_NEW_SELECTED_COLUMNS_CONTROLLER":
        api.setState("selectedCols",event.payload.selectedColsNew);
        helpers.timing.setTimeout(()=>{
            api.emit("NEW_COLUMNS_FROM_CONTROLLER");
        },200);
        break;
        case "LIST_SELECTOR_DEFAULT_BUTTON":
        api.setState("selectedCols",api.state.selectedColsDefault);
        helpers.timing.setTimeout(()=>{
            api.emit("NEW_COLUMNS_FROM_CONTROLLER");
        },200);
        break;
        default:
    }
}
