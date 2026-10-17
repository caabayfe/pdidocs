(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var taskParams = {};
    taskParams.short_description_params = [current.getDisplayValue('policy')];
    taskParams.details_params = [current.getValue('policy'), current.getDisplayValue('policy')];
    new sn_vsc.SCTaskManagerOperations().queueSecurityTaskCreate(constants.securityTaskType.EVENT_NOTIFICATION, current, taskParams);
})(current, previous);
