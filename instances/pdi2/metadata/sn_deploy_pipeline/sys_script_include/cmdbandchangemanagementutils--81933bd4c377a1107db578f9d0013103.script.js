var CMDBAndChangeManagementUtils = Class.create();
CMDBAndChangeManagementUtils.prototype = {
    initialize: function() {},
    isCMDBPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.cmdb');
    },
    isChangeManagementPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.change_management');
    },
    isChangeManagementIntegrationEnabled: function() {
        var propertyName = 'sn_deploy_pipeline.change_management.enabled';
        return gs.getProperty(propertyName) == 'true';
    },
    shouldEnableChangeManagementIntegration: function() {
        return this.isCMDBPluginActive() && this.isChangeManagementPluginActive() && this.isChangeManagementIntegrationEnabled();
    },
    isChangeManagementIntegrationFailed: function(deploymentRequestSysId, environmentSysId) {
        var hasError = false;
        var envGr = new GlideRecord('sn_deploy_pipeline_deployment_environment_result');
        envGr.addQuery('deployment_request', deploymentRequestSysId);
        envGr.addQuery('environment', environmentSysId);
        envGr.query();

        while (envGr.next()) {
            if (envGr.getValue('has_error') === '1' && envGr.getValue('error_type') === 'change_integration_fail') {
                hasError = true;
                break;
            }
        }
        return hasError;
    },
    cancelChangeRequestIfExists: function(deploymentRequestSysId) {
        var CHANGE_REQUEST_CLOSED_STATE = 3;
        var CHANGE_REQUEST_CANCELED_STATE = 4;
        var isChangeRequestCanceled = false;
        var result = {
            status: false,
            message: ''
        };

        var deploymentRequestGR = new GlideRecordSecure('sn_deploy_pipeline_deployment_request');
        var hasValidDeploymentRequest = deploymentRequestGR.get(deploymentRequestSysId);
        if (hasValidDeploymentRequest) {
            var changeRequestRecord = deploymentRequestGR.change_request.getRefRecord();

            if (changeRequestRecord.isValidRecord()) {
                if (changeRequestRecord.state != CHANGE_REQUEST_CLOSED_STATE && changeRequestRecord.state != CHANGE_REQUEST_CANCELED_STATE) {
                    changeRequestRecord.state = CHANGE_REQUEST_CANCELED_STATE;
                    isChangeRequestCanceled = changeRequestRecord.update();
                    if (!isChangeRequestCanceled) {
                        result.message = gs.getMessage("Unable to cancel change request with sys_id: {0}", [changeRequestRecord.sys_id]);
                    } else {
                        result.status = true;
                    }
                }
            }
        }
        return result;
    },

    type: 'CMDBAndChangeManagementUtils'
};
