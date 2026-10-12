var CloneRestService = Class.create();
CloneRestService.prototype = {
    initialize: function() {
        this.className = 'CloneRestService';
        this.SERVER_URL = global.SystemCloneWrapper.getCloneServerURL();
        if (!gs.nil(this.SERVER_URL) && !this.SERVER_URL.endsWith('/'))
            this.SERVER_URL = this.SERVER_URL.concat('/');

        this.STCD_GETNEXTSLOT_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.stcd.url');
        this.STCD_RESERVATION_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.reservation.url');
        this.CLONE_CANCEL_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.cancel.url');
        this.CLONE_ROLLBACK_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.rollback.url');
        this.CLONE_VALIDATE_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.validate.url');
        this.CLONE_SCHEDULE_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.schedule.url');
        this.CLONE_STATUS_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.status.url');
        this.CLONE_CONFLICTS = gs.getProperty('sn_instance_clone.glide.db.system.clone.conflicts.url');
        this.ADJACENT_CLONES_URL = gs.getProperty('sn_instance_clone.glide.db.system.clone.adjacent_clones.url');
        var mtlsPropertyString = gs.getProperty('sn_instance_clone.glide.clone_app.use_mtls', 'true');
        this.CLONE_USE_MTLS = mtlsPropertyString.equalsIgnoreCase('true');
        this.REST_AUTH_URL = '/api/now/clone_auth/getInstanceDetails';
        this.SYS_PROPERTIES_TABLE_URL = '/api/now/table/sys_properties';
        this.SETUP_MIF_INSTANCES = gs.getProperty('sn_instance_clone.glide.db.system.clone.mif_setup.url');
		this.OAUTH_CHECK_API_URL = '/api/sn_instance_clone/oauth_eligible/check';
		this.CLONE_TIME_RANGE = '/api/snc/conflictcalendarapi/getCloneTimeRange';

        // EKMS STATUS
        this.ENABLED = "enabled";
        this.CAPABLE = "capable";
        this.NOT_CAPABLE = "not_capable";
        this.user = gs.getProperty('instance_id');
        this.password = global.SystemCloneWrapper.getServerPassword();
    },
    /**
     * Get adjacent clones for the given source and target instances at the scheduled time.
     * Uses ServiceRESTMessage with KAA authentication.
     * @param targetInstanceId - String (Target Instance Id)
     * @param scheduledDateTime - String (Scheduled Date/Time)
     * @returns {Object} An object with adjacent clones information as a formatted string
     */
    getAdjacentClones: function(targetInstanceId, scheduledDateTime) {
        // Helper function to format clone records - filters out records with null values
        var _formatCloneRecords = function(clones) {
            var formattedLines = [];
            for (var i = 0; i < clones.length; i++) {
                var clone = clones[i];

                // Skip record if any required value is null
                if (gs.nil(clone.change_no) ||
                    gs.nil(clone.source_instance_name) ||
                    gs.nil(clone.target_instance_name) ||
                    gs.nil(clone.date) ||
                    gs.nil(clone.state)) {
                    continue;
                }

                var line = '<b>' + clone.change_no + '</b>  Source Instance: ' + clone.source_instance_name +
                    ' Target Instance: ' + clone.target_instance_name +
                    ' Clone Start time: ' + clone.date +
                    ' Status: ' + clone.state;
                formattedLines.push(line);
            }
            return formattedLines;
        };

        var adjacentClonesResult = {
            isError: true,
            message: "",
            isAdjacentClones: false
        };

        if (gs.nil(targetInstanceId) || gs.nil(scheduledDateTime)) {
            adjacentClonesResult.message = 'Target instance Id, and scheduled date/time are required for getAdjacentClones.';
            return adjacentClonesResult;
        }

        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.ADJACENT_CLONES_URL);
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(true);
            request.setHttpMethod('GET');
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('tgtInstanceId', targetInstanceId + '');
            request.setQueryParameter('scheduledTime', scheduledDateTime + '');
            var response = request.execute();
            var responseStatus = response.getStatusCode();
            var responseBody = response.getBody();

            if (responseStatus == 200) {
                var responseObj = json.decode(responseBody);

                var futureClones = responseObj.result.data.futureClones || [];
                var isAdjacentClone = responseObj.result.data.isAdjacentClone || false;
                var adjacentDays = responseObj.result.data.adjacentDays || "14";

                var futureCloneLines = _formatCloneRecords(futureClones);
                var htmlContent = '';
                if (futureCloneLines.length > 0) {
                    htmlContent += futureCloneLines.join('<br/>');
                }

                // Set the result based on whether we have any valid records
                if (!isAdjacentClone || futureCloneLines.length === 0) {
                    adjacentClonesResult.message = 'No adjacent clones found.';
                    adjacentClonesResult.isAdjacentClones = false;
                } else {
                    adjacentClonesResult.message = htmlContent;
                    adjacentClonesResult.isAdjacentClones = true;
                }

                adjacentClonesResult.adjacentClonesGeneralDescription = gs.getMessage('clone.info.adjacent.clones.general.description', [adjacentDays]);
                adjacentClonesResult.isError = false;
            } else {
                adjacentClonesResult.message = "HTTP Error " + responseStatus + ": " + responseBody;
            }

        } catch (ex) {
            adjacentClonesResult.message = 'Exception occurred while getting adjacent clones: ' + ex.message;
            gs.error('Exception in getAdjacentClones: ' + ex.message);
        }

        return adjacentClonesResult;
    },

    /**
     * 
     * Fetch the conflicts for a given date/time and target instance Id combination.
     * @param {<string>} <startDateTimeInUTC> - <Start Time in UTC to check for the conflicts>
     * @param {<string>} <endDateTimeInUTC> - <End Time in UTC to check for the conflicts>
     * @param {<string>} <tgtInstanceId> - <Target Instance ID >
     * @returns {<Object>} <an object with Details about the Conflicts>
     * @example 
     * @see 
     */
    fetchCloneConflicts: function(startDateTimeInUTC, endDateTimeInUTC, tgtInstanceId) {
        var conflictResult = {
            isError: true,
            message: "",
            conflicts: []
        };

        if (gs.nil(tgtInstanceId)) {
            conflictResult.message = 'Target instance Id is required for fetchCloneConflicts.';
            return conflictResult;
        }

        var payload = {};
        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_CONFLICTS);
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setHttpMethod('POST');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            payload.maintenanceStartDateTimeStringInUTC = startDateTimeInUTC + '';
            payload.maintenanceEndDateTimeStringInUTC = endDateTimeInUTC + '';
            payload.inputCiListString = "InstanceIDs:" + tgtInstanceId;
            payload.inputCiNameListString = "InstanceNames:" + this._getInstanceNameFromId(tgtInstanceId);

            request.setRequestBody(json.encode(payload));
            var response = request.execute();
            var body = json.decode(response.getBody());
            var responseStatus = response.getStatusCode();
            var responseObj = json.decode(response.getBody());
            if (responseStatus == 200 || responseObj.result.status == 'success') {
                var result = responseObj.result.output;
                if (!gs.nil(result) && result.length >= 0)
                    conflictResult.conflicts = result;

                conflictResult.isError = false;
            } else if (!gs.nil(responseObj.error))
                conflictResult.message = responseObj.result.message;
            else
                conflictResult.message = "Response Body empty.";
        } catch (ex) {
            conflictResult.message = ex.message;
        }

        return conflictResult;
    },

    /*
     * Request for getting the status of the clone.
     * @param cloneId - String (SysId of the clone request item)
     */
    getCloneStatus: function(cloneId) {
        var statusResp = {
            isError: true,
            message: ""
        };

        var cloneGr;
        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_STATUS_URL);
            request.setHttpMethod('GET');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('cloneId', cloneId);
            var response = request.execute();
            var body = json.decode(response.getBody());
            if (gs.nil(body)) {
                statusResp.message = "Response Body empty.";
            } else if (body.status != CloneConstants.reqState.FAILURE) {
                var result = body.result;
                var isError = result.isError;
                if (isError == false) {
                    cloneGr = new GlideRecord(CloneConstants.tableName.CLONE_REQUEST);
                    if (cloneGr.get(cloneId)) {
                        if (!gs.nil(result.stage))
                            cloneGr.setValue('stage', result.stage);
                        if (!gs.nil(result.sub_stage))
                            cloneGr.setValue('sub_stage', result.sub_stage);
                        if (!gs.nil(result.stage_percent_complete))
                            cloneGr.setValue('stage_percent_complete', result.stage_percent_complete);

                        cloneGr.setValue('clone_percent_complete', result.clone_percent_complete_new || result.clone_percent_complete);
                        cloneGr.setValue('state', result.state);
                        cloneGr.setWorkflow(false);
                        cloneGr.update();
                        cloneGr.setWorkflow(true);
                        statusResp.isError = false;
                        if (result.state === 'Rolled back') {
                            statusResp.message = 'Clone rollback is complete';
                        } else if (result.state === 'Rolling back') {
                            statusResp.message = 'Progress API returned clone state as ' + result.state;
                        } else {
                            statusResp.message = 'Progress API returned clone state as ' + result.state + ' and %complete as ' + result.clone_percent_complete + '%';
                        }
                        SncCloneLoggerUtil.info(cloneId, statusResp.message, this.className);
                    }
                } else if (!gs.nil(body.error))
                    statusResp.message = body.error.message;
                else
                    statusResp.message = "Response Body empty.";
            }
        } catch (e) {
            statusResp.isError = true;
            statusResp.message = "Getting clone request status failed. Error: " + e + ".";
            SncCloneLoggerUtil.error(cloneId, statusResp.message, this.className);
        }
        return statusResp;
    },

    /*
     * Gets the next available time slot.
     * @param srcInstanceId - String (Source Instance Id)
     * @param targetInstanceId - String (Target Instance Id)
     */
    getNextAvailableSlot: function(srcInstanceId, targetInstanceId) {
        var stcdResponse = {
            isError: true,
            message: ""
        };

        if (gs.nil(targetInstanceId)) {
            stcdResponse.message = "Mandatory parameter (Target Instance Id) missing.";
            return stcdResponse;
        }

        var grInstanceRec = new GlideRecord('instance');
        grInstanceRec.addQuery('instance_id', targetInstanceId);
        grInstanceRec.query();
        if (!grInstanceRec.next()) {
            stcdResponse.message = 'Instance with Id "' + targetInstanceId + '" is not registered for cloning. Unable to continue.';
            return stcdResponse;
        }

        var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
        var json = new global.JSON();
        try {
            request.setPath(this.STCD_GETNEXTSLOT_URL);
            request.setHttpMethod('GET');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            if (gs.nil(srcInstanceId))
                srcInstanceId = gs.getProperty('instance_id');

            request.setQueryParameter('srcInstanceId', srcInstanceId);
            request.setQueryParameter('tgtInstanceId', targetInstanceId);
            request.setQueryParameter('srcInstanceName', this._getInstanceNameFromId(srcInstanceId));
            request.setQueryParameter('tgtInstanceName', this._getInstanceNameFromId(targetInstanceId));

            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            var isError = result.isError;
            if (isError == false) {
                stcdResponse.isError = false;
                if (!gs.nil(result.estimatedStartDateTime))
                    stcdResponse.estimatedStartDateTime = result.estimatedStartDateTime;
                else
                    stcdResponse.estimatedStartDateTime = new GlideDateTime();

                stcdResponse.estimatedDurationMs = result.estimatedDurationMs;
                stcdResponse.validation_rules = result.validation_rules || "";
                stcdResponse.maxRecurringCloneDuration = result.maxRecurringCloneDuration || "";
                stcdResponse.largeTablesList = result.largeTablesList || "";
                stcdResponse.onDemandBackupEstimationMsg = result.onDemandBackupEstimationMsg || "";
                stcdResponse.state = CloneConstants.reqState.SUCCESS;
            }
            stcdResponse.message = result.clone_estimation_message;
        } catch (e) {
            stcdResponse.message = e;
        }

        return stcdResponse;
    },

    /*
     * Checks whether the given reservation time is available.
     * @param srcInstanceId - String (Source Instance Id)
     * @param targetInstanceId - String (Target Instance Id)
     * @param requestedTime - Date/Time (Requested date/time)
     */
    checkForAvailableSlot: function(srcInstanceId, targetInstanceId, requestedTime) {
        var stcdResponse = {
            isError: true,
            message: ""
        };

        if (gs.nil(targetInstanceId) || gs.nil(requestedTime)) {
            stcdResponse.message = "Mandatory parameters (Target Instance Id or Scheduled Time) missing.";
            return stcdResponse;
        }

        var grInstanceRec = new GlideRecord('instance');
        grInstanceRec.addQuery('instance_id', targetInstanceId);
        grInstanceRec.query();
        if (!grInstanceRec.next()) {
            stcdResponse.message = 'Instance with Id "' + targetInstanceId + '" is not registered for cloning. Unable to continue.';
            return stcdResponse;
        }

        var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
        try {
            request.setPath(this.STCD_RESERVATION_URL);
            request.setHttpMethod('GET');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            if (gs.nil(srcInstanceId))
                srcInstanceId = gs.getProperty('instance_id');

            request.setQueryParameter('srcInstanceId', srcInstanceId);
            request.setQueryParameter('tgtInstanceId', targetInstanceId);
            request.setQueryParameter('requestedTime', requestedTime);
            request.setQueryParameter('srcInstanceName', this._getInstanceNameFromId(srcInstanceId));
            request.setQueryParameter('tgtInstanceName', this._getInstanceNameFromId(targetInstanceId));

            var json = new global.JSON();
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            var isError = result.isError;
            if (isError == false) {
                stcdResponse.isError = false;
                stcdResponse.estimatedDurationMs = result.estimatedCloneDurationMs || "";
                stcdResponse.validation_rules = result.validation_rules || "";
                stcdResponse.maxRecurringCloneDuration = result.maxRecurringCloneDuration || "";
                stcdResponse.largeTablesList = result.largeTablesList || "";
                stcdResponse.onDemandBackupEstimationMsg = result.onDemandBackupEstimationMsg || "";
                stcdResponse.state = CloneConstants.reqState.SUCCESS;
            }
            stcdResponse.message = result.clone_estimation_message;
        } catch (e) {
            stcdResponse.message = e.message;
        }

        return stcdResponse;
    },

    /*
     * Checks whether the clone request is valid.
     * @param srcInstanceId - String (Source Instance Id)
     * @param targetInstanceId - String (Target Instance Id)
     * @param srcWarVersion - String (Source War version)
     */
    validateCloneRequest: function(srcInstanceId, targetInstanceId, srcWarVersion, scheduledDateTime) {
        var validateCloneResp = {
            isError: true,
            message: []
        };

        var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
        try {
            request.setPath(this.CLONE_VALIDATE_URL);
            request.setHttpMethod('GET');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('srcInstanceId', srcInstanceId);
            request.setQueryParameter('tgtInstanceId', targetInstanceId);
            request.setQueryParameter('srcWarVersion', gs.nil(srcWarVersion) ? gs.getProperty('glide.war') : srcWarVersion);
            request.setQueryParameter('scheduledDateTime', scheduledDateTime);

            request.setQueryParameter('srcInstanceName', this._getInstanceNameFromId(srcInstanceId));
            request.setQueryParameter('tgtInstanceName', this._getInstanceNameFromId(targetInstanceId));
            var json = new global.JSON();
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            var isError = result.isError;
            if (isError == false)
                validateCloneResp.isError = isError;
            else
                validateCloneResp.message = result.message;
        } catch (e) {
            validateCloneResp.message.push(e.message);
        }
        return validateCloneResp;
    },
    /*
     * Request for cancelling the clone.
     * @param cloneId - String (SysId of the clone request item)
     * @param cancelReason - String (Cancel reason)
     */
    cancelClone: function(cloneId, cancelReason) {
        var cancelResponse = {
            isError: true,
            message: ''
        };

        var payload = {};
        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_CANCEL_URL);
            request.setHttpMethod('POST');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            payload.cloneId = cloneId + "";
            payload.cancelReason = cancelReason;
            request.setRequestBody(json.encode(payload));
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            if (result.isError == true) {
                gs.error("Error encountered while cancelling clone request. Error: " + result.message + ".");
                cancelResponse.message = result.message;
                SncCloneLoggerUtil.error(cloneId, result.message, this.className);
            } else {
                cancelResponse.isError = false;
                var cloneGr = new GlideRecord(CloneConstants.tableName.CLONE_REQUEST);
                if (cloneGr.get(cloneId)) {
                    cloneGr.setValue('state', CloneConstants.status.CLONE_STATUS_CANCELED);
                    cloneGr.update();
                }
                SncCloneLoggerUtil.info(cloneId, gs.getMessage('clone.log.info.cancel.initiated'), this.className);
            }
        } catch (e) {
            cancelResponse.isError = true;
            cancelResponse.message = "Unable to cancel clone, please try again.";
            SncCloneLoggerUtil.error(cloneId, cancelResponse.message + ": Error : " + e, this.className);
        }

        return cancelResponse;
    },

    /*
     * Request for rolling back the clone.
     * @param cloneId - String (SysId of the clone request item)
     * @param rollbackReason - String (Rollback reason)
     */
    rollbackClone: function(cloneId, rollbackReason) {
        var rollbackResp = {};
        var telemetry = {};
        var payload = {};
        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_ROLLBACK_URL);
            request.setHttpMethod('POST');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            payload.cloneId = cloneId + "";
            payload.rollbackReason = rollbackReason;
            request.setRequestBody(json.encode(payload));
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            rollbackResp.isError = result.isError;
            if (result.isError == true) {
                gs.error("Error encountered while rolling back clone request. Error: " + result.message + ".");
                SncCloneLoggerUtil.error(cloneId, result.message, this.className);
            }

            rollbackResp.message = result.message;
            SncCloneLoggerUtil.info(cloneId, gs.getMessage('clone.log.info.rollback.initiated'), this.className);
        } catch (e) {
            rollbackResp.isError = true;
            rollbackResp.message = "Rollback clone request failed. Error: " + e + ".";
            SncCloneLoggerUtil.error(cloneId, rollbackResp.message, this.className);
        }
        return rollbackResp;
    },

    _getEmails: function(emailList) {
        if (!emailList)
            return '';
        var emails = [];
        var _emails = emailList.split(',');
        if (_emails && _emails.length > 0) {
            for (var i in _emails) {
                var userGr = new GlideRecord('sys_user');
                if (userGr.get(_emails[i]))
                    emails.push(userGr.getValue('email'));
                else
                    emails.push(_emails[i]);
            }
        }
        return emails.join(',');
    },

    /*
     * Request for scheduling the clone.
     * @param cloneGr - GlideRecord (record of sn_instance_clone_request)
     */
    scheduleClone: function(cloneGr) {
        var scheduleResp = {};
        var telemetry = {};
        var payload = {};
        var targetInstanceGr = this._getInstanceRecord(cloneGr.getValue('target_instance'));
        try {
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_SCHEDULE_URL);
            request.setHttpMethod('POST');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            payload.u_req_origin_instance = gs.getProperty('instance_id');
            payload.u_req_origin_instance_name = gs.getProperty('instance_name');
            if (gs.nil(cloneGr.source_instance)) {
                payload.source_instance_id = payload.u_req_origin_instance;
                payload.source_instance_name = payload.u_req_origin_instance_name;
            } else {
                payload.source_instance_id = String(cloneGr.source_instance.instance_id);
                payload.source_instance_name = String(cloneGr.source_instance.instance_name);
            }
            payload.source_instance_url = gs.getProperty('glide.servlet.uri');
            payload.target_instance_id = targetInstanceGr.getValue('instance_id');
            payload.target_instance_name = targetInstanceGr.getValue('instance_name');
            payload.target_instance_url = targetInstanceGr.getValue('instance_url');
            payload.state = cloneGr.getValue('state');
            payload.clone_id = cloneGr.getValue('sys_id');
            payload.date = cloneGr.getValue('scheduled');
            payload.security_token = cloneGr.getValue('security_token');
            payload.source_version = this._formatVersion(gs.getProperty('glide.war'));
            payload.target_version = this._formatVersion(targetInstanceGr.getValue('war_version'));
            payload.clone_request_id = cloneGr.getValue('request_id');

            if (!gs.nil(cloneGr.parent_request_id))
                payload.parent_clone_id = cloneGr.getValue('parent_request_id');

            /*payload.backup_type = cloneGr.getValue('backup_type');
			if(cloneGr.getValue('backup_type') == CloneConstants.backupType.USE_ANOTHER_CLONE_BACKUP)
				payload.clone_request_id_for_backup = cloneGr.getValue('clone_request_id_for_backup');   */


            payload.user_email = this._getEmails(cloneGr.getValue('email'));
            payload.user_name = cloneGr.getValue('sys_created_by');
            payload.on_demand_backup = cloneGr.getValue('on_demand_backup');
            payload.exclude_tables_specified_in_exclusion_list = Boolean(cloneGr.exclude_all_from_exclusion_list);
            payload.exclude_audit_and_log_data = Boolean(cloneGr.exclude_large_data);
            payload.preserve_in_progress_update_sets = cloneGr.getValue('preserve_in_progress_update_sets');
            payload.exclude_large_attachment_data = Boolean(cloneGr.filter_attachment_data);
            payload.amount_of_data_copied_from_large_tables = cloneGr.getValue('amount_of_data_copied_from_large_tables');
            payload.preserve_theme = Boolean(cloneGr.preserve_theme);
            payload.profile = !gs.nil(cloneGr.getValue('profile_name')) ? cloneGr.getValue('profile_name') : cloneGr.profile.getDisplayValue();
            payload.lock_clone_config = Boolean(cloneGr.lock_profile_settings);

            request.setRequestBody(json.encode(payload));
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            scheduleResp.isError = result.isError;
            if (result.isError == true) {
                cloneGr.setValue('state', 'Error');
                cloneGr.setValue('error_message', 'Error encountered while scheduling clone request. Please contact support team.');
                cloneGr.setWorkflow(false);
                cloneGr.update();
                cloneGr.setWorkflow(true);
                SncCloneLoggerUtil.error(cloneGr.getValue('sys_id'), result.message, this.className);
                gs.error("Error encountered while scheduling clone request. Error: " + result.message + ".");
            } else
                SncCloneLoggerUtil.info(cloneGr.getValue('sys_id'),
                    sn_i18n.Message.getMessage("sn_instance_clone", "clone.log.info.schedule.success"), this.className);

            scheduleResp.message = result.message;
        } catch (e) {
            scheduleResp.isError = true;
            scheduleResp.message = "Schedule clone request failed. Error: " + e + ".";

            cloneGr.setValue('state', 'Error');
            cloneGr.setValue('error_message', 'Error encountered while scheduling clone request. Please contact support team.');
            cloneGr.setWorkflow(false);
            cloneGr.update();
            cloneGr.setWorkflow(true);

            SncCloneLoggerUtil.error(cloneGr.getValue('sys_id'), scheduleResp.message, this.className);
        }
        return scheduleResp;
    },

	replaceIpWithLocalhost: function(input) {
        if (!input) return input;

        // Match <ip_address>:<port> pattern
        var ipPortRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)/;

        if (ipPortRegex.test(input)) {
            return input.replace(ipPortRegex, 'localhost:$2');
        }

        return input;
    },

	_extractHostWithProtocol: function(url) {
		var match = url.match(/^(https?:\/\/[^\/]+)/);
		return match ? match[1] : url;
	},

	checkIfInstanceOAuthEligible: function(instanceUrl) {
		var result = {
			'body': {
				isError: true
			},
			status: 200
		};
		var _srcUrl = this.normalizeInstanceUrl(this.replaceIpWithLocalhost(gs.getProperty('glide.servlet.uri')) || gs.getProperty('instance_name'));
		if(instanceUrl === _srcUrl) {
			result.body.message = "Cannot add self as target instance";
			result.body.isSelf = true;

			return result;
		}
		try{
			var req = new sn_ws.RESTMessageV2();
			req.setEndpoint(instanceUrl + this.OAUTH_CHECK_API_URL);
			req.setHttpMethod('GET');
			var res = req.execute();
			var resBody = JSON.parse(res.getBody()) || '';
			var statusCode = res.getStatusCode();
			if(statusCode !== (200 || 201) || resBody.error) 
				return result;
			else {
				result.body.isError = false;
				result.body.sourceUrl = gs.base64Encode(_srcUrl);
				result.status = statusCode;
			}
		} catch(e) {
			
		}
		return result;
	},

	normalizeInstanceUrl: function(input) {
		if (!input) return '';

		// If it's already a proper URL, preserve it but strip trailing slash
		if (input.indexOf('http://') === 0 || input.indexOf('https://') === 0) {
			return input.replace(/\/$/, '');
		}

		// Otherwise treat it as an instance ID and build the URL
		return 'https://' + input + '.service-now.com';
	},

    _restAuth: function(instanceUrl, user, pass, clone_id, authResp) {
        try {
            var req = new sn_ws.RESTMessageV2();
            req.setEndpoint(instanceUrl + this.REST_AUTH_URL);
            req.setHttpMethod('GET');
            req.setBasicAuth(user, pass);
            req.setQueryParameter('clone_id', clone_id);
            var res = req.execute();
            var resBody = JSON.parse(res.getBody()) || '';
            var statusCode = res.getStatusCode();
            if (statusCode !== (200 || 201) || resBody.error) {
                gs.error('Error executing instance auth in rest: \n' + resBody.error.message);
                return;
            }
            if (resBody.result) {
                var respResult = resBody.result;
                this._updateInstance(respResult, instanceUrl, user, pass, authResp);
                var skipEKMSCheck = false;
                try {
                    skipEKMSCheck = JSON.parse(gs.getProperty("com.snc.ha.skipCloneEKMSCheck"));
                } catch (e) {
                    SncCloneLoggerUtil.error(clone_id, "com.snc.ha.skipCloneEKMSCheck: Property not found, continuing with EKMS Check" + e, this.className);
                }
                if (!skipEKMSCheck) this._updateEKMSStatus(respResult, authResp, clone_id);
            } else {
                gs.error('Error executing instance auth, falling back to SOAP');
                return '';
            }
        } catch (e) {
            gs.error('Error executing instance auth in rest: \n' + e);
            return '';
        }
        authResp.restAuth = true;
        return true;
    },

	_restAuthByOauth: function(instanceUrl, clone_id, accessToken, authResp) {
        try {
            var req = new sn_ws.RESTMessageV2();
            req.setEndpoint(instanceUrl + this.REST_AUTH_URL);
            req.setHttpMethod('GET');
            req.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            req.setQueryParameter('clone_id', clone_id);
            var res = req.execute();
            var resBody = JSON.parse(res.getBody()) || '';
            var statusCode = res.getStatusCode();
            if (statusCode !== (200 || 201) || resBody.error) {
                gs.error('Error executing instance auth in rest: \n' + resBody.error.message);
                return;
            }
            if (resBody.result) {
                var respResult = resBody.result;
                this._updateInstance(respResult, instanceUrl, null, null, authResp);
                var skipEKMSCheck = false;
                try {
                    skipEKMSCheck = JSON.parse(gs.getProperty("com.snc.ha.skipCloneEKMSCheck"));
                } catch (e) {
                    SncCloneLoggerUtil.error(clone_id, "com.snc.ha.skipCloneEKMSCheck: Property not found, continuing with EKMS Check" + e, this.className);
                }
                if (!skipEKMSCheck) this._updateEKMSStatus(respResult, authResp, clone_id);
            } else {
                gs.error('Error executing instance auth, falling back to SOAP');
                return '';
            }
        } catch (e) {
            gs.error('Error executing instance auth in rest: \n' + e);
            return '';
        }
        authResp.restAuth = true;
        return true;
    },

    _updateInstance: function(respResult, instanceUrl, user, pass, authResp) {
        var instanceGR = new GlideRecord("instance");
        instanceGR.addQuery("source", false);
        var qc = instanceGR.addQuery("instance_id", respResult.instance_id);
        var instanceName = this._getInstanceName(instanceUrl, user, pass);
        qc.addOrCondition("instance_url", instanceUrl);
        instanceGR.orderBy("instance_id");
        instanceGR.query();

        if (!instanceGR.next())
            instanceGR.initialize();

        instanceGR.setValue("instance_id", respResult.instance_id);
        instanceGR.setValue("instance_name", instanceName);
        instanceGR.setValue("instance_url", instanceUrl);
        instanceGR.setValue("production", respResult.production);
        instanceGR.setValue("war_version", respResult.war_version);
        var ip = respResult.ip;
        var jdbcUrl = respResult.url;
        var encryptedPassword = respResult.password;

        // for ease of development and testing in dev environments, no sql permission setting (IP address lookup takes 5s so try and skip it for dev)
        if (jdbcUrl !== null && jdbcUrl.indexOf("localhost") < 0) //&& ip == GlideHostUtil.getPublicIPAddress())
            jdbcUrl = jdbcUrl.replace(ip, "localhost");

        instanceGR.setValue("database_name", respResult.name);
        instanceGR.setValue("database_tablespace", respResult.tablespace);
        instanceGR.setValue("database_type", respResult.rdbms);
        instanceGR.setValue("database_user", respResult.user);
        instanceGR.database_password = encryptedPassword;
        instanceGR.setValue("database_url", jdbcUrl);
        instanceGR.setValue("source", false);
        instanceGR.setValue("primary", false);

        if (!gs.nil(respResult.security_token))
            authResp.securityToken = respResult.security_token;

        //instanceGR.setValue("admin_user", user);
        //instanceGR.setValue("admin_password", pass);
        instanceGR.update();

        instanceGR.setValue("instance_name", instanceName);
		instanceGR.setValue('source',false);
        instanceGR.update();
    },

    /*
     * Request for authenticate the instance.
     * @param instanceUrl - String (Instance URL)
     * @param user - String (Username)
     * @param pass - String (password)
     * @param clone_id - String (clone_id)
     */
    authenticateInstance: function(instanceUrl, user, pass, clone_id) {
        var authResp = {
            isError: false,
            message: '',
            securityToken: '',
            isEKMSError: false,
            ekmsErrorMessage: '',
            ekmsErrorHeading: ''
        };

        if (gs.nil(instanceUrl) || gs.nil(user) || gs.nil(pass)) {
            authResp.isError = true;
            authResp.message = 'Mandatory parameters (instanceUrl/user/password) is missing.';
            return authResp;
        }

        if (!instanceUrl.startsWith("https://") && !instanceUrl.startsWith("http://"))
            instanceUrl = "https://" + instanceUrl;

        try {
            if (!this._restAuth(instanceUrl, user, pass, clone_id, authResp)) {
                var soapdoc = new global.SOAPEnvelope("HAGetParams", "http://www.service-now.com/");
                soapdoc.setFunctionName("execute");
                soapdoc.addFunctionParameter("clone_id", clone_id);

                // post the request
                var url = this._buildWSURL(instanceUrl);
                var soapRequest = new sn_ws.SOAPMessageV2();
                soapRequest.setEndpoint(url);
                soapRequest.setBasicAuth(user, pass);
                soapRequest.setSOAPAction("execute");
                soapRequest.setRequestBody(soapdoc.toString());
                var response = soapRequest.executeAsync();
                response.waitForResponse(10);

                var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
                var status = response.getStatusCode();

                if (this._isError(response, responseBody, authResp)) {
                    authResp.isError = true;
                    return authResp;
                }

                var xmlDoc = new XMLDocument2();
                xmlDoc.parseXML(responseBody);

                if (this._isValidAuthResponse(xmlDoc)) {
                    var instanceGR = new GlideRecord("instance");
                    instanceGR.addQuery("source", false);
                    var qc = instanceGR.addQuery("instance_id", xmlDoc.getNodeText("//instance_id"));
                    qc.addOrCondition("instance_url", instanceUrl);
                    instanceGR.orderBy("instance_id");
                    instanceGR.query();

                    if (!instanceGR.next())
                        instanceGR.initialize();

                    // populate instance metadata
                    instanceGR.setValue("instance_id", xmlDoc.getNodeText("//instance_id"));
                    instanceGR.setValue("instance_name", this._getInstanceName(instanceUrl, user, pass));
                    instanceGR.setValue("instance_url", instanceUrl);
                    instanceGR.setValue("production", xmlDoc.getNodeText("//production"));
                    instanceGR.setValue("war_version", xmlDoc.getNodeText("//war_version"));

                    // populate database parameters     
                    var ip = xmlDoc.getNodeText("//ip");
                    var jdbcUrl = xmlDoc.getNodeText("//url");
                    var encryptedPassword = xmlDoc.getNodeText("//password");

                    // for ease of development and testing in dev environments, no sql permission setting (IP address lookup takes 5s so try and skip it for dev)
                    if (jdbcUrl !== null && jdbcUrl.indexOf("localhost") < 0) //&& ip == GlideHostUtil.getPublicIPAddress())
                        jdbcUrl = jdbcUrl.replace(ip, "localhost");

                    instanceGR.setValue("database_name", xmlDoc.getNodeText("//name"));
                    instanceGR.setValue("database_tablespace", xmlDoc.getNodeText("//tablespace"));
                    instanceGR.setValue("database_type", xmlDoc.getNodeText("//rdbms"));
                    instanceGR.setValue("database_user", xmlDoc.getNodeText("//user"));
                    instanceGR.database_password = encryptedPassword;
                    instanceGR.setValue("database_url", jdbcUrl);
                    instanceGR.setValue("source", false);
                    instanceGR.setValue("primary", false);

                    if (!gs.nil(xmlDoc.getNodeText("//security_token")))
                        authResp.securityToken = xmlDoc.getNodeText("//security_token");

                    instanceGR.setValue("admin_user", user);
                    instanceGR.setValue("admin_password", pass);

                    instanceGR.update();
                } else {
                    var remoteError = xmlDoc.getNodeText("//error_string");
                    authResp.isError = true;
                    if (gs.nil(remoteError)) {
                        authResp.isError = true;
                        var remote_instance_id = xmlDoc.getNodeText("//instance_id");
                        if (this._isSameInstanceId(remote_instance_id))
                            authResp.message = gs.getMessage("SAME_INSTANCEID");
                        else
                            authResp.message = gs.getMessage("INVALID_RESPONSE");

                    } else
                        authResp.message = remoteError;
                }
            }
        } catch (e) {
            authResp.isError = true;
            authResp.message = gs.getMessage("DESTINATION_ERROR");
            gs.error('Destination returned an error, please check your URL, username, and password: ' + e.message);
        }

        return authResp;
    },

	authenticateInstanceByOauth: function(instanceUrl, clone_id, accessToken) {
        var authResp = {
            isError: false,
            message: '',
            securityToken: '',
            isEKMSError: false,
            ekmsErrorMessage: '',
            ekmsErrorHeading: ''
        };

        if (gs.nil(instanceUrl)) {
            authResp.isError = true;
            authResp.message = 'Mandatory parameters (instanceUrl/user/password) is missing.';
            return authResp;
        }

        if (!instanceUrl.startsWith("https://") && !instanceUrl.startsWith("http://"))
            instanceUrl = "https://" + instanceUrl;

        try {
            if (!this._restAuthByOauth(instanceUrl, clone_id, accessToken, authResp)) {
                var soapdoc = new global.SOAPEnvelope("HAGetParams", "http://www.service-now.com/");
                soapdoc.setFunctionName("execute");
                soapdoc.addFunctionParameter("clone_id", clone_id);

                // post the request
                var url = this._buildWSURL(instanceUrl);
                var soapRequest = new sn_ws.SOAPMessageV2();
                soapRequest.setEndpoint(url);
                soapRequest.setBasicAuth(user, pass);
                soapRequest.setSOAPAction("execute");
                soapRequest.setRequestBody(soapdoc.toString());
                var response = soapRequest.executeAsync();
                response.waitForResponse(10);

                var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
                var status = response.getStatusCode();

                if (this._isError(response, responseBody, authResp)) {
                    authResp.isError = true;
                    return authResp;
                }

                var xmlDoc = new XMLDocument2();
                xmlDoc.parseXML(responseBody);

                if (this._isValidAuthResponse(xmlDoc)) {
                    var instanceGR = new GlideRecord("instance");
                    instanceGR.addQuery("source", false);
                    var qc = instanceGR.addQuery("instance_id", xmlDoc.getNodeText("//instance_id"));
                    qc.addOrCondition("instance_url", instanceUrl);
                    instanceGR.orderBy("instance_id");
                    instanceGR.query();

                    if (!instanceGR.next())
                        instanceGR.initialize();

                    // populate instance metadata
                    instanceGR.setValue("instance_id", xmlDoc.getNodeText("//instance_id"));
                    instanceGR.setValue("instance_name", this._getInstanceName(instanceUrl, user, pass));
                    instanceGR.setValue("instance_url", instanceUrl);
                    instanceGR.setValue("production", xmlDoc.getNodeText("//production"));
                    instanceGR.setValue("war_version", xmlDoc.getNodeText("//war_version"));

                    // populate database parameters     
                    var ip = xmlDoc.getNodeText("//ip");
                    var jdbcUrl = xmlDoc.getNodeText("//url");
                    var encryptedPassword = xmlDoc.getNodeText("//password");

                    // for ease of development and testing in dev environments, no sql permission setting (IP address lookup takes 5s so try and skip it for dev)
                    if (jdbcUrl !== null && jdbcUrl.indexOf("localhost") < 0) //&& ip == GlideHostUtil.getPublicIPAddress())
                        jdbcUrl = jdbcUrl.replace(ip, "localhost");

                    instanceGR.setValue("database_name", xmlDoc.getNodeText("//name"));
                    instanceGR.setValue("database_tablespace", xmlDoc.getNodeText("//tablespace"));
                    instanceGR.setValue("database_type", xmlDoc.getNodeText("//rdbms"));
                    instanceGR.setValue("database_user", xmlDoc.getNodeText("//user"));
                    instanceGR.database_password = encryptedPassword;
                    instanceGR.setValue("database_url", jdbcUrl);
                    instanceGR.setValue("source", false);
                    instanceGR.setValue("primary", false);

                    if (!gs.nil(xmlDoc.getNodeText("//security_token")))
                        authResp.securityToken = xmlDoc.getNodeText("//security_token");

                    instanceGR.setValue("admin_user", user);
                    instanceGR.setValue("admin_password", pass);

                    instanceGR.update();
                } else {
                    var remoteError = xmlDoc.getNodeText("//error_string");
                    authResp.isError = true;
                    if (gs.nil(remoteError)) {
                        authResp.isError = true;
                        var remote_instance_id = xmlDoc.getNodeText("//instance_id");
                        if (this._isSameInstanceId(remote_instance_id))
                            authResp.message = gs.getMessage("SAME_INSTANCEID");
                        else
                            authResp.message = gs.getMessage("INVALID_RESPONSE");

                    } else
                        authResp.message = remoteError;
                }
            }
        } catch (e) {
            authResp.isError = true;
            authResp.message = gs.getMessage("DESTINATION_ERROR");
            gs.error('Destination returned an error, please check your URL, username, and password: ' + e.message);
        }

        return authResp;
    },

    _isError: function(soapResponse, xmlStr, authResp) {
        if (soapResponse.getStatusCode() == 401) {
            authResp.message = CloneConstants.errorMsg.INVALID_USERNAME;
            return true;
        }

        if (soapResponse.getStatusCode() == 403) {
            authResp.message = CloneConstants.errorMsg.DESTINATION_UNAUTHORISED;
            return true;
        }

        if (gs.nil(xmlStr) || xmlStr.indexOf("SOAP-ENV:Envelope") == -1) {
            if (!gs.nil(xmlStr) && xmlStr.indexOf("service-now") != -1) {
                authResp.message = CloneConstants.errorMsg.HA_PLUGIN_NOTENABLED;
                return true;
            }
            authResp.message = CloneConstants.errorMsg.NOT_SN_INSTANCE;
            return true;
        }

        if (xmlStr.indexOf("Invalid table HAGetParams") != -1) {
            authResp.message = CloneConstants.errorMsg.INVALID_RESPONSE;
            return true;
        }

        if (xmlStr.indexOf("Web service not found") != -1) {
            authResp.message = CloneConstants.errorMsg.HA_PLUGIN_NOTENABLED;
            return true;
        }

        if (soapResponse.getStatusCode() != 200) {
            authResp.message = CloneConstants.errorMsg.DESTINATION_ERROR_STATUS + soapResponse.getStatusCode();
            return true;
        }
        if (soapResponse.getErrorMessage()) {
            authResp.message = soapResponse.getErrorMessage();
            return true;
        }

        return false;
    },

    _buildWSURL: function(instance_url) {
        var url = instance_url + "";
        var http = "";
        var slash = "";
        if (url.charAt(url.length - 1, 1) != '/')
            slash = "/";

        if (url.indexOf("http") != 0) {
            http = "http://";

            if (url.indexOf("localhost") == -1)
                http = "https://";
        }

        return http + url + slash + "HAGetParams.do?SOAP";
    },

    _formatVersion: function(version) {
        if (gs.nil(version))
            return "";

        if (version == 'null')
            return "";

        if (version.length > 4 && version.indexOf('.') > -1)
            return version.substring(0, version.length - 4);

        return version;
    },

    _isValidAuthResponse: function(xmlDoc) {
        var remote_instance_id = xmlDoc.getNodeText("//instance_id");
        return !gs.nil(remote_instance_id) && !this._isSameInstanceId(remote_instance_id);
    },

    _getInstanceRecord: function(instanceSysId) {
        if (gs.nil(instanceSysId))
            return null;

        var gr = new GlideRecord('instance');
        if (gr.get(instanceSysId) && gr.primary == false) // don't return the primary setup record
            return gr;

        return null;
    },

    _getInstanceName: function(instanceUrl, user, password) {
        if (gs.nil(instanceUrl))
            return '';

        // Fetch instance name from sys_properties table using authenticated API call
        try {
            var request = new sn_ws.RESTMessageV2();
            request.setEndpoint(instanceUrl + this.SYS_PROPERTIES_TABLE_URL);
            request.setHttpMethod('GET');
            request.setBasicAuth(user, password);
            request.setQueryParameter('sysparm_query', 'name=instance_name');
            request.setRequestHeader('Accept', 'application/json');

            var response = request.execute();
            var httpStatus = response.getStatusCode();

            if (httpStatus == 200) {
                var body = JSON.parse(response.getBody());

                if (body.result && body.result.length > 0) {
                    var instanceName = body.result[0].value;

                    if (!gs.nil(instanceName)) {
                        gs.info(gs.getMessage('clone.info.instance_name.retrieved', [instanceName]));
                        return instanceName;
                    } else {
                        gs.warn(gs.getMessage('clone.warn.instance_name.empty'));
                    }
                } else {
                    gs.warn(gs.getMessage('clone.warn.instance_name.not_found'));
                }
            } else {
                gs.warn(gs.getMessage('clone.warn.sys_properties.api_failed', [httpStatus]));
            }
        } catch (ex) {
            gs.error(gs.getMessage('clone.error.sys_properties.api_error', [ex.getMessage()]));
        }

        // Fallback to URL parsing if API call fails
        return this._getInstanceNameFromUrl(instanceUrl);
    },

    _getInstanceNameFromUrl: function(instanceUrl) {
        // Parse instance name from URL (used when MTLS is enabled)
        var name = instanceUrl;
        name = name.replace("http://", "");
        name = name.replace("https://", "");
        name = name.replace(".service-now.com", "");
        name = name.replace(".servicenow.com", "");
        if (name.endsWith("/"))
            name = name.substring(0, name.length - 1);

        return name;
    },

    _isSameInstanceId: function(remote_instance_id) {
        var self_instance_id = gs.getProperty("instance_id");
        if (gs.nil(remote_instance_id) || gs.nil(self_instance_id))
            return false;

        return remote_instance_id == self_instance_id;
    },

    // setupTrustorInstances: function(trustorInstances, trusteeInstance) {
    // 	var result = {
    // 		isError: true,
    // 		message: ""
    // 	};
    // 	var payload = {};
    // 	try {
    // 		var json = new global.JSON();
    // 		var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
    // 		request.setPath(this.SETUP_MIF_INSTANCES);
    // 		request.setHttpMethod('POST');
    // 		request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
    // 		request.setIdentityCertificateMutualAuth(true);
    // 		request.setRequestHeader("Content-Type", "application/json");
    // 		request.setRequestHeader("Accept", "application/json");
    // 		payload.trusteeInstanceId = trusteeInstance;
    // 		payload.trustorInstances = trustorInstances;
    // 		request.setRequestBody(json.encode(payload));

    // 		gs.info("Sending setup request for trustee instance: " + trusteeInstance +
    // 			", trustor instances: " + JSON.stringify(trustorInstances));

    // 		this._insertTrustStatusRecord(trustorInstances);

    // 		var response = request.execute();
    // 		var body = json.decode(response.getBody());
    // 		if (gs.nil(body)) {
    // 			result.message = "Response Body is empty.";
    // 			gs.error(result.message);
    // 		} else if (body.status === CloneConstants.reqState.FAILURE) {
    // 			result.message = "Total failure. Please check the server logs for details.";
    // 			gs.error(result.message);
    // 		} else {
    // 			var responseResult = body.result;
    // 			if (responseResult.isError === false) {
    // 				result.isError = false;
    // 				result.message = "All instances set up successfully.";
    // 			} else {
    // 				result.message = "Partial setup success. Failed trustor instances: " +
    // 					(responseResult.failedTrustorInstances ?
    // 						responseResult.failedTrustorInstances.join(', ') : "None");
    // 				gs.warn(result.message);
    // 			}
    // 		}
    // 	} catch (e) {
    // 		result.isError = true;
    // 		result.message = "An error occurred while setting up trustor instances: " + e.message;
    // 		gs.error(result.message);
    // 	}
    // 	return result;
    // },
    setupTrustorInstances: function(trustorInstances, trusteeInstance) {
        var result = {
            isError: true,
            message: ""
        };
        var payload = {};
        try {
            // --- Pre-flight: filter out failure-state instances ---
            var filteredTrustorInstances = [];
            for (var i = 0; i < trustorInstances.length; i++) {
                if (trustorInstances[i].operation_type === 'remove') {
                    var instanceId = trustorInstances[i].instance_id;
                    var mifGR = new GlideRecord('sn_instance_clone_mif_enabled_instance');
                    mifGR.addQuery('trustor_instance_id', instanceId);
                    mifGR.addQuery('trust_status', 'failure');
                    mifGR.query();

                    if (mifGR.next()) {
                        // Delete the failure record and skip sending in REST call
                        gs.info("Removing failure-state record for instance: " + instanceId);
                        mifGR.deleteRecord();
                        continue;
                    }
                }
                filteredTrustorInstances.push(trustorInstances[i]);
            }

            // If nothing left to process after filtering, return early
            if (filteredTrustorInstances.length === 0) {
                result.isError = false;
                result.message = "No instances to process — all were in failure state and have been cleaned up.";
                gs.info(result.message);
                return result;
            }
            // --- End pre-flight ---

            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.SETUP_MIF_INSTANCES);
            request.setHttpMethod('POST');
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(true);
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            payload.trusteeInstanceId = trusteeInstance;
            payload.trustorInstances = filteredTrustorInstances;
            request.setRequestBody(json.encode(payload));

            gs.info("Sending setup request for trustee instance: " + trusteeInstance +
                ", trustor instances: " + JSON.stringify(filteredTrustorInstances));

            this._insertTrustStatusRecord(filteredTrustorInstances);

            var response = request.execute();
            var body = json.decode(response.getBody());
            if (gs.nil(body)) {
                result.message = "Response Body is empty.";
                gs.error(result.message);
            } else if (body.status === CloneConstants.reqState.FAILURE) {
                result.message = "Total failure. Please check the server logs for details.";
                gs.error(result.message);
            } else {
                var responseResult = body.result;
                if (responseResult.isError === false) {
                    result.isError = false;
                    result.message = "All instances set up successfully.";
                } else {
                    result.message = "Partial setup success. Failed trustor instances: " +
                        (responseResult.failedTrustorInstances ?
                            responseResult.failedTrustorInstances.join(', ') : "None");
                    gs.warn(result.message);
                }
            }
        } catch (e) {
            result.isError = true;
            result.message = "An error occurred while setting up trustor instances: " + e.message;
            gs.error(result.message);
        }
        return result;
    },
    _insertTrustStatusRecord: function(trustorInstances) {
        if (!Array.isArray(trustorInstances) || trustorInstances.length === 0) {
            return; // nothing to insert
        }
        var tableName = 'sn_instance_clone_mif_enabled_instance';
        trustorInstances.forEach(function(trustor) {
            try {
                var gr = new GlideRecord(tableName);
                gr.addQuery('trustor_instance_id', trustor.instance_id);
                gr.query();
                if (trustor.operation_type && trustor.operation_type.equalsIgnoreCase('remove')) {
                    while (gr.next()) {
                        gr.setValue('trust_status', 'requested remove');
                        gr.setValue('trust_failure_reason', '');
                        gr.setValue('user', gs.getUserID());
                        gr.update();
                        recordFound = true;
                        gs.info("Updated trust status to 'removing trust' for instance " + trustor.instance_id);
                        break;
                    }
                } else {
                    var recordFound = false;
                    while (gr.next()) {
                        gr.setValue('trust_status', 'requested');
                        gr.setValue('trust_failure_reason', '');
                        gr.update();
                        recordFound = true;
                        gs.info("Updated trust status to 'requested' for instance " + trustor.instance_id);
                        recordFound = true; // record exists but not failed — no need to insert again
                        break;
                    }
                    if (!recordFound) {
                        // No existing record found → insert a new one
                        var newGr = new GlideRecord(tableName);
                        newGr.initialize();
                        newGr.setValue('trust_status', 'requested'); // default status
                        newGr.setValue('trustor_instance_id', trustor.instance_id);
                        newGr.setValue('trustor_instance_name', trustor.instance_name || trustor.instance_id);
                        newGr.setValue('user', gs.getUserID());
                        newGr.insert();
                        gs.info("Inserted new trust status record for instance " + trustor.instance_id);
                    }
                }
            } catch (e) {
                gs.error("Error inserting/updating trust status record for instance " + trustor.instance_id + ": " + e);
            }
        });
    },

    /**
     * Set EKMS Status in Auth Response.
     *
     * @param authResp {Object} Auth Response Object
     * @param isEKMSError {boolean} True if EKMS Error, else false
     * @param ekmsErrorMessage {string} EKMS Error Message
     */
    _setAuthResponseEKMSStatus: function(authResp, isEKMSError, ekmsErrorMessage, requires_tmp_message, clone_id) {
        var error_ekms_heading = undefined;
        if (requires_tmp_message) {
            var tmp_ekms_message = gs.getMessage("clone.error.ekms.message");
            error_ekms_heading = gs.getMessage("clone.error.ekms.heading");
            ekmsErrorMessage = tmp_ekms_message + ekmsErrorMessage;
        }
        authResp.isEKMSError = isEKMSError;
        authResp.ekmsErrorHeading = error_ekms_heading;
        authResp.ekmsErrorMessage = ekmsErrorMessage;
        SncCloneLoggerUtil.error(clone_id, ekmsErrorMessage, this.className);
    },

    /**
     * Update EKMS Status in Auth Response.
     *
     * @param targetResponse {Object} Target Response Object
     * @param authResp {Object} Auth Response Object
     */
    _updateEKMSStatus: function(targetResponse, authResp, clone_id) {
        var sourceStats = {},
            targetStats = {};
        var sampleNotCapableStats = {
            status: this.NOT_CAPABLE
        };
        // Target EKMS Check
        try {
            targetStats = targetResponse.ekms_stats === undefined ? sampleNotCapableStats : targetResponse.ekms_stats;
            if (targetStats.status !== this.NOT_CAPABLE && targetStats.status !== this.CAPABLE && targetStats.status !== this.ENABLED) {
                this._setAuthResponseEKMSStatus(authResp, true, 'EKMS API Failed to fetch Target instance status.', false, clone_id);
                return;
            }
        } catch (e) {
            targetStats = sampleNotCapableStats;
        }
        if (targetStats.status === this.NOT_CAPABLE) return;
        // Source EKMS Check 
        var sourceCapability = false;
        try {
            sourceCapability = global.SystemCloneWrapper.checkEKMSXMLStats();
        } catch (e) {
            SncCloneLoggerUtil.error(clone_id, "Can't call checkEKMSXMLStats: " + e.message, this.className);
        }
        if (sourceCapability) {
            // Call the EKMS API
            try {
                var ekmsStats = new global.EKMSApi().getStats();
                sourceStats = JSON.parse(ekmsStats);
            } catch (e) {
                this._setAuthResponseEKMSStatus(authResp, true, 'EKMS API Failed to fetch Source instance status.', false, clone_id);
                return;
            }
        } else {
            if (targetStats.status === this.ENABLED) this._setAuthResponseEKMSStatus(authResp, true, " Case E: Not Capable → Enabled. Refer to KB2540187 for manual resolution.", true, clone_id);
            return; // Source not_capable -> DC Check
        }
        // Call the EKMS Preflight API
        var ekmsPreflightError = 'EKMS API Preflight Check Failed';
        try {
            var ekmsPreflight = new global.EKMSApi().preflightCheck(JSON.stringify(sourceStats), JSON.stringify(targetStats));
            ekmsPreflight = JSON.parse(ekmsPreflight);
        } catch (e) {
            this._setAuthResponseEKMSStatus(authResp, true, ekmsPreflightError, false, clone_id);
            return;
        }
        // Update Auth Response from EKMS Preflight API Response
        if (gs.nil(ekmsPreflight.decision)) {
            this._setAuthResponseEKMSStatus(authResp, true, ekmsPreflightError, false, clone_id);
        } else if (ekmsPreflight.decision !== "PREFLIGHT_OK") {
            if (!gs.nil(ekmsPreflight.reason)) {
                this._setAuthResponseEKMSStatus(authResp, true, ekmsPreflight.reason, true, clone_id);
            } else {
                this._setAuthResponseEKMSStatus(authResp, true, ekmsPreflightError, false, clone_id);
            }
        }
        return;
    },

    /*
     * Get instance name from instance ID.
     * @param instanceId - String (Instance ID to lookup)
     * @returns String (Instance name or empty string if not found)
     */
    _getInstanceNameFromId: function(instanceId) {
        if (gs.nil(instanceId))
            return '';

        // Check if it's the current instance
        var selfInstanceId = gs.getProperty('instance_id');
        if (instanceId.equalsIgnoreCase(selfInstanceId))
            return gs.getProperty('instance_name');

        // Search in the instance table
        var instanceGR = new GlideRecord('instance');
        instanceGR.addQuery('instance_id', instanceId);
        instanceGR.query();

        if (instanceGR.next())
            return instanceGR.getValue('instance_name');

        return '';
    },
	fetchCloneAvailableWindows: function(startDateTimeInUTC, endDateTimeInUTC, tgtInstanceId) {
        var windowResult = {
            isError: true,
            message: "",
            mode: "", // 'available' (time-range API) or 'conflicts' (legacy API)
            windows: [], // populated when mode === 'available'
            conflicts: [] // populated when mode === 'conflicts'
        };

        if (gs.nil(tgtInstanceId)) {
            windowResult.message = gs.getMessage('clone.calendar.target.id.required');
            return windowResult;
        }

        var useTimeRangeApi = gs.getProperty('sn_instance_clone.glide.db.system.clone.use_time_range_api', 'false') == 'true';

        if (!useTimeRangeApi) {
            var conflictResult = this.fetchCloneConflicts(startDateTimeInUTC, endDateTimeInUTC, tgtInstanceId);
            windowResult.mode = CloneConstants.calendarConstants.CONFLICTS;
            windowResult.conflicts = conflictResult.conflicts;
            windowResult.isError = conflictResult.isError;
            windowResult.message = conflictResult.message;
            return windowResult;
        }

        var payload = {};
        payload.maintenanceStartDateTimeStringInUTC = startDateTimeInUTC + '';
        payload.maintenanceEndDateTimeStringInUTC = endDateTimeInUTC + '';
        payload.inputCiListString = "InstanceIDs:" + tgtInstanceId;
        payload.inputCiNameListString = "InstanceNames:" + this._getInstanceNameFromId(tgtInstanceId);

        var json = new global.JSON();
        try {
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_TIME_RANGE);
            request.setRequestHeader('X-KaaUserClaim', gs.base64Encode('ws.clone.kaa'));
            request.setIdentityCertificateMutualAuth(this.CLONE_USE_MTLS);
            request.setHttpMethod('POST');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setRequestBody(json.encode(payload));

            var response = request.execute();
            var responseStatus = response.getStatusCode();
            var responseObj = json.decode(response.getBody());

            if (responseStatus == 200 && responseObj.result.status == CloneConstants.reqState.SUCCESS) {
                windowResult.mode = CloneConstants.calendarConstants.AVAILABLE;
                windowResult.windows = responseObj.result.output || [];
                windowResult.isError = false;
            } else {
                windowResult.message = (responseObj.result && responseObj.result.message) || gs.getMessage("clone.timerange.api.failure");
            }
        } catch (ex) {
            windowResult.message = ex.message;
        }

        return windowResult;
    },

    type: 'CloneRestService'
};
