/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isGrid = api.state.defaultLayout == "grid";
    const isList = api.state.defaultLayout == "list";
    api.setState("ariaPropsgrid", {
        "aria-label": "Grid view",
        "aria-pressed": isGrid.toString(),
        "role": "button", 
    });
    api.setState("ariaPropslist",{
        "aria-label": "List view",
        "aria-pressed": isList.toString(),
        "role":"button",
    });
}
