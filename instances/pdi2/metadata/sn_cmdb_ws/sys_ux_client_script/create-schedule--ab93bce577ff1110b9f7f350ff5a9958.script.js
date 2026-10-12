/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.navigate.to('multisource-query', {}, {
        querySysId: api.context.props.queryId,
        step: "schedule",
        cb: Date.now()
    });
}
