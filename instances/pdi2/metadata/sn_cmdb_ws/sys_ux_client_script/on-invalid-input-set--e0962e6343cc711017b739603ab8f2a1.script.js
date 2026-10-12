function script({api, event, helpers, imports}) { 
    // Script fired on all input items
    if (!event.payload)
        return;

    const { setPolicyModelData } = imports["sn_cmdb_ws.SetPolicyModelData"]();
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { policyData, pageIsLoaded } = api.state;
    const { fieldValue, value, name } = event.payload;

    // prevent the form from flagging blank input before user has had a chance to enter data
    if (!pageIsLoaded) {
        api.setState("pageIsLoaded", true);
        return;
    }
    
    const sanitizedFieldValue = fieldValue?.replace(/([​])+/g, "");
    const newPolicyData = setPolicyModelData(name, sanitizedFieldValue, policyData);
    api.setState("policyData", cloneDeep(newPolicyData));
}
