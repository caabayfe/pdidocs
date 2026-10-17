var DCCalendarRestEndPoint = Class.create();
DCCalendarRestEndPoint.BLACKOUT = 'BLACKOUT';
DCCalendarRestEndPoint.ALREADY_SCHEDULED_OPERATIONS = 'ALREADY_SCHEDULED_OPERATIONS';
DCCalendarRestEndPoint.prototype = {
    // DataCenter Variables 
    _datacenterUrl: null,
    _inputCiListString: null,
    _maintenanceStartDateTimeStringInUTC: null,
    _maintenanceEndDateTimeStringInUTC: null,
    _responseObj: {
        stcdResult: {
            status: '',
            errorMessage: '',
            responseStatus: ''
        }
    },

    initialize: function() {
        this.className = 'DCCalendarRestEndPoint';
        this._datacenterUrl = gs.getProperty('glide.db.clone.instance_clone_server');
    },

    /**
     * 
     * @get Internal method to Invoke DC Rest API to get Conflicts.
     * @returns {<conflicts from Datacenter>} 
     */
    _requestToGetConflictsRest: function() {

        try {
            var getConflictResult = {
                stcdResult: {}
            };
            var objectForPayload = {};
            objectForPayload.inputCiListString = this._inputCiListString;
            objectForPayload.maintenanceStartDateTimeStringInUTC = this._maintenanceStartDateTimeStringInUTC;
            objectForPayload.maintenanceEndDateTimeStringInUTC = this._maintenanceEndDateTimeStringInUTC;

            var restMessage = new sn_ws.RESTMessageV2();
            var serverUrl = this._datacenterUrl.substring(0, this._datacenterUrl.lastIndexOf('/') + 1);
            var user = gs.getProperty('instance_id');
            var password = '';
            if (!gs.nil(gs.getProperty('glide.customurl.datacenter.instance.password', null)))
                password = GlideStringUtil.base64Encode(gs.getProperty('glide.customurl.datacenter.instance.password', null));
            else 
				throw new Error('ConflictCalendarApi cannot be invoked since no credentials were found.');

			restMessage.setEndpoint(serverUrl + '/api/snc/conflictcalendarapi/getCloneConflicts');
            restMessage.setHttpMethod("post");
            restMessage.setRequestHeader("Accept", "application/json");
            restMessage.setRequestHeader("Content-Type", "application/json");
            restMessage.setRequestHeader('user', user);
            restMessage.setRequestHeader('password', password);
            restMessage.setRequestBody(JSON.stringify(objectForPayload));
            var stopWatch = new GlideStopWatch();
            var response = restMessage.execute();
            var duration = stopWatch.getTime();
            getConflictResult.stcdResult.responseStatus = response.getStatusCode();
            var responseBody = response.getBody();
            var responseObj = JSON.parse(responseBody);
            var reslen = responseObj.result.output.length;

            var errorMessage = "";
            var blackoutConflictsArray = [];
            var maintenanceConflictsArray = [];

            if (getConflictResult.stcdResult.responseStatus == 200 && responseObj.result.status == 'success') {
                for (var i = 0; i < reslen; i++) {
                    var responseResult = responseObj.result.output[i];

                    if (responseResult.conflictReason == DCCalendarRestEndPoint.BLACKOUT) {
                        var blackoutSchedule = {};
                        blackoutSchedule.start_date = responseResult.scheduledOperationStartDateTime;
                        blackoutSchedule.end_date = responseResult.scheduledOperationEndDateTime;
                        blackoutSchedule.changeNumber = responseResult.scheduledChangeRequest;
						blackoutSchedule.operationId = gs.generateGUID();
                        blackoutConflictsArray.push(blackoutSchedule);
                    } else if (responseResult.conflictReason == DCCalendarRestEndPoint.ALREADY_SCHEDULED_OPERATIONS) {
                        var conflicts = {};
                        conflicts.start_date = responseResult.scheduledOperationStartDateTime;
                        conflicts.end_date = responseResult.scheduledOperationEndDateTime;
                        conflicts.changeNumber = responseResult.scheduledChangeRequest;
						conflicts.operationId = gs.generateGUID();
                        maintenanceConflictsArray.push(conflicts);
                    }
                }
            } else
				getConflictResult.stcdResult.errorMessage = responseObj.result.message;

            getConflictResult.stcdResult.status = responseObj.result.status;
            getConflictResult.stcdResult.duration = duration;
            getConflictResult.stcdResult.maintenanceConflicts = maintenanceConflictsArray;
            getConflictResult.stcdResult.blackoutConflicts = blackoutConflictsArray;
            return getConflictResult;

        } catch (ex) {
            gs.logError("_requestToGetConflictsRest: " + ex, this.className);
            return {
                stcdResult: {
                    responseStatus: '400',
                    status: 'error',
                    errorMessage: 'Exception occured : ' + ex
                }
            };
        }
    },

    /**
     * @generate inputcistring for STCD DC API call
     * @param {<string>} <type> - <instance or node>
     * @param {<string>} <id> - <CI Id>
     * @returns {<string>} <inputCiString> - <inputcistring for STCD DC API call>
     */
    getInputCiString: function(type, id) {
        if (type == "instance")
            ciString = "InstanceIDs:" + id;
        else if (type == "node")
            ciString = "NodeIDs:" + id;

        return ciString;
    },

    /**
     * 
     * @Global Wrapper method to get Datacenter conflicts
     * @param {<string>} <startDateTimeInUTC> - <Start Time in UTC to check for the conflicts>
     * @param {<string>} <endDateTimeInUTC> - <End Time in UTC to check for the conflicts>
     * @param {<string>} <dcInstanceID> - <Instance ID >
     * @returns {<Object>} <an object with Details about the Conflicts>
     * @example 
     * @see 
     */
    requestToGetConflictsRest: function(startDateTimeInUTC, endDateTimeInUTC, dcInstanceID) {
        var funcName = "requestToGetConflictsRest";
        if (dcInstanceID)
            this.dcInstanceID = dcInstanceID;
        else {
            gs.debug(funcName + 'instanceID is missing for the CI');
            this._responseObj.stcdResult.status = 'error';
            this._responseObj.stcdResult.errorMessage = 'instanceID is missing for the CI';
            return this._responseObj;
        }

        var inputCiString = this.getInputCiString("instance", dcInstanceID);
        this._inputCiListString = inputCiString + '';
        this._maintenanceStartDateTimeStringInUTC = startDateTimeInUTC + '';
        this._maintenanceEndDateTimeStringInUTC = endDateTimeInUTC + '';

        // Retry for 3 times if status is not 200      

        for (var i = 0; i < 3; ++i) {
            this._responseObj = this._requestToGetConflictsRest();

            if (this._responseObj.stcdResult.responseStatus == 0) // Socket Timeout
                break;
            if ((this._responseObj.stcdResult.responseStatus < 200) || (this._responseObj.stcdResult.responseStatus > 299)) {
                gs.debug("requestToGetConflictsRest failed : " + this._responseObj.stcdResult.errorMessage);
                continue;
            } else
                break;
        }
        gs.debug("requestToGetConflictsRest return obj is : " + JSON.stringify(this._responseObj, 4, ''));
        return this._responseObj;
    },

    type: 'DCCalendarRestEndPoint'
};
