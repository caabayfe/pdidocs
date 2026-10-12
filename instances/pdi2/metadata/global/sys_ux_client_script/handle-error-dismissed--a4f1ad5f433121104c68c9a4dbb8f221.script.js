/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {index} = event.context.item;
    api.setState('errors', api.state.errors.filter((element, id) => id!=index));

}
