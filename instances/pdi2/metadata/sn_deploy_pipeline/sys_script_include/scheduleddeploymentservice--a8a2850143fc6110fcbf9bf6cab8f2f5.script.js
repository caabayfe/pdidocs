/**
 * Commonly used functions that support scheduled deployments.
 */

var ScheduledDeploymentService = Class.create();

(function() {
    ScheduledDeploymentService.SCHEDULED_DEPLOYMENT_REQUEST_TABLE = 'sn_deploy_pipeline_scheduled_deployment';
    ScheduledDeploymentService.DEPLOYMENT_REQUEST_TABLE = 'sn_deploy_pipeline_deployment_request';

    /**
     * Returns scheduled deployment gliderecords for deployments ready to be promoted to production.
     */
    ScheduledDeploymentService.hasScheduledDeploymentsReadyForInstall = function() {
        return getScheduledDeployments().next();
    };

    ScheduledDeploymentService.triggerScheduledDeploymentsInstall = function() {
        var scheduledDeploymentGR = getScheduledDeployments();
        var appSysIDs = [];

        while (scheduledDeploymentGR.next()) {
            var deploymentRequestRecord = scheduledDeploymentGR.deployment_request.getRefRecord();
            var appSysID = deploymentRequestRecord.getValue('app_sys_id');
            var appVersion = deploymentRequestRecord.getValue('app_version');
            var deploymentRequestState = deploymentRequestRecord.getValue('state');

            /**
             * Guarding against scheduled deployment records for older versions of the same application.
             * Updating `deployment_status` for older versions so they will not be processed by the scheduled job.
             */
            if (appSysIDs.indexOf(appSysID) >= 0) {
                scheduledDeploymentGR.setValue('deployment_status', 'fail');
                scheduledDeploymentGR.update();
                gs.info('Updating scheduled deployment status to fail for application: ' + appSysID + ' appVersion: ' + appVersion);

                continue;
            }

            appSysIDs.push(appSysID);

            /**
             * Guarding against deployment request with state of 'New' (0), 'Closed - Published' (2), 'Closed - Rejected' (3), 'Closed - Failed' (4) and 'Canceled(5)'
             * Updating `deployment_status` when the deployment request is canceled and app is ready to be promoted to production.
             */
            if (deploymentRequestState === '3') {
                scheduledDeploymentGR.setValue('deployment_status', 'rejected');
                scheduledDeploymentGR.update();

                return;
            } else if (deploymentRequestState === '4') {
                scheduledDeploymentGR.setValue('deployment_status', 'fail');
                scheduledDeploymentGR.update();

                return;
            } else if (deploymentRequestState === '5') {
                scheduledDeploymentGR.setValue('deployment_status', 'canceled');
                scheduledDeploymentGR.update();

                return;
            }

            var payload = {
                environment: scheduledDeploymentGR.target_environment.getRefRecord() || null,
                scheduled_deployment_record: scheduledDeploymentGR || null,
            };

            try {
                gs.info('Running scheduled deployment for application: ' + appSysID + ' version: ' + appVersion + ' to production.');

                sn_fd.FlowAPI.getRunner()
                    .subflow('sn_deploy_pipeline.scheduled_deployment_install_application_with_id')
                    .withInputs(payload)
                    .inBackground()
                    .run();
            } catch (ex) {
                gs.error(
                    'Scheduled deployment failed for application: ' +
                    appSysID +
                    '  version: ' +
                    appVersion +
                    ' failed with error message: ' +
                    ex.message +
                    ' and error code: ' +
                    ex.code
                );
            }
        }
    };

    ScheduledDeploymentService.updateScheduledDeploymentDate = function(currentRecordSysID, scheduledDeploymentDateInUTC) {
        var deploymentRequestGR = new GlideRecordSecure(ScheduledDeploymentService.SCHEDULED_DEPLOYMENT_REQUEST_TABLE);
        var hasValidDeploymentRequest = deploymentRequestGR.get('deployment_request', currentRecordSysID);
        var scheduledDeploymentRecord = null;
        var successfullyUpdated = false;

        if (hasValidDeploymentRequest) {
            var gdt = new GlideDateTime();
            gdt.setValue(scheduledDeploymentDateInUTC);
            scheduledDeploymentDateInUTC = gdt.getValue();

            deploymentRequestGR.setValue('scheduled_deployment_date', scheduledDeploymentDateInUTC);
            scheduledDeploymentRecord = deploymentRequestGR.update();

            successfullyUpdated = true;
        }

        return {
            scheduledDeploymentRecord: scheduledDeploymentRecord,
            updatedScheduledDeploymentDate: scheduledDeploymentDateInUTC,
            successfullyUpdated: successfullyUpdated,
        };
    };

    ScheduledDeploymentService.approveDeploymentRequest = function(currentRecordSysID) {
        var deploymentRequestGR = new GlideRecordSecure(ScheduledDeploymentService.DEPLOYMENT_REQUEST_TABLE);
        var hasValidDeploymentRequest = deploymentRequestGR.get(currentRecordSysID);
        var approvalRecord = getApprovalRecordForDeployment(currentRecordSysID);
        var recordUpdateSuccessful = false;

        if (hasValidDeploymentRequest && approvalRecord && approvalRecord.isValidRecord()) {
            try {
                approvalRecord.setValue('state', 'approved');
                recordUpdateSuccessful = approvalRecord.update();
            } catch (error) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessage("Attempt to update deployment approval failed with error message: {0}", [error]));
            }
        }

        // approvalRecord.update() returns sysId or null
        // !! used to coerce `recordUpdateSuccessful` to boolean
        return !!recordUpdateSuccessful;
    };

    ScheduledDeploymentService.cancelDeploymentRequest = function(currentRecordSysID) {
        var deploymentRequestGR = new GlideRecord(ScheduledDeploymentService.DEPLOYMENT_REQUEST_TABLE);
        var deploymentRequestCanceledState = '5';
        var scheduledDeploymentCanceledState = 'canceled';
        var recordUpdateSuccessful = false;
        var scheduledDeploymentRecord;
        var hasValidDeploymentRequest = deploymentRequestGR.get(currentRecordSysID);
        var result = {
            success: false,
            messages: [],
            updatedRecord: deploymentRequestGR,
        };

        if (!hasValidDeploymentRequest) {
            gs.error(
                gs.getMessage('Attempt to update scheduled deployment failed. Deployment request with sys_id {0} is not valid', [
                    currentRecordSysID,
                ])
            );
            return result;
        }

        new DeploymentRequestUtils().checkCanUpdateDeploymentRequest(deploymentRequestGR.getValue('app_sys_id'), deploymentRequestGR);

        // cancel deployment request record
        try {
            // attempting to update an old deployment request record (not the most recent one) will throw an exception
            deploymentRequestGR.setValue('state', deploymentRequestCanceledState);
            deploymentRequestGR.setValue('approval', 'rejected');
            recordUpdateSuccessful = deploymentRequestGR.update();
        } catch (error) {
            gs.error(gs.getMessage('Attempt to update scheduled deployment failed with error message: {0}', [error]));
            return result;
        }

        if (!recordUpdateSuccessful) {
            gs.error(
                gs.getMessage('Attempt to update scheduled deployment failed. Deployment request with sys_id {0} was not updated successfully.', [
                    currentRecordSysID,
                ])
            );
            return result;
        }

        result.success = true;
        result.updatedRecord = deploymentRequestGR;

        // cancel scheduled deployment record
        scheduledDeploymentRecord = new GlideRecord(ScheduledDeploymentService.SCHEDULED_DEPLOYMENT_REQUEST_TABLE);
        scheduledDeploymentRecord.addQuery('deployment_request', currentRecordSysID);
        var glideQuery = scheduledDeploymentRecord.addQuery('deployment_status', 'ready_for_deployment');
        glideQuery.addOrCondition('deployment_status', 'new');
        scheduledDeploymentRecord.query();

        if (scheduledDeploymentRecord.next()) {
            scheduledDeploymentRecord.deployment_status = scheduledDeploymentCanceledState;
            recordUpdateSuccessful = scheduledDeploymentRecord.update();

            if (!recordUpdateSuccessful) {
                result.messages.push({
                    message: gs.getMessage('Unable to cancel record in table: {0} with sys_id: {1}', [
                        ScheduledDeploymentService.SCHEDULED_DEPLOYMENT_REQUEST_TABLE,
                        scheduledDeploymentRecord.sys_id,
                    ]),
                });
            }
        } else {
            result.messages.push({
                message: gs.getMessage('Attempt to update scheduled deployment failed. There is no scheduled deployment associated with Deployment request with sys_id {0} .', [
                    currentRecordSysID,
                ]),
            });
        }

        // Cancel Change Request if exists
        cancelChangeRequestResult = new CMDBAndChangeManagementUtils().cancelChangeRequestIfExists(currentRecordSysID);
        if (!cancelChangeRequestResult.status) {
            result.messages.push({
                message: cancelChangeRequestResult.message,
            });
        }
        return result;
    };

    function getScheduledDeployments() {
        var scheduledDeploymentGR = new GlideRecord(ScheduledDeploymentService.SCHEDULED_DEPLOYMENT_REQUEST_TABLE);
        scheduledDeploymentGR.addQuery('deployment_status', 'ready_for_deployment');
        scheduledDeploymentGR.addQuery('scheduled_deployment_date', '<=', new GlideDateTime());
        scheduledDeploymentGR.orderByDesc('deployment_request.app_version');
        scheduledDeploymentGR.query();

        return scheduledDeploymentGR;
    }

    function getApprovalRecordForDeployment(deploymentRecordId) {
        if (deploymentRecordId) {
            try {
                var approvalRec = new GlideRecordSecure("sysapproval_approver");
                approvalRec.addQuery("sysapproval", deploymentRecordId);
                approvalRec.addQuery("approver", gs.getUserID());
                approvalRec.addQuery("state", "requested");
                approvalRec.query();

                if (approvalRec.next()) {
                    return approvalRec;
                }
            } catch (exception) {
                return null;
            }
        }
        return null;
    }

    ScheduledDeploymentService.prototype = {
        initialize: function() {
            throw 'Not supported';
        },

        type: 'ScheduledDeploymentService',
    };
})();
