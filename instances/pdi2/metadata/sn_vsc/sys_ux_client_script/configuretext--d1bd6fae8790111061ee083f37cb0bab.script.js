/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var length = api?.context?.props?.payload?.props_details?.current_value?.length;
    var isShortText = (length == null) || (length < 105);
    api.setState('isShortText', isShortText);
}
