function script({api, event, helpers, imports}) { 
    // On textarea item set script

    const { setPolicyModelData } = imports["sn_cmdb_ws.SetPolicyModelData"]();

    if (!event.payload)
        return;
    
    const { policyData } = api.state;
    const { fieldValue, name } = event.payload;  
    const newPolicyData = setPolicyModelData(name, fieldValue, policyData);

    api.setState("policyData", newPolicyData);
}
