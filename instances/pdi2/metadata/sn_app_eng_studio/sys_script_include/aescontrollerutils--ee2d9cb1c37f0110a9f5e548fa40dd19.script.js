var AesControllerUtils = Class.create();
AesControllerUtils.prototype = {
    initialize: function() {
        var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();
        this.currentInstanceInfo = pipelineConfigChecks.getCurrentInstanceInfo();
        this.controllerEnv = pipelineConfigChecks.getControllerRecord();
    },
    isCurrentInstanceController: function() {
        return (this.currentInstanceInfo || {}).isController;
    },
    getControllerConfigurationData: function() {
        var hasValidControllerRecord = this.currentInstanceInfo.hasValidControllerRecord;
        var isControllerConfigured = hasValidControllerRecord && !!this.controllerEnv;

        var output = {
            is_controller_configured: isControllerConfigured
        };

        if (isControllerConfigured) {
            output.controller_instance_url = this.controllerEnv.instance_url.toString();
            output.controller_cred_ref = this.controllerEnv.instance_credential.getRefRecord();
        }
		
		return output;
    },

    type: 'AesControllerUtils'
};
