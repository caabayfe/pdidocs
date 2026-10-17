var PipelineRunnerUtils = {
	/**
     * Checks to see if user is authorized to run a pipeline of a particular type by checking user has atleast 1 role/permission set defined in the pipeline type
     * Throws an error if user fails access check
     * @param {String} pipelineType - name column in sn_pipeline_pipeline_type table that defines which pipelineType to check access for
     * @param {Object} requestData - the request body. Used to extract app_sys_id when checking permissions
	 * @param {GlideRecord} grControllerEnv - controller environment record.
     * @returns {Boolean}
     */
    checkUserAccess: function(pipelineType, requestData, grControllerEnv) {
        var currentUser = gs.getUser();

        if (currentUser.hasRole("admin")) {
            return true; // You don't mess with the admin
        }

        var accessDetails = this.getPipelineTypeAccessDetails(pipelineType, grControllerEnv);
        var roles = accessDetails.roles;
        var permissionSets = accessDetails.permissionSets;
        var checkRoles = roles && roles.length;
        var checkPermissions = permissionSets && permissionSets.length;

        if (!(checkRoles || checkPermissions)) { // neither restrictions are placed, no need to go further
			return true;
        }

        if (checkRoles) {
            for (i = 0; i < roles.length; i++) {
                if (currentUser.hasRole(roles[i])) {
                    return true; // user has one of the roles
                }
            }
        }

        if (checkPermissions) {
			var scope = (requestData.payload || {}).app_sys_id;
            if (!scope) { // scope is required to check permission sets.
                throw new sn_ws_err.ServiceError()
                    .setStatus(400)
                    .setMessage(gs.getMessageLang("Invalid payload", "en"))
                    .setDetail(gs.getMessage("app_sys_id is required in payload for pipelineType {0}", pipelineType));
            }

            var scopePermSetRoleAssignmentGR = new GlideRecord('sys_scope_permission_set_role_assignment');
            scopePermSetRoleAssignmentGR.addQuery("permission_set", "IN", permissionSets.join());
            var userHasRoleJoinQueryCondition = scopePermSetRoleAssignmentGR.addJoinQuery('sys_user_has_role', "role", "role");

            userHasRoleJoinQueryCondition.addCondition("user", currentUser.getID());
            scopePermSetRoleAssignmentGR.addQuery("scope", scope);
            scopePermSetRoleAssignmentGR.query();

            if (scopePermSetRoleAssignmentGR.hasNext()) { // user has one of the permission sets in the given scope
				return true;
            }
        }

        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage(gs.getMessageLang("User Not Authorized", "en"))
            .setDetail(gs.getMessage("User failed access check for pipelineType {0}", pipelineType));
    },
	
	/**
     * Gets the roles and permissionSets set up for a pipelineType
     * @param {String} pipelineType - name column in sn_pipeline_pipeline_type table that defines which pipelineType to check access for
	 * @param {GlideRecord} grControllerEnv - controller environment record. If passed, queries the controller environment to get pipeline type record
     * @returns {Object} { roles: [Array], permissionSets: [Array]}
     */
    getPipelineTypeAccessDetails: function(pipelineType, grControllerEnv) {
        var pipelineUtils = new PipelineUtils();
        var pipelineTypeObject = {};

        if (!grControllerEnv) {
            pipelineTypeObject = pipelineUtils.getPipelineTypeByName(pipelineType);
            return {
                roles: pipelineTypeObject[PipelineConstants.formFields.ROLES_REQUIRED_IN_SOURCE_ENVIRONMENT],
                permissionSets: pipelineTypeObject[PipelineConstants.formFields.PERMISSION_SETS_REQUIRED_IN_SOURCE_ENVIRONMENT]
            };
        }

        var inputs = {};
        inputs[PipelineConstants.flow.runner.input.URL] = grControllerEnv.getValue('instance_url');
        inputs[PipelineConstants.flow.runner.input.CREDENTIAL] = grControllerEnv.instance_credential.getRefRecord();
        inputs[PipelineConstants.flow.runner.input.PIPELINE_TYPE_NAME] = pipelineType;

        var status = 500;
        var getPipelineTypeResponse = {};

        try {
            var getPipelineTypeOutputs = pipelineUtils.getPipelineActionResponse(
                PipelineConstants.flow.pipelineType.actions.GET_PIPELINE_TYPE_ACTION,
                inputs
            );

            status = getPipelineTypeOutputs["status_code"];
            getPipelineTypeResponse = getPipelineTypeOutputs.response_body ? JSON.parse(getPipelineTypeOutputs.response_body) : {};
        } catch (e) {
            gs.debug("Get Pipeline Type action failed with error: " + JSON.stringify(e));
            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error getting pipeline type details", "en"))
                .setDetail(gs.getMessage("Error when getting pipeline type details from controller instance"));
        }

        if (status === 200) {
            pipelineTypeObject = getPipelineTypeResponse.result || {};
            return {
                roles: pipelineTypeObject[PipelineConstants.formFields.ROLES_REQUIRED_IN_SOURCE_ENVIRONMENT],
                permissionSets: pipelineTypeObject[PipelineConstants.formFields.PERMISSION_SETS_REQUIRED_IN_SOURCE_ENVIRONMENT]
            };
        } else {
            var parsedError = getPipelineTypeResponse.error || {};
            throw new sn_ws_err.ServiceError()
                .setStatus(status)
                .setMessage(parsedError.message)
                .setDetail(gs.getMessage("Error when getting pipeline type details from controller instance: {0}", parsedError.detail));
        }
    },
	
	/**
     * Redirects request to controller environment
	 * @param {GlideRecord} grControllerEnv - controller environment record to which the request is redirected
	 * @param {String} pipelineType - name column in sn_pipeline_pipeline_type table for the API to hit
	 * @param {Object} requestData - the request body to send
     * @returns {Object} { status: {String}, result: {Object} }
     */
    redirectToController: function(grControllerEnv, pipelineType, requestData) {
        requestData.source_instance_id = gs.getProperty("instance_id"); // redirecting so source instance id will be current instance
		
		var authKey = (new RequestAuthService()).createKey(JSON.stringify({
			pipelineType: pipelineType,
			requestData: requestData,
			user: gs.getUserID(),
			currentTime: (new GlideDateTime()).toString()
		}));

        var inputs = {};
        inputs[PipelineConstants.flow.runner.input.URL] = grControllerEnv.getValue('instance_url');
        inputs[PipelineConstants.flow.runner.input.CREDENTIAL] = grControllerEnv.instance_credential.getRefRecord();
        inputs[PipelineConstants.flow.runner.input.PIPELINE_TYPE_NAME] = pipelineType;
        inputs[PipelineConstants.flow.runner.input.REQUEST_BODY] = JSON.stringify(requestData);
		inputs[PipelineConstants.flow.runner.input.REQUEST_AUTH_TOKEN] = authKey;

        var status = 500;
        var pipelineRunnerResponse = {};

        try {
            var pipelineRunnerOutputs = (new PipelineUtils()).getPipelineActionResponse(
                PipelineConstants.flow.runner.actions.RUNNER_ACTION,
                inputs
            );

            status = pipelineRunnerOutputs["status_code"];
            pipelineRunnerResponse = pipelineRunnerOutputs.response_body ? JSON.parse(pipelineRunnerOutputs.response_body) : {};
        } catch (e) {
            gs.debug("Pipeline Runner redirect failed with error: " + JSON.stringify(e));
            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error starting the pipeline", "en"))
                .setDetail(gs.getMessage("Error from redirecting request to controller instance"));
        }

        if (status === 201) {
            var parsedResult = pipelineRunnerResponse.result || {};
            parsedResult["redirected"] = true;
            return {
                status: 201,
                result: parsedResult
            };

        } else {
            var parsedError = pipelineRunnerResponse.error || {};
            throw new sn_ws_err.ServiceError()
                .setStatus(status)
                .setMessage(parsedError.message)
                .setDetail(gs.getMessage("Redirected response from controller instance: {0}", parsedError.detail));
        }
    },

	/**
	 * Queries sn_pipeline_pipeline table and throws an error if not found
	 * @param {String} instanceId - instance_id column of the originating environment
	 * @param {String} pipelineType - name column of the sn_pipeline_pipeline_type record
	 * @returns {GlideRecord}
	 */
    findPipelineForInstanceOfType: function(instanceId, pipelineType) {
        var grPipeline = (new PipelineUtils()).getPipelineforInstanceIdOfType(instanceId, pipelineType);

        if (!grPipeline) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Requested pipeline does not exist for given instance id.", "en"))
                .setDetail(gs.getMessage("Could not find pipeline of type {0} for instance id {1}", [pipelineType, instanceId]));
        }

        return grPipeline;
    },

	/**
	 * Initializes the  sn_pipeline_pipeline_instance record
	 * @param {String} pipelineTypeSysId - sys_id of a sn_pipeline_pipeline_type record
	 * @param {String} sourceInstanceId - instance_id column of the originating environment
	 * @param {Object} payload - payload sent to start the pipeline
	 * @returns {GlideRecord}
	 */
    initializePipelineInstanceRecord: function(pipelineTypeSysId, sourceInstanceId, payload) {
        var grPipelineInstance = new GlideRecord(PipelineConstants.table.PIPELINE_INSTANCE_TABLE);
        grPipelineInstance.newRecord();
        grPipelineInstance.setValue("pipeline_type", pipelineTypeSysId);
        grPipelineInstance.setValue("source_instance_id", sourceInstanceId);
        grPipelineInstance.setValue("pipeline_payload", JSON.stringify(payload));

        return grPipelineInstance;
    },

	/**
	 * Runs the validate payload script in sn_pipeline_pipeline_type record and saves results in a sn_pipeline_pipeline_instance record
	 * @param {GlideRecord} grPipelineInstance - sn_pipeline_pipeline_instance record to save the result to
	 * @param {Object} payload - payload to validate
	 * @param {GlideRecord} grPipelineType - sn_pipeline_pipeline_type record whose script to execute
	 * @returns {GlideRecord} sn_pipeline_pipeline_instance with results saved
	 */
    validatePayloadAndSaveResult: function(grPipelineInstance, payload, grPipelineType) {
        var payloadValidationResult = this.getPipelineTypePayloadValidationResult(grPipelineType, payload);

        grPipelineInstance.setValue("payload_validation_details", JSON.stringify(payloadValidationResult));

        if (payloadValidationResult && !payloadValidationResult.is_valid) {
            grPipelineInstance.setValue("payload_valid", false);
            grPipelineInstance.insert();

            throw new sn_ws_err.ServiceError()
                .setStatus(400)
                .setMessage(gs.getMessageLang("Invalid payload.", "en"))
                .setDetail(payloadValidationResult.error_message);
        }

        grPipelineInstance.setValue("payload_valid", true);

        return grPipelineInstance;
    },

	/**
	 * Returns the results from the validate payload script in sn_pipeline_pipeline_type record
	 * @param {GlideRecord} grPipelineType - sn_pipeline_pipeline_type record whose script to execute
	 * @param {Object} payload - payload to validate
	 * @returns {Object}
	 */
    getPipelineTypePayloadValidationResult: function(grPipelineType, payload) {
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable("payload", payload);
        return evaluator.evaluateScript(grPipelineType, 'payload_validation_script');
    },

	/**
	 * Runs the pipeline runner subflow async and returns the context id
	 * @param {GlideRecord} grPipeline
	 * @param {Object} payload
	 * @param {GlideRecord} subflow
	 * @returns {String}
	 */
    startPipelineRunnerSubflow: function(grPipeline, payload, subflow, pipelineInstance) {
        var runnerInputs = {};
        runnerInputs[PipelineConstants.flow.runner.input.PIPELINE] = grPipeline;
        runnerInputs[PipelineConstants.flow.runner.input.PAYLOAD] = payload;
        runnerInputs[PipelineConstants.flow.runner.input.PIPELINE_TYPE_SUBFLOW] = subflow;
		runnerInputs[PipelineConstants.flow.runner.input.PIPELINE_INSTANCE] = pipelineInstance;

        var subflowResult = sn_fd.FlowAPI.getRunner()
            .subflow(PipelineConstants.flow.runner.subflows.RUNNER_SUBFLOW)
            .inBackground()
            .withInputs(runnerInputs)
            .run();

        return subflowResult.getContextId();
    }
};
