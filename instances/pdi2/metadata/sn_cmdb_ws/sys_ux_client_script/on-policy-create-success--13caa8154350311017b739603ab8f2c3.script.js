function script({ api, event, helpers }) { 
    const policySysId = event.payload.data?.output?.policySysId;
    const policyUpdated = event.payload.data?.output?.policyUpdated;

    if (policySysId) {
        api.setState("policySysId", policySysId);
        helpers.navigate.to(
            'data-manager-policy-form',
            {
                "policySysId": policySysId,
                "ts": Date.now()
            },
            null,
            true,
            true,
            'current');
    } else
        console.error("policy sys_id was not found in " + event.payload.dataElemId + " payload");

    if (policyUpdated)
        api.setState("policyUpdated", policyUpdated);
    else
        console.error("policy updated was not found in " + event.payload.dataElemId + " payload");
}
