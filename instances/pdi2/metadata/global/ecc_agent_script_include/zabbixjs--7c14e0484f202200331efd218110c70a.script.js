var ZabbixJS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var parser = new JSONParser();
var encoder = new JSON();


var ZABBIX = "Zabbix",
    isDebug = false,
    islogPayloadForDebug = false,
    LIMIT = 3000,
    errorMessage = "",
    LAST_EVENT = "",
    ZABBIX_VERSION = "",
    AUTH_TOKEN = "",
    MAX_RETRY_COUNT = 3;


ZabbixJS.prototype = Object.extendsObject(AProbe, {

    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     Zabbix is active and running. This is done by probing the Zabbix API for it's own version.
     Cases that the function follows are:
     - Zabbix API is running and returns status code 200 -> OK
     - Zabbix API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection: function() {
        var retVal = {}; //return object for the function

        var version = this.getZabbixVersion();
        if (!version) {
            return this.getErrorResponse(retVal);
        }

        var authToken = this.getAuthToken();
        if (!authToken) {
            return this.getErrorResponse(retVal);
        }

        ms.log("*** ZABBIX CONNECTOR : TEST CONNECTION ***");
        //DEF0221503: for test connection we can just get one trigger or event rather than fetching all of them.
        var body = this.createRequestBody("trigger.get", {
            "limit": 1
        }, authToken);
        if (!body) {
            return this.getErrorResponse(retVal);
        }
        try {
            var response = this.createRequest(body);
            if (!response) {
                return this.getErrorResponse(retVal);
            }
            var resBody = this.getResponseBody(response);
            if (response.getStatusCode() == 200) {
                retVal.status = SUCCESS.toString();
            } else {
                this.addError(response.getErrorMessage());
                retVal.status = FAILURE.toString();
            }
        } catch (e) {
            retVal.status = FAILURE.toString();
        }

        // We are loging out the token
        this.authTokenSignOut();

        ms.log("*** ZABBIX CONNECTOR : TEST CONNECTION STATUS - " + retVal.status);
        if (retVal.status === FAILURE.toString())
            retVal['error_message'] = errorMessage;
        return retVal;

    },

    execute: function() {
        var retVal = {}; //return object for the function

        isDebug = "" + this.probe.getAdditionalParameter("debug");
        islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");

        var version = this.getZabbixVersion();
        if (!version) {
            return this.getErrorResponse(retVal);
        }

        var authToken = this.getAuthToken();
        if (!authToken) {
            return this.getErrorResponse(retVal);
        }

        ms.log("***** ZABBIX CONNECTOR EXECUTE GET EVENTS! *****");
        //
        var zabEvents = this.getZabbixEvents();
        if (zabEvents == null) {
            return this.getErrorResponse(retVal);
        }
        if (zabEvents.length > 0) {
            ms.log("*** GATHERED EVENTS : " + zabEvents.length);
            this.logPayload("Gathered events payload: " + JSON.stringify(zabEvents));

            var zabTriggers = this.getZabbixTriggers(zabEvents);
            var zabItems;
            if (zabTriggers) {
                ms.log("*** GATHERED TRIGGERS : " + zabTriggers.length);
                zabItems = this.getZabbixItems(zabTriggers);
            }
            this.logPayload("Gathered triggers payload: " + JSON.stringify(zabTriggers));

            if (zabItems) {
                ms.log("*** GATHERED ITEMS : " + zabItems.length);
            }
            this.logPayload("Gathered items payload: " + JSON.stringify(zabItems));

            var snEvents = this.createSNEvents(zabEvents, zabTriggers, zabItems);
            var sender = SNEventSenderProvider.getEventSender();
            ms.log("**** SNEvents COUNT : " + snEvents.length);

            for (var i = 0; i < snEvents.length; i++) {
                this.logPayload("Sending SNow Event OBJ : " + snEvents[i].toString());
                if (!sender.sendEvent(snEvents[i])) {
                    ms.log("*** ERROR sending SNow Event OBJ: " + snEvents[i].toString());
                }
            }
        } else {
            ms.log("****** NO NEW EVENTS TO SEND ******");
        }
        this.authTokenSignOut();

        retVal["last_event"] = LAST_EVENT;
        retVal["status"] = SUCCESS.toString();
        ms.log("***** ZABBIX CONNECTOR FINISH *****");
        return retVal;

    },

    retrieveKpi: function() {
        var metricConnector = ZabbixMetrics_JS.get(this.probe).retrieveKpi();
        return metricConnector;
    },

    getZabbixEvents: function() {
        LAST_EVENT = this.probe.getParameter("last_event") || 0; //Get the last event id to query from
        var authToken = this.getAuthToken();
        var body = this.createRequestBody("event.get", { //Creating a body with the needed request params
            "source": "0",
            "object": "0",
            "selectHosts": "extend",
            "selectRelatedObject": "extend",
            "sortfield": ["clock", "eventid"],
            "sortorder": "ASC",
            "limit": LIMIT
        }, authToken);
        if (!body)
            return null;
        if (LAST_EVENT >= 1) { //Adding request param in case we have a set previous ID from the Probe.
            // Looking for event's that start with the next one ID from Zabbix, because we have the last one already in SNow
            ms.log("*** REQUESTING EVENTS FROM LAST ID: " + LAST_EVENT);
            body.params.eventid_from = parseInt(LAST_EVENT) + 1;
        } else {
            // Looking for event's that start a week ago from Zabbix
            var daysFrom = new Date();
            daysFrom.setDate(daysFrom.getDate() - (this.probe.getAdditionalParameter('days_from')));
            var time_from = ("" + daysFrom.getTime()).substr(0, 10);
            //IN CASE OF Preset days_from to get from or else get events from a week ago only(7 days)
            ms.log("*** DAYS FROM PARAM : " + this.probe.getAdditionalParameter('days_from'));
            ms.log("*** REQUESTING EVENTS FROM LAST TIME : " + daysFrom.toUTCString());
            //ms.log("*** REQUESTING EVENTS FROM LAST TIMESTAMP 1 : "+ (daysFrom.getTime() - daysFrom.getTime()%1000)/1000);
            ms.log("*** REQUESTING EVENTS FROM LAST TIMESTAMP 2 : " + time_from);
            body.params.time_from = time_from;
            body.params.sortorder = "DESC";
        }
        try {
            var response = this.createRequest(body); //Executing the request with the body
            if (!response) {
                return null;
            }

            if (response.getStatusCode() == 200) { // If reqeust is OK we proceed
                //
                var resBody = this.getResponseBody(response);
                var events = resBody.result;
                //JSUtil.logObject(events);
                if (events.length > 0) {
                    // send all events and get lastId
                    if (LAST_EVENT >= 1) {
                        LAST_EVENT = events[events.length - 1].eventid;
                    } else {
                        LAST_EVENT = events[0].eventid;
                    }
                    ms.log("*** LAST COLLECTED EVENT ID: " + LAST_EVENT);
                    return events;
                } else {
                    return [];
                }
                //
            } else {
                //IF there was an error in the request we log the problem to MID server log.
                this.addError(response.getErrorMessage());
                return null;
            }
        } catch (e) {
            //If there was a general error executing a request we also log it
            this.addError(e.toString());
            return null;
        }
    },

    getZabbixTriggers: function(events) {
        //First collect triggerIds to be queried from Zabbix for additional info.
        var triggerIds = [];
        try {
            for (var i = 0; i < events.length; i++) {
                var id = events[i].relatedObject.triggerid;
                if (triggerIds.indexOf(id) == -1) {
                    triggerIds.push(id);
                }
            }
            var authToken = this.getAuthToken();
            var bodyParams = {
                "triggerids": triggerIds,
                "expandDescription": "true",
                "expandExpression": "true",
                "selectHosts": "extend",
                "selectItems": "extend",
                "sortfield": ["lastchange", "triggerid"],
                "sortorder": "ASC"
            };
            if (this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.2.0")) {
                bodyParams["selectHostGroups"] = "extend";
            } else {
                bodyParams["selectGroups"] = "extend";
            }

            var reqBody = this.createRequestBody("trigger.get", bodyParams, authToken);
            var response = this.createRequest(reqBody);
            if (!response) {
                return;
            }
            if (response.getStatusCode() == 200) {
                var resBody = this.getResponseBody(response);
                if (resBody && resBody.result) {
                    var triggers = resBody.result; // Getting all the data and returning it for further use.
                    return triggers;
                }
            }
            return;
        } catch (e) {
            this.addError(e.toString());
            return;
        }

    },

    getZabbixItems: function(triggers) {
        //First collect triggerIds to be queried from Zabbix for additional info.
        var itemIds = [];
        try {
            for (var i = 0; i < triggers.length; i++) {
                var itemId = triggers[i].items[0].itemid;
                if (itemIds.indexOf(itemId) == -1) {
                    itemIds.push(itemId);
                }
            }

            var authToken = this.getAuthToken();
            var reqBody = this.createRequestBody("item.get", { //Creating a body with the needed request params
                "itemids": itemIds,
                "selectInterfaces": "extend",
                "selectApplications": "extend"
            }, authToken);
            var response = this.createRequest(reqBody); //Executing the request with the body
            if (!response) {
                return;
            }
            if (response.getStatusCode() == 200) {
                var resBody = this.getResponseBody(response); //Parsing the response json from the body of the requested response.
                if (resBody && resBody.result) {
                    var items = resBody.result; // Getting all the data and returning it for further use.
                    return items;
                }
            }
            return;
        } catch (e) {
            this.addError(e.toString());
            return;
        }
    },

    createSNEvents: function(events, triggers, items) {
        //Params  ( Events Array, Triggers Array , Items Array ) - All the data from the requests.
        //Function for Mapping the Zabbix data into single Event records, and returning all of them in an array.
        var res = [];

        for (var i = 0; i < events.length; i++) { //Iterating through all the collected events
            var event = events[i];
            if (event.relatedObject.constructor.toString().indexOf("Array") != -1 || event.hosts.length <= 0) {
                continue;
            }
            var sEvent = Event(); // Initializing a new SNow Event record that will be populated with event/trig/item data.
            var emsName = this.probe.getParameter("connector_name");
            sEvent.setEmsSystem(emsName);
            sEvent.setSource(ZABBIX); // Hardcoded

            PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

            var date = this.getDate(parseInt(event.clock) * 1000); //Parsing the date from Clock miliseconds from the event
            sEvent.setTimeOfEvent(date); //Setting this date preformatted for SNow event field

            var severity = null;
            if (event.hasOwnProperty("severity")) {
                // The Zabbix event object contains severity if the version is greater than or equal to 4.0.
                //Setting severity for SNow from Zabbix needs an additional mapping between the numbers indicating the severity field.
                severity = this.getSeverity(event.severity); //get the mapped severity between SNow and Zabbix
            }
            //trigger - variable that will hold the associated trigger data specifically for this event.
            var trigger = this.findChild(triggers, "triggerid", event.relatedObject.triggerid);
            var item;
            if (trigger) {
                var description;
                //item - variable that will hold the associated item data specifically for the trigger from the event.
                item = this.findChild(items, "itemid", trigger.items[0].itemid);
                if (item) {
                    sEvent.setMetricName(item.name);
                    description = event.hosts[0].host + ":" + item.name + " TRIGGERED EVENT: " + trigger.description + " WITH VALUE:" + item.lastvalue;
                } else {
                    description = event.hosts[0].host + " TRIGGERED EVENT: " + trigger.description;
                }
                description = this.escapeSlashes(description);
                sEvent.setText(description);
                sEvent.setType(this.escapeSlashes(trigger.description));
                sEvent.setMessageKey(trigger.triggerid);
                if (severity == null) {
                    severity = this.getSeverity(trigger.priority);
                }
            }
            if((severity == null || severity == undefined) && event.value == 0){
                severity = this.getSeverity(0); // If event.value equals 0, we generally receive a payload with a severity of 0 from Zabbix for closing or resolved events
            }
            sEvent.setSeverity(severity);
            sEvent.setResolutionState(this.getState(event.value));
            sEvent.setHostAddress(event.hosts[0].host); // will be mapped to node field
            //Setting additional attributes through the eventSetProperty function, passing the sEvent, key, value params to the function.
            //The function role is so to not set a param in the SNow Event if it is empty or null !
            this.eventSetProperty(sEvent, "eventid", event.eventid); //add h additional info values
            this.eventSetProperty(sEvent, "event_source", event.source);
            this.eventSetProperty(sEvent, "event_object", event.object);
            this.eventSetProperty(sEvent, "event_objectid", event.objectid);
            this.eventSetProperty(sEvent, "event_clock", event.clock);
            this.eventSetProperty(sEvent, "event_value", event.value);
            this.eventSetProperty(sEvent, "event_acknowledged", event.acknowledged);
            this.eventSetProperty(sEvent, "hostid", event.hosts[0].hostid);
            this.eventSetProperty(sEvent, "host_host", event.hosts[0].host);
            this.eventSetProperty(sEvent, "event_name", event.hosts[0].name);
            this.eventSetProperty(sEvent, "host_description", event.hosts[0].description);
            if (trigger) {
                this.eventSetProperty(sEvent, "trigger_triggerid", trigger.triggerid);
                this.eventSetProperty(sEvent, "trigger_expression", trigger.expression);
                this.eventSetProperty(sEvent, "trigger_description", trigger.description);
                this.eventSetProperty(sEvent, "trigger_url", trigger.url);
                this.eventSetProperty(sEvent, "trigger_value", trigger.value);
                this.eventSetProperty(sEvent, "trigger_priority", trigger.priority);
                this.eventSetProperty(sEvent, "trigger_comments", trigger.comments);
            }
            if (item) {
                this.eventSetProperty(sEvent, "item_templateid", item.templateid);
                this.eventSetProperty(sEvent, "item_itemid", item.itemid);
                this.eventSetProperty(sEvent, "item_type", this.getType(item.type));
                this.eventSetProperty(sEvent, "item_snmp_oid", item.snmp_oid);
                this.eventSetProperty(sEvent, "item_key_", item.key_);
                this.eventSetProperty(sEvent, "item_name", item.name);
                this.eventSetProperty(sEvent, "item_lastvalue", item.lastvalue);
                this.eventSetProperty(sEvent, "item_port", item.port);
                this.eventSetProperty(sEvent, "item_interfaceid", item.interfaceid);
                this.eventSetProperty(sEvent, "item_ipmi_sensor", item.ipmi_sensor);
                this.eventSetProperty(sEvent, "item_description", item.description);
                //DEF0220034: zabbix connector is failing if applications is not coming in the payload
                if (item.applications !== undefined && item.applications.length > 0) {
                    this.eventSetProperty(sEvent, "item_applications_name", item.applications[0].name);
                }
                if (item.interfaces !== undefined && item.interfaces.length > 0) {
                    this.eventSetProperty(sEvent, "item_interface_port", item.interfaces[0].port);
                    this.eventSetProperty(sEvent, "item_interface_ip", item.interfaces[0].ip);
                }
            }
            //
            res.push(sEvent); //Appending this event to the stack of events to be returned.
        }
        return res;
    },

    //respobsible to escape slashes when needed
    escapeSlashes: function(str) {
        return str.replace(/\\\//g, "/");
    },

    getDate: function(date) {
        var d = new Date(date);
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
        if (value && value.length >= 1) {
            value = this.escapeSlashes(value);
            event.setField("u_" + key, value);
        }
        return event;
    },

    /**
     * Function for returning a mapped value for the Trigger Type between id and String Message
     * @param key the value from Zabbix data
     * @returns {*} Returns the associated map value
     */
    getType: function(key) {
        var map = {
            0: "Zabbix agent",
            1: "SNMPv1 agent ",
            2: "Zabbix trapper",
            3: "simple check",
            4: "SNMPv2 agent",
            5: "Zabbix internal",
            6: "SNMPv3 agent",
            7: "Zabbix agent (active)",
            8: "Zabbix aggregate",
            9: "web item",
            10: "external check",
            11: "database monitor",
            12: "IPMI agent",
            13: "SSH agent",
            14: "TELNET agent",
            15: "calculated",
            16: "JMX agent",
            17: "SNMP trap"
        };
        return map[key];
    },

    /**
     * Function for returning a mapped value for the Event Severity
     * Service now severity : 1-Critical 2-Major 3-Minor 4-Warning 5-Info
     * Zabbix severities : 0-1-Info 2-Warning 3-Minor 4-Major 5-Disaster
     * @param key the value from Zabbix data
     * @returns {*} Returns the associated map value
     */
    getSeverity: function(key) {
        var map = {
            0: 5,
            5: 1,
            4: 2,
            3: 3,
            2: 4,
            1: 5
        };
        return map[key];
    },

    /**
     * Function for returning a mapped value for the State
     * @param key the value from Zabbix data
     * @returns {*} Returns the associated map value
     */
    getState: function(key) {
        var map = {
            0: "Closing",
            1: "New"
        };
        return map[key];
    },

    /**
     * Function for finding an object within an array, on a certian key, with a set value
     * @param arr - The Array to be finging IN
     * @param key - The key of the value to be tested against
     * @param value - The value to be tested for.
     * @returns {*} the specific object that the Values matched.
     */
    findChild: function(arr, key, value) {
        if (arr && arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                var element = arr[i];
                var tempVal = element[key];
                if (tempVal == value) {
                    return element;
                }
            }
        } else {
            ms.log("**** ERROR : PASSED EMPTY ARRAY TO SEARCH OBJECT FROM ID !");
            return null;
        }
    },

    /**
     * Function for getting auth token that is needed for every request made.
     * @returns {*} a String token ID
     */
    getAuthToken: function() {
        var token = AUTH_TOKEN;
        if (!token) {
            var username = this.probe.getParameter("username");
            var password = this.probe.getParameter("password");
            var bodyParams = {
                "password": password
            };
            //From version 6.0.0, the 'user' parameter is deprecated. Therefore, if the current version is greater than or equal to 6.0.0, use the 'username' parameter
            if (this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.0.0")) {
                bodyParams["username"] = username;
            } else {
                bodyParams["user"] = username;
            }
            var body = this.createRequestBody("user.login", bodyParams);
            var response = this.createRequest(body, false);
            if (!response)
                return;
            var resBody = this.getResponseBody(response);
            if (resBody && resBody.result) {
                token = resBody.result;
                AUTH_TOKEN = token;
            }
            if (!token) {
                ms.error("**** ZABBIX CONNECTOR Failed getting login token, check user name and password ****");
            }
            return token;
        } else {
            return token;
        }
    },

    authTokenSignOut: function() {
        var authToken = AUTH_TOKEN;
        var body = this.createRequestBody("user.logout", {}, authToken);
        var response = this.createRequest(body);
        AUTH_TOKEN = "";
        if (response && response.getStatusCode() == 200) {
            var resBody = this.getResponseBody(response);
            if (resBody) {
                if (!resBody.error) {
                    this.debug("Current token: " + authToken + " was successfully logged out!");
                    return;
                } else if (resBody.error && resBody.error.data == "Session terminated, re-login, please.") {
                    this.debug("Current token: " + authToken + " was automatically logged out due to a session termination");
                    return;
                }
            }
        }
        this.debug("Current token: " + authToken + ". There was a problem while logging out!");
    },

    getZabbixVersion: function() {
        var body = this.createRequestBody("apiinfo.version");
        var response = this.createRequest(body);
        if (response && response.getStatusCode() == 200) {
            var resBody = this.getResponseBody(response);
            if (resBody && resBody.result) {
                ZABBIX_VERSION = resBody.result;
                return ZABBIX_VERSION;
            }
        }
        ms.error("**** ZABBIX CONNECTOR Failed getting zabbix server version, check host ip and port ****");
        return;
    },
    // If the current Zabbix server version is equal to or greater than the specified version, return true
    isCurrentVersionGreaterOrEqual: function(currentVersion, specifiedVersion) {
        var specifiedVersionSegments = specifiedVersion.split('.').map(Number);
        var currentVersionSegments = currentVersion.split('.').map(Number);
        for (var i = 0; i < Math.max(specifiedVersionSegments.length, currentVersionSegments.length); i++) {
            var specifiedSegment = specifiedVersionSegments[i] || 0;
            var currentSegment = currentVersionSegments[i] || 0;
            if (currentSegment > specifiedSegment) {
                return true; // currentVersion is greater than specifiedVersion
            } else if (currentSegment < specifiedSegment) {
                return false; // currentVersion is less than specifiedVersion
            }
        }
        return true; // versions are equal
    },

    /**
     * Function for generating consistent REST request Body params object.
     * @param method - String with the method of the REST call to be used
     * @param params - JS Object - Query key/value params specific to the ZABBIX REST API
     * @param auth - Boolean
     * @returns a JS Object with the body params needed for a request
     */
    createRequestBody: function(method, params, authToken) {
        var body = {
            "jsonrpc": "2.0",
            "method": "",
            "params": {},
            "id": "1"
        };

        //in case this is a request for token, the authToken is empty
        if (authToken && !this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
            body["auth"] = authToken;
        }
        //
        if (method) {
            body.method = method;
        }
        if (params) {
            body.params = params;
        }
        //
        return body;
    },

    /**
     * Function for generating and executing automatically a REST request with a SET body object
     * @param body An JS object with the request params needed.
     * @param safeToLog Set to false when content of request body contains sensitive information like server credentials. Default: true
     * @returns Java object with the response.
     */
    createRequest: function(body, safeToLog) {
        safeToLog = safeToLog !== false; // Set to false if caller explicitly sets it to false. True by default for undefined / null

        var host = this.probe.getParameter("host"); //get host url from SNow
        var port = this.probe.getAdditionalParameter("port") || 80; // get the set port from the SNow Connector Instance
        // The default protocol is http to support old clients that used to work with http
        var protocol = this.probe.getAdditionalParameter("protocol") || "http"; // get the set protocol from the SNow Connector Instance
        // Specify port 443 will set the connection to https, this is good as a workaound for clients that upgrade
        // and does not have the new protocol prameter on their instances and still want to work with https
        if (port == "443") {
            ms.log("Port is 443, setting the connection protocol to https");
            protocol = "https";
        }
        var url = protocol + "://" + host + ((port == 80) ? "" : ":" + port) + "/zabbix/api_jsonrpc.php"; // Build the url for the request
        ms.log("Connecting to Zabbix with the following URL: " + url);
        var request = new HTTPRequest(url);
        request.addHeader('Accept', 'application/json'); //Set needed headers for the request
        request.addHeader('Content-Type', 'application/json-rpc');
        var authToken = AUTH_TOKEN;
        if (authToken && this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
            request.addHeader("Authorization", "Bearer " + authToken);
        }
        try {
            if (safeToLog) {
                this.debug("Posting request to zabbix server with content : " + JSON.stringify(body));
            }

            var response = request.post(encoder.encode(body));
            if (!response) {
                this.addError(request.getErrorMessage());
                return;
            }
            var resBody = this.getResponseBody(response);

            // It's always safe to log a response as it will never have sensitive information
            this.debug("Response body: " + encoder.encode(resBody)); //Logging and ensuring the parsing works !

            if (response.getStatusCode() != 200 || resBody.error) {
                // retry logic for session termination during API requests for the trigger.get, event.get, and item.get methods
                if (resBody.error && resBody.error.data == "Session terminated, re-login, please.") {
                    if (body.method == "user.logout") {
                        return response;
                    } else {
                        AUTH_TOKEN = ""; // Clear the old token and obtain a new authentication token
                        authToken = this.getAuthToken();
                        if (authToken && MAX_RETRY_COUNT > 0) {
                            if (!this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
                                body["auth"] = authToken;
                            }
                            /* Retry a maximum number of times if API requests for the history.get and item.get methods fail, even with a new token.
							on server side, user can set the token expiration limit  90 seconds to 1 day (default).
							If user set 90sec expiration then for any reason, an API call takes more than 90 sec,it will execute at most 3 times.
							*/
                            MAX_RETRY_COUNT--;
                            response = this.createRequest(body, safeToLog);
                            MAX_RETRY_COUNT++;
                        }
                    }
                } else {
                    this.addError("\n RESPONSE ERROR : < Code - " + resBody.error.code + " > < Message - " + resBody.error.message + " > < Description - " + resBody.error.data + " >");
                    if (response.getErrorMessage()) {
                        this.addError(" REQUEST ERROR : " + response.getErrorMessage());
                    }
                }
            }

            return response;
        } catch (e) {
            this.addError("ERROR EXECUTING REQUEST: " + response.getErrorMessage());
            this.addError(e.toString());
        }
    },

    getResponseBody: function(response) {
        var body = response.getBody();
        //ms.log("*** RESPONSE BODY : \n" + body + "\n *** END ***");
        var res = JSON.parse(body);
        return res;
    },

    addError: function(message) {
        if (errorMessage === "")
            errorMessage = message;
        ms.log("**** ZABBIXJS ERROR: " + message);
    },

    getErrorResponse: function(retVal) {
        retVal.status = FAILURE.toString();
        retVal['error_message'] = errorMessage;
        return retVal;
    },


    /**
     * Logging payload and event object if the additional parameter logPayloadForDebug is set to be true
     *
     * @param message
     */
    logPayload: function(message) {
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
            ms.log(ZABBIX + ": Payload: " + message);
        }
        return true;
    },

    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message) {
        if (isDebug == true || isDebug == "true") {
            ms.log(ZABBIX + ": " + message);
        }
        return true;
    },

    type: "ZabbixJS"
});
