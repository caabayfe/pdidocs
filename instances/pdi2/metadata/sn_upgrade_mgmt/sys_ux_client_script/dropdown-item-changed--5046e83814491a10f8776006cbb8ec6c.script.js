/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("selectedGuidedSetup", {
        "sys_id": {value : event?.payload?.items?.[0]?.id},
        "setup_name": {value : event?.payload?.items?.[0]?.label}
    });

}
