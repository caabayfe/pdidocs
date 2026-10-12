/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { status, messages } = event.payload.data?.output.rule || {};
    if(messages && messages.length) {
        var alert = [{type: "info", message: messages, hide: false}];
        api.setState("messages", alert);
    }
}
