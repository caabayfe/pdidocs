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
        selectedPage,
        rowSelectionObj
    } = api.state.relProps;

    let rows = getRelRowDefinitions(relationships, selectedPage, value, rowSelectionObj);

    api.setState('relProps', {
        ...api.state.relProps,
        rowDefinitions: {
            rows
        },
        pageSize: value
    });
}
