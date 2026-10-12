/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const details = api.context.props.payload.props_details;
    helpers.modal.open("custom_1", {});
    api.setState("hideModal", false);
    api.setState("query", api.state.encodedQuery || details.encoded_query);
}
