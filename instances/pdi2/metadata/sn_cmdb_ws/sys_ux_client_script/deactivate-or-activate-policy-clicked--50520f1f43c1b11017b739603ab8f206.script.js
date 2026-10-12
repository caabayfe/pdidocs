function script({api, event}) {
    api.data.dmActivateDeactivatePolicy.execute({
        policySysId: api.data.getDataManagerPolicyDetails.output.policyData.policyId,
        isActivatePolicy: api.state.isDeactivated
    });
}
