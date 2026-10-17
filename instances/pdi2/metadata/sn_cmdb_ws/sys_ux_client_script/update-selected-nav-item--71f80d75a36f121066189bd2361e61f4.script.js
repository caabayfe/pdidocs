/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { dirtyFormExists } = api.state;
    if (event.payload.item) {
        const selectedNav = event.payload;
        if(dirtyFormExists){
            api.setState('handleUnsavedChanges', {
                ts: Date.now()
            });
            api.setState('tempSelectedNav', selectedNav);
        }
        else
            api.setState("selectedNav", selectedNav);
    }
}
