function script({ api, event, helpers, imports }) {
    const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();
    const results = api.data.get_policy_types.results;
    if (!results || results.length === 0)
        return; // this is an error
 
    const policyTypeListItems = [];
    results.forEach((policyTypeData) => {
        policyTypeListItems.push({
            "label": policyTypeData._row_data.displayValue,
            "id": policyTypeData._row_data.uniqueValue
        });
    });
    api.setState("policyTypeListItems", cloneDeep(policyTypeListItems));
    if (!api.state.isEditMode) {
        api.setState("selectedPolicyTypeSysId", "");
    }
}
