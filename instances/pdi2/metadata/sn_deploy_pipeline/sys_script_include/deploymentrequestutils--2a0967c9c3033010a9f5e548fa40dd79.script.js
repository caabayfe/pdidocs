var DeploymentRequestUtils = Class.create();
DeploymentRequestUtils.prototype = {
    initialize: function() {},

    /**
     * Checks for presence of newer deployment request for the given app sys_id based on the passed date.
     *
     * @param {String} appSysId - sys_id of the app 
     * @param {String} depReqSysId - Excludes the record related to sys_id when peforming the check.
     * @param {String} createdOn - Date after which deployment requests are being looked for
     * @returns {Boolean}
     */
    isNewerDeploymentRequestPresent: function(sysId, appSysId, createdOn) {
        var depReq = new GlideRecord(DeploymentPipelineConstants.tables.DEPLOYMENT_REQUEST);

        depReq.addQuery("sys_id", '!=', sysId);
        depReq.addQuery("app_sys_id", appSysId);
        depReq.addQuery("sys_created_on", ">=", createdOn);
        depReq.query();

        return depReq.next();
    },

    /**
     * Checks to see if an open deployment request exists for the given app sys_id.
     *
     * @param {String} appSysId - sys_id of the app 
     * @returns {Boolean}
     */
    isOpenDeploymentRequestPresentForApp: function(appSysId) {
        var openDeploymentStates = DeploymentPipelineConstants.deploymentRequest.openStates;

        var depReq = new GlideRecord(DeploymentPipelineConstants.tables.DEPLOYMENT_REQUEST);

        depReq.addQuery("app_sys_id", appSysId);
        depReq.addQuery("state", DeploymentPipelineConstants.deploymentRequest.openStates);

        depReq.query();

        return depReq.next();
    },

    /**
     * Returns if present, open deployment request for the given app sys_id.
     *
     * @param {String} appSysId - sys_id of the app 
     * @returns {GlideRecord}
     */
    getOpenDeploymentRequestRecordForApp: function(appSysId) {
        var openDeploymentStates = DeploymentPipelineConstants.deploymentRequest.openStates;

        var depReq = new GlideRecord(DeploymentPipelineConstants.tables.DEPLOYMENT_REQUEST);

        depReq.addQuery("app_sys_id", appSysId);
        depReq.addQuery("state", DeploymentPipelineConstants.deploymentRequest.openStates);

        depReq.query();

        if (depReq.next()) {
            return depReq;
        }

        return null;
    },

    /**
     * Gets open deployment request from controller
     *
     * @param {String} appSysId - sys_id of the app 
     * @returns {Object}
     */
    getOpenDeploymentRequestPresentForAppFromEnv: function(appSysId, envRec) {
        var inputs = {
            app_id: appSysId,
            credential: envRec.instance_credential.getRefRecord(),
            url: envRec.getValue("instance_url")
        };

        try {
            var actionResult = sn_fd.FlowAPI.getRunner()
                .action("sn_deploy_pipeline.get_open_app_deployment_request")
                .inForeground()
                .withInputs(inputs)
                .run();

            return actionResult.getOutputs();
        } catch (e) {
            return {
                error_code: 1,
                error_message: e.getMessage()
            };
        }
    },

    checkCanUpdateDeploymentRequestOnController: function(appId, controllerEnv) {
        try {
            var actionOutputs = this.getOpenDeploymentRequestPresentForAppFromEnv(appId, controllerEnv);
            var status = actionOutputs["status_code"];
            var responseFromController = actionOutputs.response_body ? JSON.parse(actionOutputs.response_body) : {};
        } catch (e) {
            gs.debug("Fetching open deployment request from controller failed with error: " + JSON.stringify(e));

            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error fetching deployment information", "en"))
                .setDetail(gs.getMessage("Error fetching deployment information from controller instance: ", JSON.stringify(e)));
        }

        if (status !== 200) {
            var parsedError = responseFromController.error || {};

            throw new sn_ws_err.ServiceError()
                .setStatus(status)
                .setMessage(parsedError.message)
                .setDetail(gs.getMessage("Redirected response from controller instance: {0}", parsedError.detail));
        }

        var parsedResult = responseFromController.result;

        if (!parsedResult.sys_id) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Open deployment request not found.", "en"))
                .setDetail(gs.getMessage("There is no open deployment request for app id {0}.", appId));
        }

        // check if user can update records on deployment request
        var depReq = new GlideRecord(DeploymentPipelineConstants.tables.DEPLOYMENT_REQUEST);
        if (!depReq.canWrite() && parsedResult.requestor_sys_id !== gs.getUserID() && parsedResult.requestor_user_name !== gs.getUserName()) {
            throw new sn_ws_err.ServiceError()
                .setStatus(403)
                .setMessage(gs.getMessageLang("User Not Authorized.", "en"))
                .setDetail(gs.getMessage("User does not have the permission to update the deployment request for app with sys_id {0}", appId));
        }
    },

    checkCanUpdateDeploymentRequest: function(appId, depRequestRecord) {
        if (depRequestRecord.canWrite()) {
            return true;
        }

        var requestorSysId = depRequestRecord.getValue("requestor_sys_id");
        var requestorUserName = depRequestRecord.getValue("requestor_user_name");

        if (requestorSysId !== gs.getUserID() && requestorUserName !== gs.getUserName()) {
            throw new sn_ws_err.ServiceError()
                .setStatus(403)
                .setMessage(gs.getMessageLang("User Not Authorized.", "en"))
                .setDetail(gs.getMessage("User does not have the permission to update the deployment request for app with sys_id {0}", appId));
        }
    },

    updateOpenDeploymentRequestPresentForAppOnEnv: function(appId, envRec, requestBody) {
        var inputs = {
            application_sys_id: appId,
            credential: envRec.instance_credential.getRefRecord(),
            url: envRec.getValue("instance_url"),
            request_body: JSON.stringify(requestBody || {})
        };

        try {
            var actionResult = sn_fd.FlowAPI.getRunner()
                .action("sn_deploy_pipeline.update_open_deployment_request")
                .inForeground()
                .withInputs(inputs)
                .run();

            return actionResult.getOutputs();
        } catch (e) {
            return {
                error_code: 1,
                error_message: e.getMessage()
            };
        }
    },
    getDeploymentRequestObject: function(depReqRecord) {
        if (!depReqRecord || !depReqRecord.isValidRecord()) {
            return {};
        }

        var depReqObject = (new DeploymentPipelineGenericUtils()).getObjectFromGlideRecord(
            depReqRecord,
            DeploymentPipelineConstants.deploymentRequest.columns
        );
        depReqObject.state = {
            value: depReqObject.state,
            displayName: depReqRecord.getDisplayValue('state')
        };

        return depReqObject;
    },

    type: 'DeploymentRequestUtils'
};
