async function handler({api, event, helpers, imports}) {  
    let ciSysId = event.payload.value;
    let ciDisplayValue = event.payload.item.label;

    const { setDependentCiRelationship } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    await setDependentCiRelationship(ciSysId, ciDisplayValue);
}
