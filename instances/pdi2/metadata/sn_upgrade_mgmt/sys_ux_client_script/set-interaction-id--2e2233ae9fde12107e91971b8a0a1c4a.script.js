/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api?.context?.props?.patch) {
        api?.setState("toVersion", api?.context?.props?.patch?.split("|||")?.[1])
        api?.setState("fromVersion", api?.context?.props?.patch?.split("|||")?.[2])
    };
}
