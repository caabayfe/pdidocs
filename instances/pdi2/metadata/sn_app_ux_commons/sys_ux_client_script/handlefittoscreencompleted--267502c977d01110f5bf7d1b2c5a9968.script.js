/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {nodes} = api.state.mapData;

    /**
     * Keep fitToScreen=true until the node-map has some nodes to display.
     *
     */
    if (nodes.length > 0)
        api.setState('fitToScreen', false);
}
