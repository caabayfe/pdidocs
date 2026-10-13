var NNMIEvents_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var encoder = new JSON();

var SOURCE = "NNMi",
    // By default the service now limit for the events is 3000
    // but because of the API limitations(NNMi) we need to collect everything and then
    // to filter the data, so in the end to cut only 3K events.
    LIMIT = 100000,
    snLimit = 3000,
    errorMessage = "",
    LAST_EVENT = "",
    isDebug = false,
    eventUrl,
    // Need this flag, because the response from the test connection is html
    // and needs different parsing
    isTestConnection = false,
    eventCounter = 0,
    isInitialized = false;

NNMIEvents_JS.prototype = Object.extendsObject(AProbe, {

    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     NNMi is active and running. This is done by probing the NNMi API for it's own version.
     Cases that the function follows are:
     - NNMi API is running and returns status code 200 is OK
     - NNMi API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response is FAILURE
     */
    testConnection: function () {
        ms.log("*** NNMi CONNECTOR : TEST CONNECTION ***");
        var retVal = {}; //return object for the function
        isTestConnection = true;
        try {
            var testConn = this.getResult("/IncidentBeanService/IncidentBean", {
                constraints: [{name: "maxObjects", value: 1}]
            });

            if (!!testConn) {
                ms.log("INFO | TEST DATA:" + JSON.stringify(testConn));
                //retVal['last_event'] = "0";
            }
            
        } catch (e) {
            ms.log(e.toString());
            this.addError(e.toString());
            retVal["status"] = FAILURE.toString();
        }
        
        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        return retVal;
    },

    /**
     * Function that the MID server uses to RUN the script. Main logic lies here.
     * This is the code that the MID Server will run on each Iteraation.
     * @returns An Object with specific associated Script return values [status,last_event]
     */
    execute: function () {
        var retVal = {};
        ms.log("***** NNMi CONNECTOR EXECUTE GET EVENTS! *****");
        var startScriptTime = new Date();
        isDebug = "" + this.probe.getAdditionalParameter("debug");
        LAST_EVENT = this.getLastEventSignature();
        var NNMi = this.getNNMiEvents();

        var emsName = this.probe.getParameter("connector_name");

        this.createSNEvents(NNMi, emsName);

        // Update last_event signature with the newest timestamp
        this.updateLastSignature(NNMi, retVal);

        // Only use LAST_EVENT as fallback if updateLastSignature didn't set it
        if (!retVal["last_event"] && errorMessage.length === 0) {
            retVal["last_event"] = LAST_EVENT.toString();
        } else if (errorMessage.length > 0) {
            // Errors occurred - do NOT update last_event
            ms.log("*** Errors occurred - NOT updating last_event to allow re-initialization ***");
        }


        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        if(eventCounter > 0) {
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);

            ms.log(SOURCE + ": EventCollector handle total of " + eventCounter + " events in " + 
            totalDurationSec + " seconds (" + Number(eventCounter/totalDurationSec).toFixed(3) + " per second)");
        } else {
            ms.log(SOURCE + ": NO NEW EVENTS");
        }

        ms.log("***** NNMi CONNECTOR FINISH *****");

        return retVal;
    },

    /**
     * Collects all New Events
     * @returns {Array} [...] with all the Events
     */
    getNNMiEvents: function() {
        var response, startTimeDate;
        var params = {};
        startTimeDate = LAST_EVENT;

        params["constraints"] = [{name: "includeCias", value: true},
                                {name: "maxObjects", value: LIMIT}];

        params["conditions"] =  [{name: "modified", value: startTimeDate, operator: "GT"}];
        // On the initial run of the script we are skipping 
        // the events with lifecycleState Closed.
        // On all the others iterations of the script we are collecting them
        // but setting resolutionState to 'Closing' if the severity of the event
        // is 'NORMAL' or if the lifecycleState is 'Closed'.
        if(!isInitialized) {
            params["conditions"].push({name: "lifecycleState", value: "com.hp.nms.incident.lifecycle.Closed", operator: "NE"});
        }

        response = this.getResult("/IncidentBeanService/IncidentBean", params);



        // ========== CLIENT-SIDE FILTER ==========
        var cutoffMs = parseInt(startTimeDate);
        var filteredResponse = [];
        for (var i = 0; i < response.length; i++) {
            var event = response[i];
            var eventModified = event["modified"];

            if (eventModified) {
                var eventMs = this.parseDate(eventModified).getTime();

                // Only include events NEWER than cutoff
                if (eventMs > cutoffMs) {
                    filteredResponse.push(event);
                } else {
                    ms.log("*** FILTERED OUT - Event[" + i + "] modified: " + eventModified + " (" + eventMs + ") is older than cutoff");
                }
            }
        }

        response = filteredResponse;

        // **ALWAYS sort by modified time (ASC: oldest → newest)
        if (response.length > 0) {
            response = response.sort(this.compare.bind(this));
        }

        if (response.length > snLimit) {
            if(isInitialized) {
                // If we are on scheduled run we cut the events from oldest till 3000(snLimit)
                response = response.splice(0, snLimit);
            } else {
                // If we are on initial run of the script(first run or no last time from event in 
                // last_event) we are cutting the newest(latest) events. Only for the initial run
                response = response.splice(response.length - snLimit, response.length);
            }
        }

        return response;
    },

    /**
     * We have objects(events) with attribute 'modified' which we need to 
     * sort ASC order so we can splice(cut) the events if we have more than the LIMIT(3K for service now)
     */
    compare: function(a,b) {
        var eventTimeA = "" + a["modified"];
        // We are receiving this google format 2017-07-28T04:42:47.569-07:00
        var eventTimeParsedA = this.parseDate(eventTimeA);
        var eventTimeStampA = eventTimeParsedA.getTime();

        var eventTimeB = "" + b["modified"];
        // We are receiving this google format 2017-07-28T04:42:47.569-07:00
        var eventTimeParsedB = this.parseDate(eventTimeB);
        var eventTimeStampB = eventTimeParsedB.getTime();


      if (eventTimeStampA < eventTimeStampB) {
        return -1;
      }
      if (eventTimeStampA > eventTimeStampB) {
        return 1;
      }
      return 0;
    },

    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Array} collectedData - Array of collected Events/Alerts with all the info
     * @param {String} emsName - The name of the connector
     */
    createSNEvents: function (collectedData, emsName) {
        var sender = SNEventSenderProvider.getEventSender();
        var snEvents = [];

		collectedData.forEach(function(event) {
            var sEvent = Event();
            var eventTimeStamp, description, resource, stateType, eventType, serviceDescription, state, lifecycleState, node, metricName, eventSeverity, resolutionState;

            lifecycleState = "" + event["lifecycleState"];
            if((lifecycleState) && (lifecycleState != "")) {
                var lifecycleStateArr = lifecycleState.split(".");
                lifecycleState = lifecycleStateArr[lifecycleStateArr.length-1];
            }

            PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

            resource = "" + event["sourceName"];
            node = "" + event["sourceNodeName"];
            eventType = "" + event["category"];
            if((eventType) && (eventType != "")) {
                var eventTypeArr = eventType.split(".");
                eventType = eventTypeArr[eventTypeArr.length-1];
            }

            eventSeverity = "" + event["severity"];
			if(((lifecycleState) && (lifecycleState == "Closed")) || ((eventSeverity) && (eventSeverity == "NORMAL"))) {
                resolutionState = "Closing";
			} else {
                resolutionState = "New";
			}
            description = "" + event["formattedMessage"];
            metricName = "" + event["name"];

            var eventTime = "" + event["modified"];
            // We are receiving this google format 2017-07-28T04:42:47.569-07:00

            var eventTimeParsed = this.parseDate(eventTime);
					if (eventTimeParsed) {
						eventTimeStamp = eventTimeParsed.getTime();
					}
            
            sEvent.setHostAddress(node);
            sEvent.setType(eventType);
            sEvent.setResource(resource);
            sEvent.setSeverity(this.getSeverity(eventSeverity));
            sEvent.setResolutionState(resolutionState);
            sEvent.setTimeOfEvent(this.getDate(parseInt(eventTimeStamp)));
            sEvent.setText(description);
            sEvent.setMessageKey(this.setMessageKey(event));
            sEvent.setEmsSystem(emsName);
            sEvent.setSource(SOURCE);
            sEvent.setMetricName(metricName);

            checkList = ["sourceNodeName", "category", "sourceName", "severity", "formattedMessage", "name", "modified"]; 
            // Adding all the other attributes into the additional info field
            for(var attribute in event) {
                attribute += "";
                if((checkList) && (checkList.indexOf(attribute) <= -1)) {
                    if(attribute == "cias") {
                        if(event["cias"].hasOwnProperty("length")) {
                            event["cias"].forEach(function(obj) {
                                var key = obj["name"];
                                var valueValue = obj["value"];
                                this.eventSetProperty(sEvent, key, valueValue);
                            },this);
                        } else {
                            var key = event[attribute]["name"];
                            var valueValue = event[attribute]["value"];
                            this.eventSetProperty(sEvent, key, valueValue);
                        }
                    } else {
                        this.eventSetProperty(sEvent, attribute, event[attribute]);
                    }
                }
            }

            this.eventSetProperty(sEvent, "url", eventUrl);
			snEvents.push(sEvent);

        }, this);
        // STRY54854858: populate connector tags in event additional info
        // Connector tags are in json string format and needs to be parsed. To avoid parsing json string for each event,
        // stored all events in list first, called api to set tags (involve json parsing) and then iterate over the event list to send the event.
        new ConnectorUtil().populateFieldInEvents(snEvents, {'connector_tags':this.probe.getParameter('connector_tags')}); 
        for(var i in snEvents) {
            try {
                sender.sendEvent(snEvents[i]);
                this.debug("sEvent sent: " + snEvents[i]);

            }catch(e) {
                ms.log(e.toString());
                this.addError(e.toString());
            }
            eventCounter++;
            }
		
    },
    /**
     * Concatenates the needed info for the message keys
     *
     * @param event - The Object from where we took the attritributes for concatenating
     * @returns {String} result
     */
    setMessageKey: function(event) {
        var result = "";
        var sourceNodeName, sourceName, category, categoryArr;

        if((event) && (event.hasOwnProperty("sourceNodeName"))) {
            sourceNodeName = "" + event["sourceNodeName"];
        }

        if((event) && (event.hasOwnProperty("sourceName"))) {
            sourceName = "" + event["sourceName"];
        }

        if((sourceNodeName) && (sourceNodeName == sourceName)) {
            result += sourceNodeName;
        } else {
            result += sourceNodeName;
            result += "_" + sourceName;
        }

        if((event) && (event.hasOwnProperty("category"))) {
            category = "" + event["category"];
            categoryArr = category.split(".");
            category = categoryArr[categoryArr.length-1];
            result += "_" + category;
        }

        if((event) && (event.hasOwnProperty("name"))) {
            result += "_" + event["name"];
        }

        return result;
    },

    /**
     * Getting lastEventSignature. If lastEventSignature is empty, we init it
     * from the current (date - days_from) where days_from is additional param from the user
     *
     * @returns {String} lasteventSignature
     */
    getLastEventSignature: function() {
        // timestamp for testing purposes 1499063616000
        var lastEventSignature = "" + this.probe.getParameter("last_event");
        // Just to be on the safe side
        if(lastEventSignature == null || lastEventSignature == "null") {
            lastEventSignature = 0;
        }

        // Only for the initializing of lastEventSignature
        if(lastEventSignature == 0) {
            var now;
            var daysFrom = this.probe.getAdditionalParameter("days_from") || 7 ;

            now =  new Date();
            now.setDate(now.getDate() - parseInt(daysFrom));

            // lastEventSignature is empty, we will start to retrieved from now
            // which is filtered by days_from param
            lastEventSignature =  now.getTime();
            ms.log(SOURCE + ": EventConnector: last_event was empty. Initializing...lastEventSignature: " + lastEventSignature);
        }
        else {
            isInitialized = true;
            lastEventSignature = lastEventSignature;
            ms.log(SOURCE + ": EventConnector: last_event was as expected. Starting the fetch from " + lastEventSignature);
        }

        return lastEventSignature + "";
    },

    /**
     * Function to parse a Epoch time timestamp to a String formatted date.
     * @param timestamp - Integer time value to be parsed and arranged into string value
     * @returns {String} Returns String formatted date
     */
    getDate: function(timestamp){
        if(timestamp) {
            if(timestamp.toString().length == 10) {
                timestamp = parseInt(timestamp) * 1000;
            } 
            else if(timestamp.toString().length > 10) {
                timestamp = parseInt(timestamp);
            }
            else {
                ms.log(SOURCE + ": Invalid timestamp format in getDate function --> " + timestamp);
            }
        }

        var d = new Date(timestamp);
        // yyyy-MM-dd HH:mm:ss

        var year = "" + d.getUTCFullYear();
        var month = "" + (d.getUTCMonth() + 1); if (month.length == 1) { month = "0" + month; }

        var day = "" + d.getUTCDate(); if (day.length == 1) { day = "0" + day; }

        var hour = "" + d.getUTCHours(); if (hour.length == 1) { hour = "0" + hour; }

        var minute = "" + d.getUTCMinutes(); if (minute.length == 1) { minute = "0" + minute; }

        var second = "" + d.getUTCSeconds(); if (second.length == 1) { second = "0" + second; }
        return (year + '-' + month + '-' +  day + ' ' + hour + ':' + minute + ':' + second);
    },

    /**
     * Parsing the google date format string to date object
     * @param date - event object with params
     * @returns {Date} Returns String formatted date
     */
    parseDate: function(date){
        var googleDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?([+-]\d{2}:\d{2}|Z)?$/;

        var m = googleDate.exec(date);

        if (!m) {
            return null;
        }

        var year = parseFloat(m[1]);
        var month = parseFloat(m[2]);
        var day = parseFloat(m[3]);
        var hour = parseFloat(m[4]);
        var minute = parseFloat(m[5]);
        var second = parseFloat(m[6]);
        var msec = parseFloat(m[8]) || 0;

        var retDate = new Date();
        retDate.setUTCFullYear(year);
        retDate.setUTCMonth(month - 1);
        retDate.setUTCDate(day);
        retDate.setUTCHours(hour);
        retDate.setUTCMinutes(minute);
        retDate.setUTCSeconds(second);
        retDate.setUTCMilliseconds(msec);

        // Handle offset
        var offset = m[9];
        if (offset && offset !== "Z") {
            var offset_sign = offset[0];
            var offset_hours = parseFloat(offset.substr(1, 2)) || 0;
            var offset_minutes = parseFloat(offset.substr(4, 2)) || 0;

            if (offset_sign === "+") {
                retDate.setUTCHours(retDate.getUTCHours() - offset_hours);
                retDate.setUTCMinutes(retDate.getUTCMinutes() - offset_minutes);
            } else if (offset_sign === "-") {
                retDate.setUTCHours(retDate.getUTCHours() + offset_hours);
                retDate.setUTCMinutes(retDate.getUTCMinutes() + offset_minutes);
            }
        }

        // if offset is Z, it's already UTC, no changes needed
        return retDate;
    },

    /**
     * Function for checking whether to set a certian property for the SNow Event creation.
     * @param event - SNow Event object
     * @param key - The key to which the additional field will be set
     * @param value - The value to be set on that key
     */
    eventSetProperty: function(event,key,value){
        if(!!value && value.length >= 1){
            event.setField("u_" + key, value);
        }
        return event;
    },

    /**
     * Function for returning a mapped value for the events
     *
     * @param key the value from NNMi data
     * @returns {*} Returns the associated map value
     */
    getSeverity: function(key){
        var severity = {
            "NORMAL": 5,
            "WARNING": 4,
            "MINOR": 3,
            "MAJOR": 2,
            "CRITICAL": 1,
        };

        if((severity) && (severity.hasOwnProperty(key))) {
            return severity[key];
        } else {
            ms.log(SOURCE + ": Wrong severity. There is no mapping for this key: " + key);
        }  

        return "";
    },

    /**
     * Just call the createRequest function and check if the request is valid
     *
     * @param method - the URI of the request
     * @param params - the parameters of the request.
     *
     * @returns {Object} The request in JSON format
     */
    getResult : function (method, params) {
        var req = this.createRequest(method, params);
        if(!!req){
            var response = req.getBody();
            var result = this.normalizeObjects(response);
            return result;
        }
        return [];
    },

    /**
     * Function for generating and executing automatically a REST request with a SET body object
     * @param body An JS object with the request params needed.
     * @returns Java object with the response.
     */
    createRequest: function (method, params) {
        var response, body;
        var host = this.probe.getParameter("host"); //get host url from SNow
        // Hardcoded because NNMi API cannot work with encoded URI if the protocol is http
        var protocol = this.probe.getAdditionalParameter("protocol") || "http"; 
        var port = this.probe.getAdditionalParameter("port") || 80; //get the set port from the SNow Connector Definition Instance
        var username = this.probe.getParameter("username") || "";
        var password = this.probe.getParameter("password") || "";
        port = (port == 80 ? "" : (":" + port));
        var url = protocol + "://" + host + port + method; // Build the url for the request
        // Need this url for the additional info of the events
        eventUrl = protocol + "://" + host + port;
        var query = this.getQueryBody(params);

        // Work-around for the square brackets
        url = encodeURI(url);
        this.debug("URL:" + url);
        this.debug("QUERY: " + query);

        var request = new HTTPRequest(url);

        request.setBasicAuth(username, password);
        request.addHeader("Content-Type", "text/xml;charset=UTF-8");
        request.addHeader("SOAPAction", "");

        try {
            var response = request.post(query);
            var status = response.getStatusCode();
            if (status === 200) {
                return response;
            } else {
                this.addError("RESPONSE STATUS ERROR No: " + status);
                this.addError("RESPONSE ERROR : " + response.getBody());
                return false;
            }
        }
        catch (e) {
            this.addError(e.toString());
        }
    },

    /**
     * Call the setQuery function
     *
     * @param params - the parameters of the request.
     *
     * @returns {String}
     */
    getQueryBody: function (params) {
        
        var bodyStart = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\nxmlns:inc="http://incident.sdk.nms.ov.hp.com/">\n' + '<soapenv:Header/>\n<soapenv:Body>\n<inc:getIncidents>\n';
        var methodStart = '<arg0 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n         xmlns:ns3="http://filter.sdk.nms.ov.hp.com/"\nxsi:type="ns3:expression">\n<operator>AND</operator>\n';
        var methodEnd = '</arg0>\n';
        var bodyEnd = '</inc:getIncidents>\n</soapenv:Body>\n</soapenv:Envelope>\n';
        var bodyParams = '';
        var requestBody = '';

            if(params.hasOwnProperty("constraints")) {
                params.constraints.forEach(function(obj) {
                    bodyParams += '<subFilters xsi:type="ns3:constraint">\n' + 
                    '<name>' + obj.name + '</name>\n' + 
                    '<value>' + obj.value + '</value>\n' + '</subFilters>\n';
                }, this);
            }

            if(params.hasOwnProperty("conditions")) {
                params.conditions.forEach(function(obj) {
                    bodyParams += '<subFilters xsi:type="ns3:condition">\n' + 
                    '<name>' + obj.name + '</name>\n' + 
                    '<operator>' + obj.operator + '</operator>\n' +
                    '<value>' + obj.value + '</value>\n' + '</subFilters>\n';
                }, this);
            }

        requestBody = bodyStart + methodStart + bodyParams + methodEnd + bodyEnd;
        
        return requestBody;
    },
    /**
     * We are parsing the response to xml format and then to JSON
     *
     * @param response
     *
     * @returns {Array} array of objects with all the events info
     */
    normalizeObjects: function(response) {
        try {
            var xmlObj = new XMLHelper(response.toString());
            xmlObj = xmlObj.toObject();

            // Check for both possible namespace prefixes
            var body = xmlObj["env:Body"] || xmlObj["soap:Body"];
            if (!xmlObj || !body) {
                ms.log("ERROR: Invalid XML response - missing Body element");
                ms.log("Response was: " + response.toString().substring(0, 500));
                return [];
            }

            // Check for both possible response element names
            var incidentsResponse = body["inc:getIncidentsResponse"] || body["ns1:getIncidentsResponse"];
            if (!incidentsResponse) {
                ms.log("ERROR: Invalid XML response - missing getIncidentsResponse");
                ms.log("Response was: " + response.toString().substring(0, 500));
                return [];
            }

            var returnObj = incidentsResponse["return"];
            var events = [];
            var result = [];

            if (!returnObj) {
                ms.log("WARNING: No return object in response");
                return [];
            }

            for (var item in returnObj) {
                events = returnObj[item];
            }

            if(Object.prototype.toString.call(events) == "[object Array]") {
                result = events;
            } else if(Object.prototype.toString.call(events) == "[object Object]"){
                result.push(events);
            }

            return result;
        } catch (e) {
            ms.log("ERROR in normalizeObjects: " + e.toString());
            this.addError("Failed to parse NNMi response: " + e.toString());
            return [];
        }
    },

    /**
     * Updates the last event signature based on the newest event's timestamp
     * @param collectedData - Array of event objects
     * @param retVal - Return value object to update
     */
    updateLastSignature: function(collectedData, retVal) {

        if (collectedData && collectedData.length > 0) {
            // Since events are already sorted ASC (oldest → newest),

            var lastEvent = collectedData[collectedData.length - 1];
            var lastModified = lastEvent["modified"];
            var newestTimestampMs = this.parseDate(lastModified).getTime();

            ms.log("Newest event timestamp: " + lastModified + " (" + newestTimestampMs + ")");
            retVal['last_event'] = newestTimestampMs.toString();
        } else {
            ms.log("*** UPDATE LAST SIGNATURE - No events to process ***");
        }
    },

    /**
     * Concatenating a message to errorMessage variable
     *
     * @param message
     */
    addError: function (message) {
        if (errorMessage === "")
            errorMessage = message;
        else
            errorMessage += "\n" + message;
        ms.log("**** NNMiJS ERROR: "+message);
    },

    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message){
        if (isDebug == true || isDebug == "true"){
            ms.log(SOURCE + ": " + message);
        }
        return true;
    },

    type: "NNMIEvents_JS"
});
