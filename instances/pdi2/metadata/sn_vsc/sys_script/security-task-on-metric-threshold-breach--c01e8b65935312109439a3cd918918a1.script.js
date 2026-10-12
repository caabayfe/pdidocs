(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var taskParams = {};
    taskParams.short_description_params = [current.getDisplayValue('metric')];
    taskParams.details_params = [current.getValue('metric'), current.getDisplayValue('metric')];
    new sn_vsc.SCTaskManagerOperations().queueSecurityTaskCreate(constants.securityTaskType.METRICS_THRESHOLD, current, taskParams);
})(current, previous);
