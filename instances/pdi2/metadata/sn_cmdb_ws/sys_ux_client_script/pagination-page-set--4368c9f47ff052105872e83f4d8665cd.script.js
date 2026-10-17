/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getRelRowDefinitions
    } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        value
    } = event.payload;
    const {
        relationships,
        pageSize,
        rowSelectionObj
    } = api.state.relProps;

    let rows = getRelRowDefinitions(relationships, value, pageSize, rowSelectionObj);
    api.setState('relProps', {
        ...api.state.relProps,
        rowDefinitions: {
            rows
        },
        selectedPage: value
    });
}
