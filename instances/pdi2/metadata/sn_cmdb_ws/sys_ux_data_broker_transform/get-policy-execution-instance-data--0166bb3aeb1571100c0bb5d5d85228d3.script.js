function transform(input) {
    var DM = new CMDBWsDMConstants();
    var uiProxy = new CMDBWsDMPolicyUIProxy();
    var wrapperFn = function() {
        return uiProxy.getPolicyExecutionInfo(input.policyExecutionId);
    };
    return new CMDBWsDataBrokerHandler().execute("Get policy execution instance data", DM.DM_ERROR_SOURCE, wrapperFn);
}
