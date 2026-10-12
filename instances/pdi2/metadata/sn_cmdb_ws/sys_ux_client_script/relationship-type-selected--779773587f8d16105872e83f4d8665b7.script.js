/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { handleRelListFilterChange } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const { item } = event.payload;

    //add orderBy sysId to listFilter, by default when rel type changes    
    const orderBySysId = "ORDERBYsys_id";
    const listFilter = (item.filter != null && item.filter != "") ? item.filter + "^" + orderBySysId : "=" + orderBySysId;

    api.setState('relProps', ({currentValue}) => {
        return {
            ...currentValue,
            relTypeSelectedItem: item
        };
    });
    api.setState('listControllerTable', item.table);
    api.setState('listControllerFilter', listFilter);
    api.setState('listControllerSortApplied', false); //reset sort order applied when rel type changes
    await handleRelListFilterChange(listFilter);
}
