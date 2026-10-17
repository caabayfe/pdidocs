(function executeRule(current, previous /*null when async*/ ) {
    var sysId = current.getValue('sys_id');
    var appSysId = current.getValue('app_sys_id');
    var currentState = current.getValue('state');
    var operation = current.operation();
    var createdOn = current.getValue('sys_created_on');

    var deploymentRequestUtils = new DeploymentRequestUtils();
    var isInvalid;
    var errorMessage;

    if (current.operation() === 'insert') {
        isInvalid = deploymentRequestUtils.isOpenDeploymentRequestPresentForApp(appSysId);
		
		errorMessage = gs.getMessage("Deployment Request {0} operation failed: Application with sys_id {1} has an open deployment request.", [current.operation(), appSysId]);
    } else if (deploymentRequestUtils.isNewerDeploymentRequestPresent(sysId, appSysId, createdOn)) {
        isInvalid = true;

        errorMessage = gs.getMessage("Deployment Request update operation failed: Application with sys_id {0} has a newer deployment request than request with sys_id {1}.", [appSysId, sysId]);

    }

    if (isInvalid) {
        gs.addErrorMessage(errorMessage);
        gs.error(errorMessage);
        current.setAbortAction(true);
    }
})(current, previous);
