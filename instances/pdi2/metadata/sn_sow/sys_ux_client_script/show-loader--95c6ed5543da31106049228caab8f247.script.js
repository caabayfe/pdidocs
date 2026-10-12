/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("isLoading", true);
    
    const loadingMsg = await helpers.translate("Loading...");
    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        id: "blocking",
        loading: true,
        label: loadingMsg
    });
}
