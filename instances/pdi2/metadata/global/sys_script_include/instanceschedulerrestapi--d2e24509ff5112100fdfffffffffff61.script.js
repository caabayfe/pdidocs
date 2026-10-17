var InstanceSchedulerRestAPI = Class.create();
InstanceSchedulerRestAPI.prototype = {
    initialize: function() {
        this.SERVER_URL = gs.getProperty("glide.db.clone.instance_clone_server");
        if (!gs.nil(this.SERVER_URL) && !this.SERVER_URL.endsWith('/'))
            this.SERVER_URL = this.SERVER_URL.concat('/');
        this.CLONE_STATUS_URL = ("api/snc/systemclonev2/status");
        this.CLONE_SCHEDULER_URL = ("api/snc/systemclonev2/schedule");
        this.CLONE_CANCEL_URL = ("api/snc/systemclonev2/cancel");
        this.CLONE_ROLLBACK_URL = ("api/snc/systemclonev2/rollback");
        this.CLONE_RESERVATION_URL = ("api/snc/systemclonev2/checkForAvailableReservation");
        this.className = "InstanceSchedulerRestAPI";
    },
    checkCloneStatus: function(cloneSysId) {
        var json = new global.JSON();
        var cloneGr = new GlideRecord("clone_instance");
        if (!cloneGr.get(cloneSysId))
            return;
        var cloneState = cloneGr.getValue('state');
        if (!cloneState.equalsIgnoreCase('Requested'))
            return;
        var cloneId = cloneGr.getValue('clone_id');
        try {
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_STATUS_URL);
            request.setIdentityCertificateMutualAuth(true);
            request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode('ws.clone.kaa'));
            request.setHttpMethod('GET');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('cloneId', cloneSysId);
            var response = request.execute();
            var body = json.decode(response.getBody());
            var result = body.result;
            if (!gs.nil(result)) {
                var isError = result.isError;
                if (isError == false) {
                    gs.log(cloneId + ": Check Clone Status Response: " + result.description, this.className);
                    if (!gs.nil(result.state))
                        cloneGr.setValue('state', result.state);
                    this.logCloneMessage(cloneGr, /*info*/ 0, result.description, '');
                }
            } else {
                this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.status.confirmation', '');
                gs.print(cloneId + ": Error in getting status from server : " + result.description, this.className);
                cloneGr.setValue('state', 'Error');
            }
        } catch (e) {
            this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.status.confirmation', '');
            gs.print(cloneId + ": Error in getting status from server : " + e.toString(), this.className);
            cloneGr.setValue('state', 'Error');
        }
        cloneGr.setWorkflow(false);
        cloneGr.update();
        cloneGr.setWorkflow(true);
    },
    cancelClone: function(cloneSysId) {
        var cloneGr = new GlideRecord("clone_instance");
        if (!cloneGr.get(cloneSysId))
            return;
        var cloneId = cloneGr.getValue('clone_id');
        var reason = JSON.parse(cloneGr.getValue('telemetry'));
        var payload = {};
        var json = new global.JSON();
        var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
        request.setPath(this.CLONE_CANCEL_URL);
        request.setIdentityCertificateMutualAuth(true);
        request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode('ws.clone.kaa'));
        request.setHttpMethod('POST');
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        payload.cloneId = cloneSysId + "";
        payload.cancelReason = reason.cancelReason;
        request.setRequestBody(JSON.stringify(payload));
        var response = request.execute();
        if (response.getStatusCode() != 200) {
            this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.server.confirmation', '');
            gs.logError(cloneId + " : Error in Response from server : " + response, this.className);
        } else {
            var body = json.decode(response.getBody());
            var result = body.result;
            if (result.isError) {
                this.logCloneMessage(cloneGr, /*error*/ 2, result.message, '');
                return;
            }
            gs.log(cloneId + " : Cancel Clone Response from server " + JSON.stringify(response.getBody()), this.className);
            SncCloneLogger.log(this.className, cloneGr.getValue('sys_id'), null, /*info*/ 0, result.message);
        }
    },
    cloneRollback: function(cloneSysId) {
        var cloneGr = new GlideRecord("clone_instance");
        if (!cloneGr.get(cloneSysId))
            return;
        var cloneId = cloneGr.getValue('clone_id');
        var reason = JSON.parse(cloneGr.getValue('telemetry'));
        var payload = {};
        var json = new global.JSON();
        var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
        request.setPath(this.CLONE_ROLLBACK_URL);
        request.setIdentityCertificateMutualAuth(true);
        request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode('ws.clone.kaa'));
        request.setHttpMethod('POST');
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        payload.cloneId = cloneSysId + "";
        payload.rollbackReason = reason.rollbackReason;
        request.setRequestBody(JSON.stringify(payload));
        var response = request.execute();
        if (response.getStatusCode() != 200) {
            this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.server.confirmation', '');
            gs.logError(cloneId + " : Error in Response from server : " + response, this.className);
        } else {
            var body = json.decode(response.getBody());
            var result = body.result;
            if (result.isError) {
                this.logCloneMessage(cloneGr, /*error*/ 2, result.message, '');
                return;
            }
            cloneGr.setValue('state', result.state);
            cloneGr.setWorkflow(false);
            cloneGr.update();
            gs.log(cloneId + " : Rollback Clone Response from server " + JSON.stringify(response.getBody()), this.className);
            SncCloneLogger.log(this.className, cloneGr.getValue('sys_id'), null, /*info*/ 0, result.message);
        }
    },
    checkForCloneStateChange: function(cloneGr, result) {
        var state = String(result.state);
        var description = String(result.description);
        var oldState = cloneGr.state;
        var stateChanged = !gs.nil(state) && oldState != state;
        if (stateChanged) {
            gs.log("Schedule Server changed state from " + oldState + " to " + state + " (" + description + ")", this.className);
            cloneGr.state = state;
            if (state == 'Hold')
                cloneGr.message = description;
        }
    },
    updateCloneRespParams: function(cloneGr, result) {
        var cloneType = String(result.clone_type);
        var description = String(result.description);
        var oldClusterNode = cloneGr.cluster_node || '';
        var newClusterNode = String(result.cluster_node);
        var isCloneTypeChanged = !gs.nil(cloneType) && cloneGr.clone_type != cloneType;
        var nodeChanged = !gs.nil(newClusterNode) && (gs.nil(cloneGr.cluster_node) || cloneGr.cluster_node != newClusterNode);
        if (nodeChanged && this._setClusterNode(cloneGr, newClusterNode))
            gs.log("Schedule Server changed cluster node from " + oldClusterNode + " to " + newClusterNode + " (" + description + ")", this.className);

        if (isCloneTypeChanged) {
            gs.log("Clone Type changed from " + cloneGr.clone_type + " to " + cloneType, this.className);
            cloneGr.setValue("clone_type", cloneType);
        }
    },
    handleRestResponse: function(response, cloneGr) {
        var json = new global.JSON();
        try {
            var body = json.decode(response.getBody());
            var result = body.result;
            gs.log(cloneGr.getValue('clone_id') + " : Result " + JSON.stringify(result), this.className);
            if (gs.nil(result) || result.isError == true) {
                cloneGr.setValue('error_message', 'Error encountered while scheduling clone request. Please contact support team.');
                this.logCloneMessage(cloneGr, /*error*/ 2, result.message, '');
                cloneGr.setValue('state', 'Error');
                cloneGr.setWorkflow(false); //Don't trigger any BR
                cloneGr.update();
                return;
            }
            this.checkForCloneScheduleChange(cloneGr, result);
            this.checkForCloneStateChange(cloneGr, result);
            this.updateCloneRespParams(cloneGr, result);
            if (!gs.nil(String(result.cloud_details)))
                cloneGr.setValue("cloud_details", String(result.cloud_details));
            cloneGr.setValue('estimated_clone_duration', String(result.estimatedCloneDuration));
            cloneGr.setWorkflow(false);
            cloneGr.update();
        } catch (e) {
            throw e;
        }
    },
    _getInstanceRecord: function(instanceSysId) {
        if (gs.nil(instanceSysId))
            return null;

        var gr = new GlideRecord('instance');
        if (gr.get(instanceSysId) && gr.primary == false) // don't return the primary setup record
            return gr;

        return null;
    },
	_getSystemId: function(clusterStateSysId) {
        if (gs.nil(clusterStateSysId))
            return "";

        var gr = new GlideRecord("sys_cluster_state");
        if (gr.get(clusterStateSysId))
            return gr.system_id;

        return "";
    },
	_isMaint: function(user_id) {
        if (gs.hasRole('maint'))
            return true;

        var gr = new GlideRecord("sys_user");
        gr.addQuery("user_name", user_id);
        gr.query();
        if (gr.next()) {
            var user = GlideUser.getUserByID(gr.sys_id);
            return user != null ? user.hasRole("maint") : false;
        }
        return false;
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
	_formatDBServer: function(jdbcUrl) {
        if (gs.nil(jdbcUrl))
            return "";

        // jdbc:mysql://servername:port/
        // jdbc:sqlserver://servername:portnum/
        var answer = jdbcUrl;
        var idx = answer.indexOf('://');
        if (idx > -1) {
            answer = answer.substring(idx + 3).replace('/', '');
            idx = answer.indexOf(':');
            if (idx > -1)
                answer = answer.substring(0, idx);
        }

        // jdbc:oracle:thin:@host.com:1521:sidname
        idx = jdbcUrl.indexOf(':@');
        if (idx > -1) {
            answer = answer.substring(idx + 2).replace('/', '');

            idx = answer.indexOf(':');
            if (idx > -1)
                answer = answer.substring(0, idx);
        }

        return answer;
    },
    scheduleClone: function(cloneGr, notified) {
        try {
            var payload = {};
            var sourceName = SncCloneUtils.getSourceInstanceName();
            var sourceUrl = SncCloneUtils.getSourceInstanceUrl();
            var primaryIP = GlideUtil.isDeveloperInstance() ? "localhost" : GlideHostUtil.getPublicIPAddress();
            var standbyInstanceGr = this._getInstanceRecord(cloneGr.getValue('source_instance'));
            var targetInstanceGr = this._getInstanceRecord(cloneGr.getValue('target_instance'));
            var json = new global.JSON();
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_SCHEDULER_URL);
            request.setIdentityCertificateMutualAuth(true);
            request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode('ws.clone.kaa'));
            request.setHttpMethod('POST');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");

            if (!gs.nil(cloneGr.parent))
                payload.parent_clone_id = cloneGr.getValue('parent');
            payload.clone_id = cloneGr.getValue('sys_id');
            payload.date = cloneGr.getValue('scheduled') || new GlideDateTime();
            payload.state = cloneGr.getValue('state');
            payload.cluster_node = this._getSystemId(cloneGr.getValue('cluster_node'));
            payload.user_name = cloneGr.getValue('sys_created_by');
            payload.user_maint = this._isMaint(cloneGr.getValue('sys_created_by'));
            payload.user_email = cloneGr.getValue('email');
            payload.security_token = cloneGr.getValue('security_token');
            //source instance details
            payload.u_req_origin_instance = gs.getProperty('instance_id');
            payload.source_instance_id = cloneGr.source_instance.instance_id;
            if (gs.nil(payload.source_instance_id))
                payload.source_instance_id = String(payload.u_req_origin_instance);
            payload.source_instance_name = gs.getProperty('instance_name') || sourceName;
            payload.source_instance_url = sourceUrl;
            payload.source_version = this._formatVersion(gs.getProperty('glide.war'));
            //target instance details
            payload.target_instance_id = String(targetInstanceGr.getValue('instance_id'));
            payload.target_instance_name = targetInstanceGr.getValue('instance_name');
            payload.target_instance_url = targetInstanceGr.getValue('instance_url');
            payload.target_version = this._formatVersion(targetInstanceGr.getValue('war_version'));

            //jdbc details
            var primaryParms = GlideDBUtil.getPrimaryDBConfigurationParms();
            var sourceJDBCUrl = primaryParms.getURL().replace("localhost", primaryIP);
            var sourceDBName = primaryParms.getDatabaseName();
            var targetJDBCUrl = targetInstanceGr.getValue('database_url').replace("localhost", primaryIP);
            var targetDBName = targetInstanceGr.getValue('database_name');
            var standbyJDBCUrl = standbyInstanceGr == null ? "" : standbyInstanceGr.getValue('database_url').replace("localhost", primaryIP);
            var standbyDBName = standbyInstanceGr == null ? "" : standbyInstanceGr.getValue('database_name');
            payload.source_jdbc_url = sourceJDBCUrl;
            payload.source_db_server = this._formatDBServer(sourceJDBCUrl);
            payload.source_db_name = sourceDBName;
            payload.target_jdbc_url = targetJDBCUrl;
            payload.target_db_server = this._formatDBServer(targetJDBCUrl);
            payload.target_db_name = targetDBName;
            payload.standby_jdbc_url = standbyJDBCUrl;
            payload.standby_db_server = this._formatDBServer(standbyJDBCUrl);
            payload.standby_db_name = standbyDBName;
            payload.validation_error = targetInstanceGr.getValue('validation_error');
            //timing and metric details
            payload.mb_to_copy = cloneGr.getValue('megabytes_to_copy');
            payload.mb_copied = cloneGr.getValue('megabytes_copied');
            payload.kb_per_second = cloneGr.getValue('kilobytes_per_second');
            payload.duration = cloneGr.getValue('duration');
            payload.started = cloneGr.getValue('started');
            payload.completed = cloneGr.getValue('completed');
            payload.cancelled = cloneGr.getValue('canceled');
            if (cloneGr.getValue('state') != 'Draft') {
                var telemetry = this._getTelemetryData();
                payload.telemetry = telemetry;
            }
            payload.check_for_available_reservation = 'false'; //To bypass check_for_available_reservation
            //clone options
            payload.exclude_tables_specified_in_exclusion_list = Boolean(cloneGr.exclude_all_from_exclusion_list);
            payload.exclude_audit_and_log_data = Boolean(cloneGr.exclude_large_data);
            payload.preserve_in_progress_update_sets = cloneGr.getValue('preserve_in_progress_update_sets');
            payload.exclude_large_attachment_data = Boolean(cloneGr.filter_attachment_data);
            payload.amount_of_data_copied_from_large_tables = cloneGr.getValue('amount_of_data_copied_from_large_tables');
            payload.preserve_theme = Boolean(cloneGr.preserve_theme);
            payload.profile = !gs.nil(cloneGr.getValue('profile_name')) ? cloneGr.getValue('profile_name') : cloneGr.profile.getDisplayValue();
            payload.lock_clone_config = Boolean(cloneGr.lock_profile_settings);
            payload.clone_frequency = cloneGr.getValue('clone_frequency');
            //var payloadJSON = json.encode(payload);
            var payloadJSON = JSON.stringify(payload);
            gs.log(cloneGr.getValue('clone_id') + " : REST Request Payload " + payloadJSON, this.className);
            request.setRequestBody(JSON.stringify(payload));
            //REST Response
            var scheduleResp = {};
            var response = request.execute();
            var body = json.decode(response.getBody());
            gs.log(cloneGr.getValue('clone_id') + " : Body " + JSON.stringify(body), this.className);
            if (!gs.nil(body)) {
                var result = body.result;
                this.handleRestResponse(response, cloneGr);
                notified = true;
                if (cloneGr.getValue("state") == CloneConstants.status.CLONE_STATUS_REQUESTED)
                    this.logCloneMessage(cloneGr, /*info*/ 0, 'clone.log.info.schedule.success', cloneGr.getValue('clone_id'));
                scheduleResp.message = result.message;
            } else {
                this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.status.confirmation', '');
                gs.logError(cloneGr.getValue('clone_id') + ": Error in getting status from server : " + result, this.className);
                cloneGr.setValue('state', 'Error');
            }
        } catch (e) {
            this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.schedule.request', e.toString());
        }
        return notified;
    },
    logCloneMessage: function(cloneGr, logLevel, msgKey, msgArgs) {
        var argsArray = [];
        if (gs.nil(cloneGr))
            return;
        if (!gs.nil(msgArgs))
            argsArray.push(msgArgs);
        if (!gs.nil(msgKey))
            SncCloneLogger.log(this.className, cloneGr.getValue('sys_id'), null, logLevel, gs.getMessage(msgKey, argsArray));
    },

	_getTelemetryData: function() {
        var gr = new GlideRecord("clone_instance");
        gr.orderByDesc('sys_created_on');
        //Each clone request sends three SOAP requests with states - Draft,Draft,Requested
        gr.setLimit(3);
        gr.query();
        var telemetry = {};
        while (gr.next()) {
            // security_token value is null for first Draft request in which we store the telemetry data
            if (!gr.getValue('security_token')) {
                telemetry = gr.getValue('telemetry');
            }
        }
        return telemetry;
    },


    checkForCloneScheduleChange: function(cloneGr, result) {
        cloneGr.setValue('clone_request_validation_rules', String(result.clone_request_validation_rules));
        var scheduled = cloneGr.scheduled;
        if (!gs.nil(result.date))
            scheduled = new GlideDateTime(result.date); // GMT
        var dateChanged = cloneGr.scheduled.getDisplayValue() != scheduled.getDisplayValue();
        if (dateChanged) {
            var cloneEstimationMessage = String(result.clone_estimation_message);
            var isReservationAvailableForCloning = String(result.is_reservation_available);
            cloneGr.setValue("scheduled", scheduled); // GMT
            cloneGr.setValue("clone_estimation_message", cloneEstimationMessage);
            cloneGr.setValue("is_reservation_available", isReservationAvailableForCloning);
        }
    },

    checkingForCloneReservation: function(cloneGr) {
        var json = new global.JSON();
        try {
            var srcInstanceId = gs.getProperty('instance_id');
            var tgtInstanceId = cloneGr.target_instance.instance_id;
            var request = new sn_internal_services.ServiceRESTMessage(this.SERVER_URL);
            request.setPath(this.CLONE_RESERVATION_URL);
            request.setIdentityCertificateMutualAuth(true);
            request.setRequestHeader('X-KaaUserClaim', GlideStringUtil.base64Encode('ws.clone.kaa'));
            request.setHttpMethod('GET');
            request.setRequestHeader("Content-Type", "application/json");
            request.setRequestHeader("Accept", "application/json");
            request.setQueryParameter('requestedTime', cloneGr.scheduled || new GlideDateTime().getValue());
            request.setQueryParameter('srcInstanceId', srcInstanceId);
            request.setQueryParameter('tgtInstanceId', tgtInstanceId);
            gs.log("Calling instance clone scheduler server: " + this.CLONE_RESERVATION_URL, this.className);
            var response = request.execute();
            if (response.getStatusCode() != 200) {
                this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.server.confirmation', '');
                gs.logError(cloneGr.getValue('clone_id') + ": Error in getting clone reservation from server : " + (result.message || ''), this.className);
            } else {
                var body = json.decode(response.getBody());
                gs.log(cloneGr.getValue('clone_id') + " :  Body " + JSON.stringify(body), this.className);
                var result = body.result;
                var isError = result.isError;
                if (isError == false) {
                    var scheduled = cloneGr.getValue('scheduled') || new GlideDateTime().getValue();
                    cloneGr.setValue("scheduled", scheduled); // GMT
                }
                var isReservationAvailableForCloning = !gs.nil(result.is_reservation_available) ? String(result.is_reservation_available) : '';
                var cloneEstimationMessage = !gs.nil(result.clone_estimation_message) ? String(result.clone_estimation_message) : '';
                cloneGr.setValue("clone_estimation_message", cloneEstimationMessage);
                cloneGr.setValue("is_reservation_available", isReservationAvailableForCloning);
                cloneGr.setWorkflow(false); //Don't trigger any BR
                cloneGr.update();
            }
        } catch (e) {
            this.logCloneMessage(cloneGr, /*error*/ 2, 'clone.log.error.schedule.request', e.toString());
            gs.logError(cloneGr.getValue('clone_id') + ": Error in getting clone reservation from server : " + (result.message || ''), this.className);
        }
    },
    type: 'InstanceSchedulerRestAPI'
};
