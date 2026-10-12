(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // if pipeline table exists
    var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();

    var grController = pipelineConfigChecks.getControllerRecord();
    if (grController) {
        try {
            var subflowResult = sn_fd.FlowAPI.getRunner()
                .subflow("sn_app_eng_studio.check_if_deployment_pipeline_is_active_on_instance")
                .inForeground()
                .withInputs({
                    url: grController.getValue('instance_url'),
                    credentials: grController.instance_credential.getRefRecord()
                })
                .run();

            var subflowOutputs = subflowResult.getOutputs();

            if (!subflowOutputs["unhandled_error"]) {
                response.setStatus(200);
                response.setBody({
                    isActive: subflowOutputs["is_active"]
                });
                return;
            }
        } catch (e) {
            gs.debug("Error occurred when running check_if_deployment_pipeline_is_active_on_instance with error: " + e.getMessage());
        }
    } else {
        response.setStatus(200);
        response.setBody({
            isActive: true
        });
        return;
    }

    throw new sn_ws_err.ServiceError()
        .setStatus(500)
        .setMessage(gs.getMessageLang("Could not get information from controller environment", "en"))
        .setDetail(gs.getMessage("Could not get information from controller environment"));

})(request, response);
