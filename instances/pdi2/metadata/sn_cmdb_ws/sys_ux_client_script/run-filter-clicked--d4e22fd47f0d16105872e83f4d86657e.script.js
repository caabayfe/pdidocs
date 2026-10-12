/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { handleRelListFilterChange } = imports['sn_cmdb_ws.ManualCreateCIUtil'](...arguments);
    const {
        cbEncodedQuery: {
            value
        }
    } = api.state.relProps;
    await handleRelListFilterChange(value);
}
