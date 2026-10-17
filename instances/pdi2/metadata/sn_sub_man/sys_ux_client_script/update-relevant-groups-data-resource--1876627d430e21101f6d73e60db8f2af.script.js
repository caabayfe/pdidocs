/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    /*
    groupFilterQueryforDataBroker client state parameter is used by the 'Get Relevant Groups to Subscription' data broker. Change in state will 
    trigger the invocation of the data transform. There is no need to invoke a data resource refresh because of this
    */
    api.setState('groupFilterQueryforDataBroker', api.state.groupFilterQuery);
}
