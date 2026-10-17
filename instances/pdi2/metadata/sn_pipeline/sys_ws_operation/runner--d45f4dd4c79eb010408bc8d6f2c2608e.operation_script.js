(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var pipelineType = request.pathParams.pipeline_type;
    var requestData = request.body.data || {};
    var queryParams = request.queryParams;
    var errorDetails = '';

    var pipelineUtils = new PipelineUtils();
    var currentInstanceInfo = (new PipelineConfigChecks()).getCurrentInstanceInfo(pipelineType);

    if (!currentInstanceInfo.isController) {
        if (!currentInstanceInfo.hasValidControllerRecord) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Controller environment not found", "en"))
                .setDetail(gs.getMessage("Controller environment configured is not valid"));
        }

        // early exit if pipeline has not been setup
        if (!currentInstanceInfo.hasGivenPipelineTypeConfiguredInController) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Requested pipeline does not exist or is not valid for given instance ID.", "en"))
                .setDetail(gs.getMessage("Could not find a valid pipeline of type {0} for current instance", pipelineType));
        }

        var grControllerEnv = pipelineUtils.getEnvironmentControllerRecord();

        PipelineRunnerUtils.checkUserAccess(pipelineType, requestData, grControllerEnv);

        var redirectResult = PipelineRunnerUtils.redirectToController(grControllerEnv, pipelineType, requestData);

        response.setStatus(redirectResult.status);
        response.setBody(redirectResult.result);
    } else {
        var sourceInstanceId = requestData.source_instance_id;
        var payload = requestData.payload || {};

        // if the request is for an instance that is not the current, verify that the request originated from there
        if (sourceInstanceId && sourceInstanceId !== gs.getProperty("instance_id")) {
            var requestHeaderAccessToken = request.headers['x-access-token'];
            var isAuthorized = (new RequestAuthService()).isAuthorized(sourceInstanceId, requestHeaderAccessToken);

            if (!isAuthorized) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(400)
                    .setMessage(gs.getMessageLang("Bad Request", "en"))
                    .setDetail(gs.getMessage("Failed to verify request from source instance id {0}", sourceInstanceId));
            }
        } else {
            sourceInstanceId = gs.getProperty("instance_id"); // if source instance id was not specified, use current
            PipelineRunnerUtils.checkUserAccess(pipelineType, requestData);
        }

        var grPipeline = PipelineRunnerUtils.findPipelineForInstanceOfType(sourceInstanceId, pipelineType); // find pipeline
        var grPipelineType = grPipeline.pipeline_type.getRefRecord();
        var grPipelineInstance = PipelineRunnerUtils.initializePipelineInstanceRecord(
            grPipelineType.getUniqueValue(),
            sourceInstanceId,
            payload
        ); // initialize pipeline instance record

        // validate payload and save result in instance record
        grPipelineInstance = PipelineRunnerUtils.validatePayloadAndSaveResult(grPipelineInstance, payload, grPipelineType);


        // All is well
        // Run subflow to validate connections and start pipeline type subflow
        try {
			var pipelineInstanceSysId = grPipelineInstance.insert();
			
            var startSubflowContextId = PipelineRunnerUtils.startPipelineRunnerSubflow(grPipeline, payload, grPipelineType.subflow.getRefRecord(), grPipelineInstance);

			grPipelineInstance.get(pipelineInstanceSysId);
            grPipelineInstance.setValue("pipeline_context", startSubflowContextId);
            grPipelineInstance.update();
			
            var currentInstanceUrl = pipelineUtils.removeTrailingSlash(gs.getProperty("glide.servlet.uri"));

            response.setStatus(201);
            response.setBody({
                flow_context_url: currentInstanceUrl + "/sys_flow_context.do?sys_id=" + startSubflowContextId,
                flow_context_id: startSubflowContextId,
                pipeline_instance_id: pipelineInstanceSysId
            });

        } catch (e) {
            errorDetails = e && e.getMessage ? e.getMessage() : gs.getMessage("Unknown error occured when starting subflow runner");

            grPipelineInstance.setValue("result", {
                has_error: true,
                error_message: errorDetails
            });
            grPipelineInstance.insert();

            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error starting the pipeline", "en"))
                .setDetail(errorDetails);
        }
    }

})(request, response);
