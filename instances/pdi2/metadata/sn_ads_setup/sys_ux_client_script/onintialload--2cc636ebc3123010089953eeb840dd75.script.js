/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const recordValues = api.data.fetch_guidance_details.result;
    const record = recordValues.type ? recordValues.type.value : false;

    if (!record || record !== 'global_setup') {
        api.setState('showAlert', true);
    }
  
    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        loading: false,
        nonBlocking: false
    });
    
    return;
}
