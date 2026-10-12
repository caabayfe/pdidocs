/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("currentScreenData", api.context.props.payload.children[0]);
    api.setState("actionsData", api.context.props.payload.children[0].children);
    api.setState("splitButtonActionData", api.context.props.payload.children[0].splitButtonActionData);
}
