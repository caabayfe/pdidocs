var PipelineAdminEmailUtil = Class.create();
PipelineAdminEmailUtil.prototype = {
    initialize: function() {},

    getAdminEmail: function() {
        var adminEmail = sn_app_eng_notify.AppEngineAdminGroup.getEmail();
        var piplineConfigChecks = new PipelineConfigChecks();
        try {
            var instanceInfo = piplineConfigChecks.getCurrentInstanceInfo();
            if (!instanceInfo.isController && instanceInfo.hasValidControllerRecord) {
                var pipelineUtils = new PipelineUtils();
                var controllerData = pipelineUtils.getControllerData();
                var controllerEnv = controllerData.environment;
                var inputs = {};
                inputs[PipelineConstants.flow.adminEmail.input.CREDENTIAL] = controllerEnv.instance_credential.getRefRecord();
                inputs[PipelineConstants.flow.adminEmail.input.URL] = controllerEnv.instance_url;

                var outputs = pipelineUtils.getPipelineActionResponse(
                    PipelineConstants.flow.adminEmail.actions.GET_ADMIN_CONTACT,
                    inputs
                );

                if (!outputs.error_code) {
                    var adminEmailResponse = JSON.parse(outputs[PipelineConstants.flow.adminEmail.output.RESPONSE_BODY]);
                    adminEmail = (adminEmailResponse.result && adminEmailResponse.result[PipelineConstants.flow.adminEmail.output.ADMIN_EMAIL]) || adminEmail;
                } else {
                    gs.error(gs.getMessage('Something went wrong retrieving the admin contact from the controller. {0}', outputs.error_message));
                }

            }
        } catch (exception) {
            gs.error(gs.getMessage('Failed to retrieve the admin contact from the controller.  {0}', exception.message));
        }

        return adminEmail;
    },

    type: 'PipelineAdminEmailUtil'
};
