async function script({ api, event, helpers }) {
    const policyData = event.payload.data?.output?.policyData;
    const policyUpdated = event.payload.data?.output?.policyUpdated;

    if (policyData) {
        // grab some select data for the policy form
        const oldPolicyData = api.state.policyData;
        const policyTypeName = policyData.general_info.cmdb_policy_type_name;
        oldPolicyData.general_info.cmdb_policy_type_name = policyTypeName
        oldPolicyData.status = policyData.status;
        api.setState("policyData", oldPolicyData);
        api.setState("lifecyclePolicyScheduleHeader", await helpers.translate("{0} policy schedule", policyTypeName));
        api.setState("lifecyclePolicyScheduleText", await helpers.translate("{0} policies are evaluated once a day as defined in the scheduled job.", policyTypeName));
    } else
        console.error("policyData was not found in " + event.payload.dataElemId + " payload");

    if (policyUpdated)
        api.setState("policyUpdated", policyUpdated);
    else
        console.error("policy updated was not found in " + event.payload.dataElemId + " payload");

    // refresh the record and tasks count data
    if (api.state.refreshCounts) {
        api.setState("refreshCounts", false);
        api.data.get_data_manager_policy_review_info.execute({
            "policySysId": api.state.policySysId
        });
    }
}
