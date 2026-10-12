var CollabControllerUtils = Class.create();
CollabControllerUtils.prototype = {
    initialize: function() {
        var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();
        this.currentInstanceInfo = pipelineConfigChecks.getCurrentInstanceInfo();
        this.controllerEnv = pipelineConfigChecks.getControllerRecord();

        //check if current instance is controller. If not check Collaboration App Version set in session else check if controller is configured.
        if (this.isCurrentInstanceController()) {
            this.isControllerConfigured = true;
        } else {
            this.isControllerConfigured = this.checkIfControllerIsConfigured().is_active;
        }
    },
    isCurrentInstanceController: function() {
        return (this.currentInstanceInfo || {}).isController;
    },
    getIsControllerConfigured: function() {
        return this.isControllerConfigured;
    },
    getControllerRecord: function() {
        return this.controllerEnv;
    },
    getCollaborationRequestAppVersion: function() {
        var grSysScope = new GlideRecord("sys_scope");
        if (grSysScope.get(CollabTaskConstants.COLLAB_REQUEST_APP_ID)) {
            return grSysScope.getValue("version");
        }
    },
    checkIfControllerIsConfigured: function() {
        var inputs = {
            environment: this.controllerEnv
        };

        var result = sn_fd.FlowAPI.getRunner()
            .subflow("sn_collab_request.check_if_collaboration_request_is_active_on_instance")
            .inForeground()
            .withInputs(inputs)
            .run();

        var outputs = result.getOutputs() || {};

        if (outputs.unhandled_error) {
            throw gs.getMessage("The environment setup as controller is not valid.");
        }
        return outputs;
    },
    getVersionInstalledInController: function() {
        if (this.isCurrentInstanceController()) {
            return {
                isControllerConfigured: false,
                controllerVersion: ""
            };
        } else {
            return {
                isControllerConfigured: true,
                controllerVersion: this.checkIfControllerIsConfigured().app_version
            };
        }
    },

    type: 'CollabControllerUtils'
};
