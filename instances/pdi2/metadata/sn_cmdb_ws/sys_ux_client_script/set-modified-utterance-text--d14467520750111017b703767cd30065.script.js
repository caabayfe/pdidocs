/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.context.props.modification) {
        const correctedUtterance = api.context.props.modification;
        api.setState("modifiedUtteranceText", api.state._modifiedTextPrefix + ': ' + '"' + correctedUtterance + '"');
    }
}
