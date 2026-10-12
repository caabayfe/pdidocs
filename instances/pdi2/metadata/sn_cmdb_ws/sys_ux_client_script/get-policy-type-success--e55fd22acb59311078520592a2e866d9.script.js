function script({ api, event, imports }) {
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const results = api.data.get_policy_types.results;
    if (!results || results.length === 0)
        return; // this is an error

    const policyTypeListItems = [];
    results.forEach((policyTypeData) => {
        policyTypeListItems.push({
            "label": policyTypeData._row_data.displayValue,
            "itemId": policyTypeData._row_data.uniqueValue,
            "checked": false
        });
    });
    api.setState("policyTypeListItems", cloneDeep(policyTypeListItems));
}
