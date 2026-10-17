var Op5Events_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var encoder = new JSON();

var SOURCE = "Op5",
    LIMIT = 3000,
    errorMessage = "",
    LAST_SIGNATURE = "",
    LAST_EVENT_ID = "",
    LAST_EVENT_TIME = "",
    isDebug = false,
    islogPayloadForDebug = false,
    // The API of Op5 is limited to retrieve maximum 1000 records of data
    // so we need to make additional calls to collect the all the records till out limit of 3000
    collectedEvents = [],
    eventCounter = 0,
    isInitialized = false;

Op5Events_JS.prototype = Object.extendsObject(AProbe, {

    initDebugFlags: function () {

        var debug = this.probe.getAdditionalParameter("debug");
        var logPayloadForDebug = this.probe.getAdditionalParameter("logPayloadForDebug");

        if (debug == "true" ||  debug == "1")
            isDebug = true;
        
        if (logPayloadForDebug == "true" || logPayloadForDebug == "1")
            islogPayloadForDebug = true;

    },

    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     Op5 is active and running. This is done by probing the Op5 API for it's own version.
     Cases that the function follows are:
     - Op5 API is running and returns status code 200 -> OK
     - Op5 API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection: function () {
        
        // Initialize isDebug and isLogPayloadForDebug variable based on the connector instace values
        this.initDebugFlags();

        this.debug("*** TEST CONNECTION START ***");

        var retVal = {}; //return object for the function
        var now =  new Date();
        var startTimeDate =  this.timestampWithoutMiliseconds(now.getTime());

        try {
            var testConn = this.getResult("GET", "/api/report/event", {
                startTime: startTimeDate
            });

            if (!!testConn) {
                this.logPayload("TEST DATA: "+JSON.stringify(testConn));
            } else {
                throw "Test connection data is null or empty.";
            }
            
        } catch (e) {
            this.addError(SOURCE + ": Test connection failed. Please double check your port, protocol and URL!");
            this.addError(e.toString());
            this.logit("ERROR | "+errorMessage);
            retVal["status"] = FAILURE.toString();
        }
        
        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        this.logit("TEST CONNECTION STATUS: "+retVal["status"]);

        this.debug("*** TEST CONNECTION END ***");

        return retVal;
    },

    /**
     * Function that the MID server uses to RUN the script. Main logic lies here.
     * This is the code that the MID Server will run on each Iteraation.
     * @returns An Object with specidfic associated Script return values [status,last_event]
     */
    execute: function () {

        // Initialize isDebug and isLogPayloadForDebug variable based on the connector instace values
        this.initDebugFlags();

        this.debug("***** CONNECTOR EXECUTE GET EVENTS STARTS! *****");

        var retVal = {};
        
        var startScriptTime = new Date();
        
        // LAST_SIGNATURE contains only the time stamp on the INITIAL RUN
        // and on every next run we are storing the ID as 1st element and timestamp as 2nd
        LAST_SIGNATURE = this.getLastEventSignature();

        if(!isInitialized) {
            //Initial run where we don't have stored ID
            LAST_EVENT_TIME = LAST_SIGNATURE;
        } else {
            LAST_EVENT_ID = LAST_SIGNATURE[0];
            LAST_EVENT_TIME = LAST_SIGNATURE[1];
        }

        var op5Events = this.getOp5Events();
        this.debug("Op5EVENTS LENGTH: " + op5Events.length);

        if(op5Events.length > 0) {
            var emsName = this.probe.getParameter("connector_name");
            var allHostsInfo = this.getHostsInfo();
            var allServicesInfo = this.getServicesInfo();
            var allInfoMerged = this.mergeEventsWithInfo(op5Events, allHostsInfo, allServicesInfo);

            this.debug("All Host Info Length: "+allHostsInfo.length);
            this.debug("All Services Info Length: "+allServicesInfo.length);
            this.debug("Merged Info Length: "+allInfoMerged.length);

            this.createSNEvents(allInfoMerged, emsName);
        }


        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
            this.logit("ERROR | "+errorMessage);
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        if(eventCounter > 0) {
            retVal["last_event"] = LAST_EVENT_ID + "," + (LAST_EVENT_TIME * 1000);
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);

            this.logit("EventCollector handle total of " + eventCounter + " events in " + 
            totalDurationSec + " seconds (" + Number(eventCounter/totalDurationSec).toFixed(3) + " per second)");
        }

        this.debug("*** CONNECTOR EXECUTE GET EVENTS ENDS! ***");

        return retVal;
    },

    /**
     * Collects all New Events
     * @returns {Array} [...] with all the Events
     */
    getOp5Events: function() {
        var response, startTimeDate, responseDateLength, stateTypes, availableTypes, params;
        startTimeDate = LAST_EVENT_TIME;

        params = {
            startTime: startTimeDate
        };

        availableTypes = ["hard", "soft"];
        stateTypes = "" + this.probe.getAdditionalParameter("state_types");

        if(availableTypes.indexOf(stateTypes) > -1) {
            params["stateTypes"] = stateTypes;
        }

        response = this.getResult("GET", "/api/report/event", params);

        responseDateLength = response["data"].length;

        response["data"].forEach(function(obj) {
            collectedEvents.push(obj);
        }, this);
        // If we are on initial run(first where we don't have last event time)
        // We need to collect all the events rather the limit of the API which is 1000
        // this is because we can't flip the order of the events which is by default ASC
        if(!isInitialized && responseDateLength == 1000) {
            // the limit of the API
            var offsetNum = 1000;
            // the counter with which we are going to increase the offset
            // for every new iteration(by multiplying)
            var counter = 1;
            var currentTimeTimestamp = this.timestampWithoutMiliseconds(new Date().getTime());
            var responseLength;
            while(true) {
                // getOp5EventsAdditionalRequest returns the length of the response
                responseLength = this.getOp5EventsAdditionalRequest(currentTimeTimestamp, startTimeDate, (offsetNum * counter));
                // Leaving the loop if we took all the events till the current time
                if(responseLength < 1000) {
                    break;
                }

                counter++;
            }

            collectedEvents = collectedEvents.splice(collectedEvents.length - 3000, collectedEvents.length);

        } else { // Schedule runs
            if(responseDateLength == 1000) {
                var currentTimeTimestamp = this.timestampWithoutMiliseconds(new Date().getTime());
                // taking the time from the last event of the array,
                // because they are ordered ASC
                this.getOp5EventsAdditionalRequest(currentTimeTimestamp, startTimeDate, 1000);
                // The limit of service now events is set to 3000, so this will be 
                // the last additional request for retrieving events
                if(collectedEvents.length == 2000) {
                    // taking the time from the last event of the array,
                    // because they are ordered ASC
                    this.getOp5EventsAdditionalRequest(currentTimeTimestamp, startTimeDate, 2000);
                }
            }
        }

        return collectedEvents;
    },

    /**
     * We are storing in the 'last_event' param both, id and the time of the last event,
     * so we need to split them for further usage
     *
     * @param lastEventSignature - csv string which holds the id and the time of the last event
     *
     * @returns {Array} [...] Array with the id value of the event and the time of the same event
     */
    splitLastEventSignature: function(lastEventSignature) {
        var result = [];

        if(lastEventSignature != "null" && lastEventSignature != null && lastEventSignature != "") {
            var result = lastEventSignature.split(",")
                        .map(function(el) {
                            return el.trim();
                        }, this);
        }


        return result;
    },

    /**
     * If the data collected from the first call in getOp5Events function is equal to the API limit(1000)
     * We are making additional calls to collect the other events which left till 3000, if there are some(which is snow limit for events per itteration)
     * or if the next response length of the data is less than 1000(this way we know there is no more events for the current iteration)
     * Here in this request we are using endTime param which is the current time taken after the getOp5Events returns 1000 events. 
     *
     * @param currentTime - current time in timestamp format limited till seconds(so the length of the timestamp will be 10)
     * @param startTimeDate - we are still starting the request with the same start time but on every run we
     * put offset param to skip 1000 events forward
     *
     * @returns {Array} [...] Array with events
     */
    getOp5EventsAdditionalRequest: function(currentTime, startTimeDate, offsetNum){
        var response, endTime;

        response = this.getResult("GET", "/api/report/event", {
            startTime: startTimeDate,
            endTime: currentTime,
            offset: offsetNum
        });

        response["data"].forEach(function(obj) {
            collectedEvents.push(obj);
        }, this);

        return response["data"].length;
    },

    /**
     * Collects all the info for the hosts which will be filtered on later stage
     * @returns {Array} [...] with all the additional info for hosts
     */
    getHostsInfo: function(){
        var response;

        response = this.getResult("GET", "/api/filter/query", {
            query: "[hosts]all",
            columns: ["address", "groups", "is_flapping", "first_group", "display_name", "config_url"],
            limit: 1000000
        });

        //Array of objects
        return response;
    },

    /**
     * Collects all the info for the services which will be filtered on later stage
     * @returns {Array} [...] with all the additional info for services
     */
    getServicesInfo: function(){
        var response;

        response = this.getResult("GET", "/api/filter/query", {
            query: "[services]all",
            columns: ["config_url", "check_command", "check_source", "description", "display_name", "flap_detection_enabled", "is_flapping", "long_plugin_output", "notes", "notes_url", "source_node", "source_type", "readable_name"],
            limit: 1000000
        });

        //Array of objects
        return response;
    },


    /**
     * Concatenates the data from both requests which we were made for sevices and hosts info
     * with the events data.
     * if the service_description attribute is empty, that means the event is for host, otherwise
     * it's for service
     *
     * @param Op5Events - Array of objects with events
     * @param hostInfo - Array of objects with addintional info for the hosts
     * @param serviceInfo - Array of objects with addintional info for the services
     *
     * @returns {Array} Array of objects. Op5Events objects merged with their serviceInfo
     */
    mergeEventsWithInfo: function(op5Events, hostInfo, serviceInfo) {
        hostInfo.forEach(function(elementInfo) {
            var displayName = "" + elementInfo["display_name"];
            op5Events.forEach(function(element) {
                if(element["host_name"] == displayName && element["service_description"] == "") {
                    for(var prop in elementInfo) {
                        if(prop != "state") {
                            element[prop] = elementInfo[prop];
                        }
                    }
                }
            }, this);
        }, this);

        serviceInfo.forEach(function(elementInfo) {
            op5Events.forEach(function(element) {
                var uniqueHostAndService = "" + element["host_name"] + " \\/ " + element["service_description"];
                var readableName = "" + elementInfo["readable_name"];
                if(uniqueHostAndService == readableName && element["service_description"] != "") {
                    for(var prop in elementInfo) {
                        element[prop] = elementInfo[prop];
                    }
                }
            }, this);
        }, this);

        return op5Events;
    },

    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Array} collectedData - Array of collected Events/Alerts with all the info
     * @param {String} emsName - The name of the connector
     */
    createSNEvents: function (collectedData, emsName) {
        var sender = SNEventSenderProvider.getEventSender();

        collectedData.forEach(function(event) {
            var sEvent = Event();
            var eventTimeStamp, identifier, description, resource, stateType, metricName, 
            isHard, eventType, serviceDescription, state, hostName, severity, resolutionState;
            serviceDescription = "" + event["service_description"];
            state = "" + event["state"];
            hostName = "" + event["host_name"];
            isHard = "" + event["hard"];
            eventTimeStamp = event["timestamp"];

            PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

            if(isInitialized) {
                // We don't want to collect same event from the previous run so
                // here we are checking on ID and the time of the event, and if 
                // they are the same we are skipping this event
                if(LAST_EVENT_ID == event["id"].toString() && LAST_EVENT_TIME == eventTimeStamp) {
                    return;
                }
            }

            if(isHard == "0") {
                stateType = "soft";
            } else if (isHard == "1") {
                stateType = "hard";
            } else {
                this.logit("Ivalid stateType in createSNEvents function. Please check!");
            }

            eventType = "" + event["event_type"] + ", " + stateType;
            metricName = serviceDescription;
            // Host events
            if(serviceDescription == "") {
                resource = hostName;
                description = "" + event["output"];
                identifier = "host";
                // Additional info
                this.eventSetProperty(sEvent,"address", event["address"]);
                this.eventSetProperty(sEvent,"groups", event["groups"]);
                this.eventSetProperty(sEvent,"is_flapping_host", event["is_flapping"]);
                this.eventSetProperty(sEvent,"first_group", event["first_group"]);
                this.eventSetProperty(sEvent,"config_url_host", event["config_url"]);
            // Service events
            } else {
                resource = "";
                description = "" + event["output"] + ", " + event["long_plugin_output"];
                identifier = "service";
                // Additional info
                this.eventSetProperty(sEvent,"check_command", event["check_command"]);
                this.eventSetProperty(sEvent,"check_source", event["check_source"]);
                this.eventSetProperty(sEvent,"description", event["description"]);
                this.eventSetProperty(sEvent,"display_name", event["display_name"]);
                this.eventSetProperty(sEvent,"flap_detection_enabled", event["flap_detection_enabled"]);
                this.eventSetProperty(sEvent,"is_flapping_service", event["is_flapping"]);
                this.eventSetProperty(sEvent,"notes", event["notes"]);
                this.eventSetProperty(sEvent,"notes_url", event["notes_url"]);
                this.eventSetProperty(sEvent,"source_node", event["source_node"]);
                this.eventSetProperty(sEvent,"source_type", event["source_type"]);
                this.eventSetProperty(sEvent,"config_url_service", event["config_url"]);
                this.eventSetProperty(sEvent,"readable_name", event["readable_name"]);
            }
            // For all types
            this.eventSetProperty(sEvent,"service_description", event["service_description"]);
            
            severity = this.getSeverity(state, identifier);

            // The monitoring tool has no lifecycle of it's events. This means that 
            // every time a change is detected by the system, a new event is generated. 
            // Events are closed based on ServiceNow severity – in this case "info" is the 
            // trigger for the closure of the resolution state.
            // We are setting resolution state to 'New' for all non-info severities
            // (snow info severity is '5'). If the event severity is info we are setting 
            // the resolutionState to 'Closing'.
            if(severity == 5) {
                resolutionState = "Closing";
            } else {
                resolutionState = "New";
            }

            sEvent.setHostAddress(event["host_name"]);
            sEvent.setType(eventType);
            sEvent.setResource(resource);
            sEvent.setSeverity(severity);
            sEvent.setResolutionState(resolutionState);
            sEvent.setTimeOfEvent(this.getDate(parseInt(event["timestamp"])));
            sEvent.setText(description);
            sEvent.setMessageKey(this.setMessageKey(event));
            sEvent.setEmsSystem(emsName);
            sEvent.setSource(SOURCE);
            sEvent.setMetricName(metricName);


            if(parseInt(eventTimeStamp) > parseInt(LAST_EVENT_TIME)) {
                LAST_EVENT_TIME = eventTimeStamp;
                LAST_EVENT_ID = event["id"].toString();
            }

            try {
                sender.sendEvent(sEvent);
                this.logPayload("Event Object Created : "+sEvent);
            } 
            catch (e) {
                this.logit(e.toString());
                this.addError(e.toString());
            }

            eventCounter++;

        }, this);
    },
    /**
     * Concatenates host_name and service_description from the event object to set the MessageKey
     *
     * @param event - The Object from where we took the attritributes for concatenating
     * @returns {String} result
     */
    setMessageKey: function(event) {
        var result = "op5";

        if(event.hasOwnProperty("host_name")) {
            result += "_" + event["host_name"];
        }

        if(event.hasOwnProperty("service_description")) {
            result += "_" + event["service_description"];
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
        // timestamp for testing purposes 1499063616
        var lastEventSignature = "" + this.probe.getParameter("last_event");
        // Just to be on the safe side
        if(lastEventSignature == null || lastEventSignature == "null") {
            lastEventSignature = 0;
        } else {
            // Here 'lastEventSignature' become array (first el is the ID and second is the time)
            lastEventSignature = this.splitLastEventSignature(lastEventSignature);
        }

        // Only for the initializing of lastEventSignature
        if(lastEventSignature == 0) {
            var now;
            var daysFrom = this.probe.getAdditionalParameter("days_from") || 7 ;

            // To be on the safe side we are checking if the daysFrom parameter is reasonable days (range 0 - 100)
            // if we are out of these limits setting the parameter to default value which is 7 days
            if(((parseInt(daysFrom, 10) != 7) && (parseInt(daysFrom, 10) > 100 || parseInt(daysFrom, 10) <= 0)) || isNaN(parseInt(daysFrom, 10))) {
                daysFrom = 7;
                this.logit("Connector parameter 'days_from' is a out of range(0-100) or invalid. Set default value to collect events from a week earlier (7 days).");
            }

            now =  new Date();
            now.setDate(now.getDate() - parseInt(daysFrom));

            // lastEventSignature is empty, we will start to retrieved from now
            // which is filtered by days_from param
            lastEventSignature =  this.timestampWithoutMiliseconds(now.getTime());
            this.debug("EventConnector: last_event was empty. Initializing...lastEventSignature: " + lastEventSignature);
        }
        else {
            isInitialized = true;
            lastEventSignature[1] = this.timestampWithoutMiliseconds(lastEventSignature[1]);
            this.debug("EventConnector: last_event was as expected. Starting the fetch from " + lastEventSignature[1]);
        }

        return lastEventSignature;
    },

    /**
     * Receiving timestamp with miliseconds and convert it to timestamp without miliseconds,
     * because the op5 api expect it like this
     *
     * @param timestamp
     *
     * @returns {String} timestamp from 10 digits so to be without miliseconds
     */
    timestampWithoutMiliseconds: function(timestamp) {
        var result;

        if(Number(timestamp) && timestamp.toString().length > 9) {
            result = timestamp.toString().slice(0, 10);
        } else {
            this.logit("Invalid timestamp in timeStampWithoutMiliseconds function");
            return;
        }

        return result;
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
                this.logit("Invalid timestamp format in getDate function --> " + timestamp);
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
     * Function for checking whether to set a certian property for the SNow Event creation.
     * @param event - SNow Event object
     * @param key - The key to wich the additional field will be set
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
     * We have two mapings --> one for services and one for hosts
     *
     * @param key the value from Op5 data
     * @param identifier - indicates the type of the event -> service or host
     * @returns {*} Returns the associated map value
     */
    getSeverity: function(key, identifier){
        var servicesMap = {
            "ok": 5,
            "unknown": 4,
            "pending": 4,
            "warning": 4,
            "critical": 1,
        };

        var hostsMap = {
            "up": 5,
            "unreachable": 4,
            "pending": 4,
            "down": 1,
        };

        if(identifier == "service") {
            if(servicesMap.hasOwnProperty(key)) {
                return servicesMap[key];
            } else {
                this.logit("Wrong severity. There is no mapping for this key: " + key);
            }  
        } else if(identifier == "host") {
            if(hostsMap.hasOwnProperty(key)) {
                return hostsMap[key];
            } else {
                this.logit("Wrong severity. There is no mapping for this key: " + key);
            }  
        } else {
            this.logit("Wrong Identifier in getSeverity function. Please check!");
        }

        return "";
    },

    /**
     * Just call the createRequest function and checks if the request is valid
     *
     * @param type - the type of the request [GET] for this connector
     * @param method - the URI of the request
     * @param params - the parameters of the request. For ex: table name, attributes, startDate
     *
     * @returns {Object} The request in JSON format
     */
    getResult : function (type, method, params) {
        var req = this.createRequest(type, method, params);
        if(!!req){
            return this.parseJSON(req);
        }
        return [];
    },

    /**
     * Function for generating and executing automatically a REST request with a SET body object
     * @param body An JS object with the request params needed.
     * @returns Java object with the response.
     */
    createRequest: function (type, method, params) {
        var response, body;
        var host = this.probe.getParameter("host"); //get host url from SNow
        // Hardcoded because op5 API cannot work with encoded URI if the protocol is http
        var protocol = "https"; 
        var port = this.probe.getAdditionalParameter("port") || 443; //get the set port from the SNow Connector Definition Instance
        var username = this.probe.getParameter("username") || "";
        var password = this.probe.getParameter("password") || "";
        port = (port == 80 ? "" : (":" + port));
        var url = protocol + "://" + host + port + method; // Build the url for the request
        var query = this.getRequestQuery(type, params);
        this.debug("Query: "+query);

        if(type == "GET"){
            url += query;
        }
        // Work-around for the square brackets
        url = encodeURI(url);
        this.debug("URL:" + url);

        var request = new HTTPRequest(url);

        request.setBasicAuth(username, password);
        request.addHeader('Content-Type', 'application/json');

        try {
            if(type == "GET"){
                response = request.get();
            // In this connector we have only GET requests
            }else{
                this.logit("The type of the request is not correct. Please check!");
            }
            if (response.getStatusCode() != 200 || body.error) {
                this.addError("\n RESPONSE ERROR : < Code - "+body.error.code+" > < Message - "+body.error.message+" > < Description - "+body.error.data+ " >");
                if(response.getErrorMessage()){
                    this.addError(" REQUEST ERROR : "+response.getErrorMessage());
                }
            }
            return response;
        } catch (e) {
            this.addError("ERROR EXECUTING REQUEST: "+response.getErrorMessage());
            this.addError(e.toString());
        }
    },

    /**
     * Checks the type of the request and call the setQuery function
     *
     * @param type - the type of the request [GET]. Only GET requests for this connector
     * @param params - the parameters of the request. For ex: table name, attributes, startDate
     *
     * @returns {String} returns the query string if the type of the request is GET
     */
    getRequestQuery: function (type, params) {
        if(type == "GET") {
            var q = this.setQuery("?", params);

            return q;
        } else {
            this.logit("The type of the request is not correct. Please check");
        }
        
    },

    /**
     * Only for the GET requests. Set the query
     *
     * @param startQuery - String with the beggining of the query
     * @param params - the parameters of the request. For ex: table-name, attributes, startDate
     *
     * @returns {String} returns the concatenated query string
     */
    setQuery: function(startQuery, params) {
        var q = startQuery;

        if(params.hasOwnProperty("query")) {
            if(q != "?") {
                q += "&";
            }

            q += "query=" + params["query"];
        } else {
            this.debug("There is no query in the query");
        }

        if(params.hasOwnProperty("startTime")) {
            if(q != "?") {
                q += "&";
            }

            q += "start_time=" + params["startTime"];
        } else {
            this.debug("There is no start_time in the query");
        }

        if(params.hasOwnProperty("endTime")) {
            if(q != "?") {
                q += "&";
            }

            q += "end_time=" + params["endTime"];
        } else {
            this.debug("There is no end_time in the query");
        }

        if(params.hasOwnProperty("offset")) {
            if(q != "?") {
                q += "&";
            }

            q += "offset=" + params["offset"];
        } else {
            this.debug("There is no offset in the query");
        } 

        if(params.hasOwnProperty("columns")) {
            if(q != "?") {
                q += "&";
            }

            q += "columns=" + params["columns"];
        } else {
            this.debug("There is no columns in the query");
        } 

        if(params.hasOwnProperty("limit")) {
            if(q != "?") {
                q += "&";
            }

            q += "limit=" + params["limit"];
        } else {
            this.debug("There is no limit in the query");
        }
        
        if(params.hasOwnProperty("stateTypes")) {
            if(q != "?") {
                q += "&";
            }

            q += "state_types=" + params["stateTypes"];
        } else {
            this.debug("There is no stateTypes in the query");
        }

        if (q.length < 2) q = "";

        return q;
    },

    /**
     * Parsing the response from string to JSON
     *
     * @param response - response from the http request
     * @returns {Object} the result from the response in JSON format
     */
    parseJSON : function (response) {
        var parser = new JSONParser();
        var resultJson =  parser.parse(response.getBody());
        return resultJson;
        
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
        this.logit("**** Op5JS ERROR: "+message);
    },
    /**
     * Logging a payload if the additional parameter islogPayloadForDebug is set to be true
     *
     * @param message
     */
    logPayload: function(message) {
		if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
			this.logit("Payload | " + message);
		}
		return true;
	},
    /**
     * Logging a message
     *
     * @param message
     */
    logit: function(message) {
        ms.log(SOURCE+": " + message);
    },
    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message){
        if (isDebug == true || isDebug == "true"){
            this.logit("DEBUG | " + message);
        }
        return true;
    },

    type: "Op5Events_JS"
});
