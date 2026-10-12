/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: "Clicked Save in DT",
        value: {languageServiceProvider : api?.context?.props?.serviceProvider}
    });
}
