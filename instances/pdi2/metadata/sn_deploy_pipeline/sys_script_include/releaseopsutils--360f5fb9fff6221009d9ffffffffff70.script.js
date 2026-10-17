var ReleaseOpsUtils = Class.create();
(function() {
    ReleaseOpsUtils.isReleaseOpsPluginActive = function() {
        return GlidePluginManager.isActive(DeploymentPipelineConstants.RELEASEOPS_PLUGIN_ID);
    };
    ReleaseOpsUtils.isReleaseOpsMigrationEnabled = function() {
        let propertyName = 'sn_deploy_pipeline.migrate_releaseops';
        return gs.getProperty(propertyName) === 'true';
    };

    /**
     * Returns the equivalent ReleaseOps deployment instance source env using the AE source env record as input
     * @param {String} sourceEnvAE - AE source env (sn_pipeline_environment) sysId
     * @returns {String} ReleaseOps deployment instance (sn_releaseops_deployment_instance) sysId for the equivalent source env
     */
    ReleaseOpsUtils.getReleaseOpsSourceEnv = function(sourceEnvAE) {
        var grPipelineEnvironment = new GlideRecordSecure(DeploymentPipelineConstants.pipeline.tables.ENVIRONMENT);

        if (!grPipelineEnvironment.get(sourceEnvAE)) {
            return null;
        }

        var instanceId = grPipelineEnvironment.getValue('instance_id');
        var grDeploymentInstance = new GlideRecordSecure(DeploymentPipelineConstants.RELEASEOPS_DEPLOYMENT_INSTANCE);

        if (!grDeploymentInstance.isValid()) {
            return null;
        }

        grDeploymentInstance.addQuery('mif_instance.instance_id', instanceId);
        grDeploymentInstance.query();

        if (grDeploymentInstance.next()) {
            return grDeploymentInstance.getUniqueValue();
        }
        return null;
    };

    /**
     * Retrieves the controller record from the pipeline configuration.
     * Uses PipelineConfigChecks utility to fetch the deployment pipeline controller record.
     * 
     * @returns {GlideRecord} The controller record from the pipeline configuration, or null if not found
     */
    ReleaseOpsUtils.getControllerRecord = function() {
        var configChecks = new sn_pipeline.PipelineConfigChecks();
        var controllerRecord = configChecks.getControllerRecord();
        return controllerRecord;
    };

    /**
     * Formats input data into a structured request body for to create ReleaseOps deployment request.
     * 
     * @param {Object} input - The input object containing deployment request data
     * @param {string} input.description - Description of the deployment request
     * @param {string} input.shortdescription - Short description of the deployment request
     * @param {boolean} input.ondemand - Whether the deployment is on-demand
     * @param {string} input.state - State of the deployment request
     * @param {string} input.sourceenv - Source environment identifier
     * @param {string} input.updatesetid - Update set id to be deployed
     * @param {string} input.sourceenvinstanceid - Source environment instance ID
     * @returns {Object} Formatted request body object with columns, references, and update_sets properties
     */
    ReleaseOpsUtils.formatRequestBody = function(input) {
        return {
            "columns": {
                "description": input.description,
                "short_description": input.shortdescription,
                "on_demand": input.ondemand,
                "state": input.state,
                "source_environment": input.sourceenv
            },
            "references": [{
                "table_name": "sys_user_group",
                "ref_column": "assignment_group",
                "encoded_query": "name=App Engine Admins"
            }],
            "update_sets": [{
                "table_name": "sn_releaseops_deployment_request_update_set",
                "ref_column": "deployment_request",
                "action": "insert",
                "columns": {
                    "update_set_name": input.description,
                    "update_set_id": input.updatesetid,
                    "source_environment": input.sourceenvinstanceid
                }
            }],
        };
    };

    /**
     * Extracts deployment request record information from a response body
     * 
     * @param {String} responseBody - JSON string containing the response data
     * @returns {Object} Object containing deploymentRequestNumber and deploymentRequestSysId
     */
    ReleaseOpsUtils.getDeploymentRequestRecordInfo = function(responseBody) {
        var responseObj;
        var drInfo = {
            deploymentRequestNumber: null,
            deploymentRequestSysId: null
        };

        try {
            responseObj = JSON.parse(responseBody);
        } catch (error) {
            return drInfo;
        }

        var insertedTables = responseObj?.result?.inserted;

        if (!Array.isArray(insertedTables)) {
            return drInfo;
        }

        var drRecord = insertedTables.find(function(tableObj) {
            return tableObj && tableObj.table === 'sn_releaseops_deployment_request';
        });

        if (drRecord && drRecord.columns) {
            drInfo.deploymentRequestNumber = drRecord.columns.number || null;
            drInfo.deploymentRequestSysId = drRecord.columns.sys_id || null;
        }
        return drInfo;
    };

    /**
     * Synchronizes the state of an App Engine deployment request with a ReleaseOps deployment request state.
     * Finds the AE deployment request that references the given ReleaseOps deployment request and updates its state.
     * Only performs the update if a matching AE deployment request is found.
     * 
     * @param {String} releaseOpsDeploymentRequestSysId - The sysId of the ReleaseOps deployment request
     * @returns {void}
     */
    ReleaseOpsUtils.syncDeploymentRequestState = function(releaseOpsDeploymentRequestSysId) {
        const aeDeploymentRequest = new GlideRecordSecure(DeploymentPipelineConstants.tables.DEPLOYMENT_REQUEST);

        aeDeploymentRequest.addQuery('releaseops_deployment_request', releaseOpsDeploymentRequestSysId);
        aeDeploymentRequest.query();

        // only take action if there is a AE deployment request with a reference to this ReleaseOps DR
        if (aeDeploymentRequest.next()) {
            const roDeploymentRequest = new GlideRecordSecure(DeploymentPipelineConstants.releaseOpsDeploymentRequest.tables.RELEASEOPS_DEPLOYMENT_REQUEST);
            const drStateMap = new GlideRecordSecure('sn_deploy_pipeline_dr_state_map');

            if (roDeploymentRequest.get(releaseOpsDeploymentRequestSysId)) {
                // get equivalent AE state from RO state
                drStateMap.addQuery('releaseops_dr_state', roDeploymentRequest.getValue('state'));
                drStateMap.query();

                if (drStateMap.next()) {
                    aeDeploymentRequest.setValue('state', drStateMap.getValue('app_engine_dr_state'));
                    aeDeploymentRequest.update();
                    gs.info(`Synced state of AE deployment request: ${aeDeploymentRequest.getValue('number')}, to: ${drStateMap.getDisplayValue('app_engine_dr_state')}, to match referenced ReleaseOps DR`);
                }
            }
        }
    };

    /**
     * Synchronizes the cancellation of a ReleaseOps deployment request
     *  
     * @param {string} releaseOpsDeploymentRequestSysId - The sys_id of the ReleaseOps deployment request to cancel
     * 
     * @returns {void} 
     */
    ReleaseOpsUtils.syncDeploymentRequestCancel = function(releaseOpsDeploymentRequestSysId) {
        var grReleaseOpsRecord = new GlideRecord(DeploymentPipelineConstants.releaseOpsDeploymentRequest.tables.RELEASEOPS_DEPLOYMENT_REQUEST);
        var canWrite = grReleaseOpsRecord.canWrite();
        if (grReleaseOpsRecord.get(releaseOpsDeploymentRequestSysId) && canWrite) {
            // Update the state to "Cancelled" (hardcoded value)
            grReleaseOpsRecord.setValue('state', DeploymentPipelineConstants.releaseOpsDeploymentRequest.state.CANCELLED);
            grReleaseOpsRecord.update();

            gs.info("Successfully updated ReleaseOps deployment request " + releaseOpsDeploymentRequestSysId +
                " state to 'Cancelled'");
        } else {
            gs.error(gs.getMessage("Could not find ReleaseOps deployment request with sys_id: {0}", releaseOpsDeploymentRequestSysId));
        }
    };
    ReleaseOpsUtils.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'ReleaseOpsUtils'
    };
})();
