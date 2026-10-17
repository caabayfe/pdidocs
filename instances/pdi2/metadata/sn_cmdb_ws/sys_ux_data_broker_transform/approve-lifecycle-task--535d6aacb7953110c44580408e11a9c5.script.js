function transform(input) {
    var wrapperFn = function() {
        var uiProxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
        return uiProxy.approveLifeCycleTask(input.taskId);
    };

    var DM = new CMDBWsDMConstants();
    return new CMDBWsDataBrokerHandler().execute(DM.DM_ERROR_SOURCE, "Approve task record", wrapperFn);
}
