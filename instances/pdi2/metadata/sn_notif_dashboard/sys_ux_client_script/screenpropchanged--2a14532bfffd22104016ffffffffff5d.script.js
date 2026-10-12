/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event?.payload?.name == 'screen') {
        if (event?.payload?.value.isActive) {
            api.setState("selectedTab", 'id=overview');
        }
    }
}
