function script({api, event, helpers}) { 
    const newPolicyType = event.payload.value;
    api.setState("selectedPolicyTypeSysId", newPolicyType);
    const oldPolicyType = api.state.policyData.general_info.cmdb_policy_type;
    if (api.state.isEditMode && newPolicyType !== oldPolicyType) {
        api.setState("selectItemEventPayload", {
             name: "general_info:cmdb_policy_type",
             value: event.payload.value,
             item: event.payload.item
        });
        helpers.modal.open('confirm_policy_type_change');
    }
}
