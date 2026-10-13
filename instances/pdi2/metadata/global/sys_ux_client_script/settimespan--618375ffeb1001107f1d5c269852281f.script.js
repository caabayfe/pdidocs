/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const timeSpan = event.payload.item.id;
    switch (timeSpan) {
        case "4H":
            api.setState("num_periods", 4);
            api.setState("period", "H");
            break;
        case "1D":
            api.setState("num_periods", 1);
            api.setState("period", "D");
            break;
        case "7D":
            api.setState("num_periods", 7);
            api.setState("period", "D");
            break;
        case "30D":
            api.setState("num_periods", 30);
            api.setState("period", "D");
            break;
        default:
            api.setState("num_periods", 1);
            api.setState("period", "H");

    }
}
