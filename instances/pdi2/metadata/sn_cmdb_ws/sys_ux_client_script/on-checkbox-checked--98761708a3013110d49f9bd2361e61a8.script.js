function script({api, event, helpers, imports}) {
    // Script fired on all checkbox items
    if (!event.payload)
        return;

    const { setPolicyModelData } = imports["sn_cmdb_ws.SetPolicyModelData"]();
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { policyData } = api.state;
    const { value, name } = event.payload;
    
    const newPolicyData = setPolicyModelData(name, value, policyData);
    api.setState("policyData", cloneDeep(newPolicyData));
}
