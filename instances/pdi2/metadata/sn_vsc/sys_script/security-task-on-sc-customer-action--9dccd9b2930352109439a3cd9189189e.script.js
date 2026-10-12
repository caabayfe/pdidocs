(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var taskParams = {};
    taskParams.short_description_params = [current.getValue('up_name')];
    taskParams.details_params = [current.getUniqueValue(), current.getValue('up_name')];
    new sn_vsc.SCTaskManagerOperations().queueSecurityTaskCreate(constants.securityTaskType.NEW_CUSTOMER_ACTION, current, taskParams);
})(current, previous);
