/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.context.props && api.context.props.search) {
        api.setState('search',api.context.props.search);
        api.setState('filter', 'type1');
    }
}
