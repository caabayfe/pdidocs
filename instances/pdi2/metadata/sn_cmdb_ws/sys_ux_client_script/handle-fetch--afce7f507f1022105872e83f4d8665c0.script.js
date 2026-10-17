/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        CONSTANTS: {
            LOAD_TYPE_FLAT,
            LOAD_TYPE_TREE
        }, 
        handleFlatLoadType, 
        handleTreeLoadType 
    } = imports["sn_cmdb_ws.CiRelationshipViewUtils"](...arguments);
    const {
        filter,
        loadType
    } = api.state;

    if (loadType == LOAD_TYPE_TREE) {
        await handleTreeLoadType();
    } else if (loadType == LOAD_TYPE_FLAT) {
        await handleFlatLoadType(filter);
    }
    api.setState('loading', false);
    api.setState('error', false);
}
