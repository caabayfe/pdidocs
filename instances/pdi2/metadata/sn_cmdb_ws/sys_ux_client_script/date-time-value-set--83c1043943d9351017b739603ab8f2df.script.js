function script({ api, event, helpers, imports }) {
    // Script fired on all date time items
    if (!event.payload)
        return;

    const { setPolicyModelData } = imports["sn_cmdb_ws.SetPolicyModelData"]();
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { policyData, pageIsLoaded } = api.state;
    const { fieldValue, value, name } = event.payload;

    if (Object.keys(policyData).length === 0 || !fieldValue)
        return;

    const newPolicyData = setPolicyModelData(name, fieldValue, policyData);
    api.setState("policyData", cloneDeep(newPolicyData));
}
