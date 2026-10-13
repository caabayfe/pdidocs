var OpsviewEventsConnector_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var encoder = new JSON();

var SOURCE = "Opsview",
    LIMIT = 3000,
    errorMessage = "",
    AUTH_TOKEN = "",
    LAST_SIGNATURE = "",
    LAST_EVENT_ID = "",
    LAST_EVENT_TIME = "",
    isDebug = false,
    eventCounter = 0,
    isInitialized = false;
var islogPayloadForDebug = false;

OpsviewEventsConnector_JS.prototype = Object.extendsObject(AProbe, {

    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     Opsview is active and running. This is done by probing the Opsview API for it's own version.
     Cases that the function follows are:
     - Opsview API is running and returns status code 200 -> OK
     - Opsview API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection: function() {
        ms.log("*** OPSVIEW CONNECTOR : TEST CONNECTION ***");
        var retVal = {}; //return object for the function

        try {
            var username = this.probe.getParameter("username") || "";
            var password = this.probe.getParameter("password") || "";
            var testConn = this.authToken(username, password);

            if (!!testConn) {
                ms.log("INFO | TEST DATA:" + JSON.stringify(testConn));
            }

        } catch (e) {
            ms.log(e.toString());
            this.addError(SOURCE + ": Test connection failed, because we couldn't retrive token. Please double check your port, protocol and URL!");
            this.addError(e.toString());
            retVal["status"] = FAILURE.toString();
        }

        if (errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            this.authTokenSignOut();
            retVal["status"] = SUCCESS.toString();
        }

        ms.log(SOURCE + ": Connector testConnection:" + retVal["status"]);

        return retVal;
    },

    /**
     * Function that the MID server uses to RUN the script. Main logic lies here.
     * This is the code that the MID Server will run on each Iteraation.
     * @returns An Object with specidfic associated Script return values [status,last_event]
     */
    execute: function() {
        var retVal = {};
        ms.log("***** OPSVIEW CONNECTOR EXECUTE GET EVENTS! *****");
        var startScriptTime = new Date();
        isDebug = "" + this.probe.getAdditionalParameter("debug");
		islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");
        // LAST_SIGNATURE contains only the time stamp on the INITIAL RUN
        // and on every next run we are storing the ID as 1st element and timestamp as 2nd
        LAST_SIGNATURE = this.getLastEventSignature();

        if (!isInitialized) {
            //Initial run where we don't have stored ID
            LAST_EVENT_TIME = LAST_SIGNATURE;
        } else {
            LAST_EVENT_ID = LAST_SIGNATURE[0];
            LAST_EVENT_TIME = LAST_SIGNATURE[1];
        }

        var opsviewEvents = this.getOpsviewEvents();

        if (opsviewEvents.length > 0) {
            var opsviewObjectIds = this.extractAllObjectIds(opsviewEvents);
            var collectedData,
                splicedIds,
                opsviewServiceCheck;

            // If the collected objectIds are more than 50, we need to make extra
            // request to callect all of them because the GET request has limits of the querry string
            // So we are splicing objectids from opsviewObjectIds array and send requests till it's get empty
            if (opsviewObjectIds.length > 50) {
                while (opsviewObjectIds.length != 0) {
                    splicedIds = opsviewObjectIds.splice(0, 50);
                    opsviewServiceCheck = this.getOpsviewServiceCheck(splicedIds);
                    collectedData = this.mergeEventsWithObjectIdInfo(opsviewEvents, opsviewServiceCheck);
                }
            } else {
                opsviewServiceCheck = this.getOpsviewServiceCheck(opsviewObjectIds);
                collectedData = this.mergeEventsWithObjectIdInfo(opsviewEvents, opsviewServiceCheck);
            }

            var emsName = this.probe.getParameter("connector_name");
            this.createSNEvents(collectedData, emsName);
        } else {
            ms.log(SOURCE + ": ****** NO NEW EVENTS TO SEND ******");
        }


        if (errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        if (eventCounter > 0) {
            retVal["last_event"] = LAST_EVENT_ID + "," + (LAST_EVENT_TIME * 1000);
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);

            this.debug("EventCollector handle total of " + eventCounter + " events in " +
                totalDurationSec + " seconds (" + Number(eventCounter / totalDurationSec).toFixed(3) + " per second)");
        }

        this.authTokenSignOut();

        ms.log("***** OPSVIEW CONNECTOR FINISH *****");

        return retVal;
    },

    /**
     * Collects all New Events
     * @returns {Array} [...] with all the Events
     */
    getOpsviewEvents: function() {
        var response, startTimeDate, order;
        startTimeDate = LAST_EVENT_TIME;

        var eventTypeFilter = "" + this.probe.getAdditionalParameter("eventtype_filter");
        var eventTypeArr = this.getArrayFromCsv(eventTypeFilter);
        // If it's initial run we are order the data by DESC,
        // every other run will be ordered ASC
        order = isInitialized ? "asc" : "desc";

        response = this.getResult("GET", "/rest/event", {
            startTime: startTimeDate,
            cols: ["host_group", "host_group_id", "hostname", "state"],
            rows: LIMIT,
            eventType: eventTypeArr,
            sortby: [{
                    key: "col",
                    value: "time"
                },
                {
                    key: "order",
                    value: order
                }
            ]
        }, true);

        return response["list"];
    },

    /**
     * The user can filter the eventTypes from the query.
     * 0 = state change event; 1 = acknowledgements event; 2 = downtime start event; 3 = downtime end event.
     *
     * @param additionalParamCsv - Additional parameter with metrics in csv format. Default is false
     *
     * @returns {Array} [...] Array with the values from additionalParamCsv
     */
    getArrayFromCsv: function(additionalParamCsv) {
        // The available options. We need to be sure
        // the user will pass correct values
        var checkList = ["0", "1", "2", "3"];

        var input = additionalParamCsv.split(",");
        var trimEls = [];
        var result = [];

        trimEls = input.map(function(element) {
            return element.trim();
        });

        // Removing the invalid data if passed
        result = trimEls.filter(function(el, index) {
            return checkList.indexOf(el) > -1;
        }, this);

        return result;
    },

    /**
     * Collects info for the events requested by objectid from the getOpsviewEvents request
     * @param {Array} opsviewObjectIds - Array with all uniques objectids from the getOpsviewEvents request
     * @returns {Array} [...] with all the additional info requested by objectid
     */
    getOpsviewServiceCheck: function(opsviewObjectIds) {
        var response;

        response = this.getResult("GET", "/rest/config/servicecheck", {
            objectIds: opsviewObjectIds
        }, true);

        return response["list"];
    },

    /**
     * Extracts the uniques objectids from allOpsviewEvents so we can request some additional 
     * info later.
     * @param {Array} allOpsviewEvents - Array with all collected events
     * @returns {Array} [...] with all uniques objectids
     */
    extractAllObjectIds: function(allOpsviewEvents) {
        var allObjectIds = [],
            result;

        allOpsviewEvents.forEach(function(el) {
            if (el.hasOwnProperty("objectid")) {
                allObjectIds.push(el["objectid"]);
            }
        }, this);

        result = allObjectIds.filter(function(elem, i, arr) {
            return arr.indexOf(elem) == i;
        });

        return result;
    },

    /**
     * Concatenates the data from both request which we were made.
     * One from the collected events and the second where we fetched the additional data 
     * from the collected objectids from the first request
     *
     * @param opsviewEvents - Array of objects with events
     * @param serviceCheckInfo - Array of objects with addintional info from the objectid
     *
     * @returns {Array} Array of objects. opsviewEvents objects merged with their serviceCheckInfo
     */
    mergeEventsWithObjectIdInfo: function(opsviewEvents, serviceCheckInfo) {
        serviceCheckInfo.forEach(function(elementInfo) {
            opsviewEvents.forEach(function(element) {
                if (element.objectid == elementInfo.id) {
                    for (var prop in elementInfo) {
                        element[prop] = elementInfo[prop];
                    }
                }
            }, this);
        }, this);

        return opsviewEvents;
    },

    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Array} collectedData - Array of collected Events/Alerts with all the info
     * @param {String} emsName - The name of the connector
     */
    createSNEvents: function(collectedData, emsName) {
        var sender = SNEventSenderProvider.getEventSender();

        collectedData.forEach(function(event) {
            var sEvent = Event();
            var hosttemplatesName,
                description,
                snSeverity,
                metricName,
                resolutionState;
            var serviceName = "" + event["servicename"];
            var eventType = "" + event["eventtype"];
            var eventTimeStamp = event["time"];

            if (isInitialized) {
                // We don't want to collect same event from the previous run so
                // here we are checking on ID and the time of the event, and if 
                // they are the same we are skipping this event
                if (LAST_EVENT_ID == event["eventid"].toString() && LAST_EVENT_TIME == eventTimeStamp) {
                    return;
                }
            }

            PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

            if (serviceName == "null" || serviceName == "") {
                serviceName = "";
                metricName = "host_check";
            } else {
                metricName = "service_check";
            }

            if (eventType == "0") {
                description = event["output"];
            } else if (eventType == "1") {
                description = event["ack_author"] + " has acknowledged event witch comment: " + event["ack_comment"];
            } else {
                description = event["output"];
                this.debug("The eventtype is not 0 or 1. We are setting as description the event output");
            }

            snSeverity = this.getSeverity(event["state"]);

            // We are setting resolution state to 'New' for all non-info severities
            // (snow info severity is '5'). If the event severity is info we are setting 
            // the resolutionState to 'Closing'
            if (snSeverity == 5) {
                resolutionState = "Closing";
            } else {
                resolutionState = "New";
            }

            sEvent.setHostAddress(event["hostname"]);
            sEvent.setType(eventType);
            sEvent.setResource(serviceName);
            sEvent.setSeverity(snSeverity);
            sEvent.setResolutionState(resolutionState);
            sEvent.setTimeOfEvent(this.getDate(parseInt(event["time"])));
            sEvent.setText(description);
            sEvent.setMessageKey(this.setMessageKey(event));
            sEvent.setEmsSystem(emsName);
            sEvent.setSource(SOURCE);
            sEvent.setMetricName(metricName);

            if (event["hosttemplates"] && event["hosttemplates"][0]) {
                hosttemplatesName = event["hosttemplates"][0]["name"];
            }

            this.eventSetProperty(sEvent, "host_group", event["host_group"]);
            this.eventSetProperty(sEvent, "eventid", event["eventid"]);
            this.eventSetProperty(sEvent, "state_type", event["state_type"]);
            this.eventSetProperty(sEvent, "hosttemplates_name", hosttemplatesName);
            if (event["servicegroup"]) {
                this.eventSetProperty(sEvent, "servicegroup", event["servicegroup"]["name"]);
            }
            this.eventSetProperty(sEvent, "description ", event["description"]);
            this.eventSetProperty(sEvent, "retry_check_interval", event["retry_check_interval"]);
            this.eventSetProperty(sEvent, "name", event["name"]);
            this.eventSetProperty(sEvent, "check_attempts", event["check_attempts"]);
            this.eventSetProperty(sEvent, "check_interval", event["check_interval"]);

            if (parseInt(eventTimeStamp) > parseInt(LAST_EVENT_TIME)) {
                LAST_EVENT_TIME = eventTimeStamp;
                LAST_EVENT_ID = event["eventid"].toString();
            }

            try {
				this.logPayload("Event Object Created : "+sEvent);
                sender.sendEvent(sEvent);
            } catch (e) {
                ms.log(e.toString());
                this.addError(e.toString());
            }

            eventCounter++;

        }, this);
    },
    /**
     * Concatenates hostname and objectid from the event object to set the MessageKey
     *
     * @param event - The Object from where we took the attritributes for concatenating
     * @returns {String} result
     */
    setMessageKey: function(event) {
        var result = "opsview";

        if (event.hasOwnProperty("hostname")) {
            result += "_" + event["hostname"];
        }

        if (event.hasOwnProperty("objectid")) {
            result += "_" + event["objectid"];
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
        if (lastEventSignature == null || lastEventSignature == "null") {
            lastEventSignature = 0;
        } else {
            // Here 'lastEventSignature' become array (first el is the ID and second is the time)
            lastEventSignature = this.splitLastEventSignature(lastEventSignature);
        }
        // Only for the initializing of lastEventSignature
        if (lastEventSignature == 0) {
            var now;
            var daysFrom = this.probe.getAdditionalParameter("days_from") || 7;

            // To be on the safe side we are checking if the daysFrom parameter is reasonable days (range 0 - 100)
            // if we are out of these limits setting the parameter to default value which is 7 days
            if (((parseInt(daysFrom, 10) != 7) && (parseInt(daysFrom, 10) > 100 || parseInt(daysFrom, 10) <= 0)) || isNaN(parseInt(daysFrom, 10))) {
                daysFrom = 7;
                ms.log("Connector parameter 'days_from' is a out of range(0-100) or invalid. Set default value to collect events from a week earlier (7 days).");
            }

            now = new Date();
            now.setDate(now.getDate() - parseInt(daysFrom));

            // lastEventSignature is empty, we will start to retrieved from now
            lastEventSignature = this.timestampWithoutMiliseconds(now.getTime());
            this.debug("EventConnector: last_event was empty. Initializing...lastEventSignature: " + lastEventSignature);
        } else {
            isInitialized = true;
            lastEventSignature[1] = this.timestampWithoutMiliseconds(lastEventSignature[1]);
            this.debug("EventConnector: last_event was as expected. Starting the fetch from " + lastEventSignature[1]);
        }

        return lastEventSignature;
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

        if (lastEventSignature != "null" && lastEventSignature != null && lastEventSignature != "") {
                result = lastEventSignature.split(",")
                .map(function(el) {
                    return el.trim();
                }, this);
        }


        return result;
    },

    /**
     * Receiving timestamp with miliseconds and convert it to timestamp without miliseconds,
     * because the opsview api expect it like this
     *
     * @param timestamp
     *
     * @returns {String} timestamp from 10 digits so to be without miliseconds
     */
    timestampWithoutMiliseconds: function(timestamp) {
        var result;

        if (Number(timestamp) && timestamp.toString().length > 9) {
            result = timestamp.toString().slice(0, 10);
        } else {
            ms.log(SOURCE + ": Invalid timestamp in timeStampWithoutMiliseconds function");
            return;
        }

        return result;
    },

    /**
     * Function to parse a Epoch time timestamp to a String formatted date.
     * @param timestamp - Integer time value to be parsed and arranged into string value
     * @returns {String} Returns String formatted date
     */
    getDate: function(timestamp) {
        if (timestamp) {
            if (timestamp.toString().length == 10) {
                timestamp = parseInt(timestamp) * 1000;
            } else if (timestamp.toString().length > 10) {
                timestamp = parseInt(timestamp);
            } else {
                ms.log(SOURCE + ": Invalid timestamp format in getDate function --> " + timestamp);
            }
        }

        var d = new Date(timestamp);
        // yyyy-MM-dd HH:mm:ss

        var year = "" + d.getUTCFullYear();
        var month = "" + (d.getUTCMonth() + 1);
        if (month.length == 1) {
            month = "0" + month;
        }

        var day = "" + d.getUTCDate();
        if (day.length == 1) {
            day = "0" + day;
        }

        var hour = "" + d.getUTCHours();
        if (hour.length == 1) {
            hour = "0" + hour;
        }

        var minute = "" + d.getUTCMinutes();
        if (minute.length == 1) {
            minute = "0" + minute;
        }

        var second = "" + d.getUTCSeconds();
        if (second.length == 1) {
            second = "0" + second;
        }
        return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
    },

    /**
     * Function for checking whether to set a certian property for the SNow Event creation.
     * @param event - SNow Event object
     * @param key - The key to wich the additional field will be set
     * @param value - The value to be set on that key
     */
    eventSetProperty: function(event, key, value) {
        if (!!value && value.length >= 1) {
            event.setField("u_" + key, value);
        }
        return event;
    },

    /**
     * Function for returning a mapped value for the events
     * We have two mapings --> one for services and one for hosts
     *
     * @param key the value from Opsview data
     * @returns {*} Returns the associated map value
     */
    getSeverity: function(key) {
        var servicesMap = {
            "ok": 5,
            "unknown": 5,
            "warning": 4,
            "critical": 1,
        };

        var hostsMap = {
            "up": 5,
            "unreachable": 4,
            "down": 1,
        };

        if (servicesMap.hasOwnProperty(key)) {
            return servicesMap[key];
        } else if (hostsMap.hasOwnProperty(key)) {
            return hostsMap[key];
        } else {
            ms.log(SOURCE + ": Wrong severity. There is no mapping for this key: " + key);
        }
    },

    /**
     * Function for getting and managment of the AUTH_TOKEN that is needed for every request made.
     * @returns {*} a String token ID
     */
    authToken: function(username, password) {
        var resBody, response;
        var token = AUTH_TOKEN;
        if (!token) {
            response = this.getResult("POST", "/rest/login", {
                "username": username,
                "password": password
            }, false);

            token = response["token"];
            AUTH_TOKEN = token;

            return token;
        } else {
            return token;
        }
    },

    /**
     * In the end of the script we safely sign off the current TOKEN
     */
    authTokenSignOut: function() {
        var response = this.getResult("POST", "/rest/logout", {}, false);
        this.debug("Current token:" + AUTH_TOKEN + " was successfully logout:" + JSON.stringify(response));
    },

    /**
     * Just call the createRequest function and checks if the request is valid
     *
     * @param type - the type of the request [GET, POST, ... ]
     * @param method - the URI of the request
     * @param params - the parameters of the request. For ex: table name, attributes, startDate
     *
     * @returns {Object} The request in JSON format
     */
    getResult: function(type, method, params, auth) {
        var req = this.createRequest(type, method, params, auth);
        if (!!req) {
            return this.parseJSON(req);
        }
        return [];
    },

    /**
     * Function for generating and executing automatically a REST request with a SET body object
     * @param body An JS object with the request params needed.
     * @returns Java object with the response.
     */
    createRequest: function(type, method, params, auth) {
        var response, body;
        var host = this.probe.getParameter("host"); //get host url from SNow
        var protocol = this.probe.getAdditionalParameter("protocol");
        var port = this.probe.getAdditionalParameter("port") || 80; //get the set port from the SNow Connector Definition Instance
        var username = this.probe.getParameter("username") || "";
        var password = this.probe.getParameter("password") || "";
        port = (port == 80 ? "" : (":" + port));
        var url = protocol + "://" + host + port + method; // Build the url for the request
        var query = this.getRequestQuery(type, params);

        if (type == "GET") {
            url += query;
        }

        url = encodeURI(url);
		
		var requestType = "";
		if(method=="/rest/login"){
			requestType = "Acquiring Auth Token";
		}else if(method=="/rest/logout"){
			requestType = "Releasing Auth Token";
		}else if(method=="/rest/event"){
			requestType = "Fetching events records";
		}else if(method=="/rest/config/servicecheck"){
			requestType = "Fetching object details of events";
		}
        this.debug("URL for "+requestType+" : " + url);

        var request = new HTTPRequest(url);

        if (auth) {
            this.authToken(username, password);
        }

        request.addHeader('Content-Type', 'application/json');
        request.addHeader('X-Opsview-Username', username);
        request.addHeader('X-Opsview-Token', AUTH_TOKEN);

        try {
            if (type == "GET") {
                response = request.get();
				this.logPayload("Response Body for "+requestType+" : " + response.getBody());
            } else {
                response = request.post(encoder.encode(query));
                body = this.parseJSON(response);
				this.logPayload("Response Body for "+requestType+" : " + JSON.stringify(body));
            }
            if (response.getStatusCode() != 200 || body.error) {
                this.addError("\n RESPONSE ERROR : < Code - " + body.error.code + " > < Message - " + body.error.message + " > < Description - " + body.error.data + " >");
                if (response.getErrorMessage()) {
                    this.addError(" REQUEST ERROR : " + response.getErrorMessage());
                }
            }
            return response;
        } catch (e) {
            this.addError("ERROR EXECUTING REQUEST: " + response.getErrorMessage());
            this.addError(e.toString());
        }
    },

    /**
     * Checks the type of the request and call the setQuery function
     *
     * @param type - the type of the request [GET, POST, ... ]
     * @param params - the parameters of the request. For ex: table name, attributes, startDate
     *
     * @returns {String} returns the query string if the type of the request is GET
     * @returns {Object} obj if the type of the request is POST
     */
    getRequestQuery: function(type, params) {
        if (type == "GET") {
            var q = this.setQuery("?", params);

            return q;
        } else if (type == "POST") {
            return params;
        } else {
            ms.log(SOURCE + ": The type of the request is not correct. Please check");
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

        if (params.hasOwnProperty("startTime")) {
            q += "startTime=" + params["startTime"] + "&";
        } else {
            this.debug(SOURCE + ": There is no startTime in the query");
        }

        if (params.hasOwnProperty("cols") && params["cols"].length > 0) {
            params["cols"].forEach(function(item, index) {
                q += "cols=" + item + "&";
            }, this);
        } else {
            this.debug(SOURCE + ": There is no cols in the query");
        }

        if (params.hasOwnProperty("rows")) {
            q += "rows=" + params["rows"] + "&";
        } else {
            this.debug(SOURCE + ": There is no rows in the query");
        }

        if (params.hasOwnProperty("eventType") && params["eventType"].length > 0) {
            params["eventType"].forEach(function(el) {
                q += "eventtype=" + el + "&";
            }, this);
        } else {
            this.debug(SOURCE + ": There is no eventType in the query");
        }

        if (params.hasOwnProperty("sortby")) {
            if (params["sortby"].length == 1) {
                q += "sortby=[{" + "\"" + params["sortby"][0]["key"] + "\"" + ":" + "\"" + params["sortby"][0]["value"] + "\"" + "}]";
            } else {
                q += "sortby=[{";
                var closingString;
                params["sortby"].forEach(function(el, index) {
                    closingString = (index == params["sortby"].length - 1) ? "}]" : ", ";
                    q += "\"" + el["key"] + "\"" + ":" + "\"" + el["value"] + "\"" + closingString;
                }, this);
            }
        } else {
            this.debug(SOURCE + ": There is no sortby in the query");
        }

        if (params.hasOwnProperty("objectIds")) {
            if (params["objectIds"].length == 1) {
                q += "json_filter={\"id\":{\"=\":" + params["objectIds"][0] + "}}";
            } else if (params["objectIds"].length > 1) {
                var result = "";

                params["objectIds"].forEach(function(el, index) {
                    var separator = (index == params["objectIds"].length - 1) ? "]}" : ",";

                    result += "{\"id\":{\"=\":" + el + "}}" + separator;
                }, this)

                q += "json_filter={\"-or\":[" + result;
            }
        } else {
            this.debug(SOURCE + ": There is no objectIds in the query");
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
    parseJSON: function(response) {
        var parser = new JSONParser();
        var resultJson = parser.parse(response.getBody());
        return resultJson;

    },

    addError: function(message) {
        if (errorMessage === "")
            errorMessage = message;
        else
            errorMessage += "\n" + message;
        ms.log("**** OpsviewJS ERROR: " + message);
    },

    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message) {
        if (isDebug == true || isDebug == "true") {
            ms.log(SOURCE + ": " + message);
        }
        return true;
    },
	
	logPayload: function(message) {
		if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
			ms.log("Opsview Payload : " + message);
		}
		return true;
	},

    type: "OpsviewEventsConnector_JS"
});
