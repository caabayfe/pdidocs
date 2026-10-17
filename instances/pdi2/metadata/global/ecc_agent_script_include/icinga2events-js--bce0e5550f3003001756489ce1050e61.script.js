var Icinga2Events_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
// 1500 per type -> total 3000, because we have 2 types(hosts and services)
var MAX_EVENTS_TO_FETCH = 1500;
var errorMessage = "";

var DEBUG = false;
var islogPayloadForDebug = false;
var SOURCE = "Icinga2";
var LAST_EVENT = 0; //Get the last event id to query from
// Because we need to store last_event time for both 'services' and 'hosts'
// we'll store them as comma separated string into the last_event field in service now
// When we split the result by ',' the first element of the array will be last HOST time,
// and the second element of the array will be last collected SERVICE time
var lastEventHost = "null";
var lastEventService = "null";
var splittedLastEventSignature;
var NOW = Date.now();
var isInitialized = true;

Icinga2Events_JS.prototype = Object.extendsObject(AProbe, {
    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     Icinga2  is active and running. This is done by probing the Icinga2  API for it's own version.
     Cases that the function follows are:
     - Icinga2  API is running and returns status code 200 -> OK
     - Icinga2  API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection : function() {

        ms.log(SOURCE + ": Connector testing connection");

        var debug = this.probe.getAdditionalParameter("debug");
        if (debug == "true" || debug == "1") DEBUG = true;
	islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");

        var retVal = {};

        try {
            var response = this.createRequest('', {});
            if (response == null) {
                this.addError("Failed to connect to Icinga2 on test connector. Response is null");
                retVal['status']  = FAILURE.toString();
                retVal['error_message'] = errorMessage;
                return retVal;
            }

            ms.log('Icinga2 Connector Test Connection response:' + response.getBody());
            ms.log('result:' + response.getStatusCode());

            if(response.getStatusCode() == 200){
                retVal['status'] = SUCCESS.toString();
            }else{
                this.addError("Failed to connect to Icinga2 on test connector.");
                this.addError(response.getErrorMessage());
                retVal['status']  = FAILURE.toString();
            }
        } catch (e) {
            ms.log(e.toString());
            this.addError(e.toString());
            retVal['status'] = FAILURE.toString();
        }

        ms.log(SOURCE + ": Connector testConnection :" + retVal['status']);

        if (retVal['status'] === FAILURE.toString()) {
            retVal['error_message'] = errorMessage;
        }

        return retVal;
    },
    /**
     * Function that the MID server uses to RUN the script. Main logic lies here.
     * This is the code that the MID Server will run on each Iteraation.
     * @returns An Object with specidfic associated Script return values [status,last_event]
     */
    execute: function() {
        ms.log(SOURCE + ": Connector: EXECUTING EVENT COLLECTION!");

        var debug = this.probe.getAdditionalParameter("debug");
        if (debug == "true" || debug == "1") DEBUG = true;
	islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");

        ms.log(" INFO | Logging Level | "+(DEBUG ? "DEBUG" : "INFO"));

        LAST_EVENT = this.probe.getParameter("last_event") || 0;
        // Array
        splittedLastEventSignature = this.splitLastEventSignature(LAST_EVENT);

        ms.log(SOURCE + ": ***** CONNECTOR EXECUTE GET EVENTS! *****");

        var retVal = {};

        var events = this.getEvents(); //retrieve all events from the target montior
        this.debug("DEBUG | QUERY EVENTS | " + events.length + " |");

        var snEvents = this.getSNEvents(events); //convert raw events to SN events
        this.debug("DEBUG | SNow EVENTS CREATED | " + snEvents.length + " |");
        if (!snEvents || snEvents.length < 1) {
            if(errorMessage.length > 0) {
                retVal['status'] = FAILURE.toString();
                retVal['error_message'] = errorMessage;
            } else {
                retVal['status'] = SUCCESS.toString();
            }

            LAST_EVENT = lastEventHost + "," + lastEventService;
            retVal['last_event'] = "" + LAST_EVENT;
            ms.log(SOURCE + ": Connector: sent no new events. Return to instance: Status=" + retVal['status'] + ". Last Discovery Signature=" + LAST_EVENT);

            return retVal;
        }

        // send all events
        var sender = SNEventSenderProvider.getEventSender();
        var successFlag = true;
        for (var i = 0; i < snEvents.length; i++) {
            successFlag = successFlag && sender.sendEvent(snEvents[i]); //send each event
	    this.logPayload("Event Object Created : "+snEvents[i]);
        }

        if (successFlag) {
            retVal['status'] = SUCCESS.toString();
            LAST_EVENT = lastEventHost + "," + lastEventService;
            retVal['last_event'] = "" + LAST_EVENT;
        } else {
            retVal['status'] = FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }

        ms.log(SOURCE + ": Connector: sent " + snEvents.length +
            " events. Return to instance: Status=" + retVal['status'] +
            ". Last Discovery Signature=" + retVal['last_event']);

        return retVal;
    },
    /**
     * Collects the events from the target monitor
     *
     * @param {Array} events - Array of objects
     *
     * @returns {Array} snEvents Formated snow events
     */
    getEvents: function () {

        var events = [];
        var hostEvents = [];
        var servicesEvents = [];
        try {
            // On the initial itteration of the script(this mean when we don't have
            // anything in 'last_event' parameter) we are collecting all the hosts which are in
            // DOWN state and all the services which belongs to hosts in UP states.
            // On every other itteration(where we have last_event time) we are collecting all the
            // hosts and services which has been changed. The collecting time starts from the last
            // biggest time from the events(this is retrieved from last_event parameter)
            if (LAST_EVENT == 0) {
                ms.log(SOURCE + ": INITIAL RUN");
                isInitialized = false;
                hostEvents = this.getResult('/objects/hosts', {
                    "filter": "host.state==1"
                });

                // Because we need to store last event time per type,
                // if we don't have any events for the current type on the Initial run
                // of the script, we are setting the current time as last event time,
                // so we'll have what to split on the next iteration
                // (this is done only on the INITIAL run for the script)
                if (hostEvents.length <= 0) {
                    lastEventHost = new Date().getTime();
                }

                servicesEvents = this.getResult('/objects/services', {
                    "filter": "host.state==0"
                });

                // Because we need to store last event time per type,
                // if we don't have any events for the current type on the Initial run
                // of the script, we are setting the current time as last event time,
                // so we'll have what to split on the next iteration
                // (this is done only on the INITIAL run for the script)
                if (servicesEvents.length <= 0) {
                    lastEventService = new Date().getTime();
                }

            } else {
                lastEventHost = parseFloat(splittedLastEventSignature[0]);
                lastEventService = parseFloat(splittedLastEventSignature[1]);

                hostEvents = this.getResult('/objects/hosts', {
                    "filter": ("host.last_state_change>" + this.getIcingaTime(lastEventHost))
                });

                servicesEvents = this.getResult('/objects/services', {
                    "filter": ("service.last_state_change>" + this.getIcingaTime(lastEventService))
                });
            }

            // We are checking the LIMITS per type and if we have more than the LIMIT
            // we are sorting the objects by 'last_state_change' ASC so we can safely
            // cut the first events till the LIMIT(currently the limit is 1500 per type)
            if (hostEvents.length > MAX_EVENTS_TO_FETCH) {
                var sortedHost = hostEvents.sort(this.compare);
                if (isInitialized) {
                    hostEvents = sortedHost.splice(0, MAX_EVENTS_TO_FETCH);
                } else {
                    // If we are on initial run(first run without last event time)
                    // we are taking the events from the newest history events
                    hostEvents = validHosts.splice(validHosts.length - MAX_EVENTS_TO_FETCH, validHosts.length);
                }
            }
            // We are checking the LIMITS per type and if we have more than the LIMIT
            // we are sorting the objects by 'last_state_change' ASC so we can safely
            // cut the first events till the LIMIT(currently the limit is 1500 per type)
            if (servicesEvents.length > MAX_EVENTS_TO_FETCH) {
                var sortedServices = servicesEvents.sort(this.compare);
                if (isInitialized) {
                    servicesEvents = sortedServices.splice(0, MAX_EVENTS_TO_FETCH);
                } else {
                    var validServices = [];
                    // We need to filter only the valid events, so to be on the safe side
                    // if we have a lot of invalid events
                    sortedServices.forEach(function (event) {
                        if (!isInitialized && event.type == "Service" && event.attrs.state == 0) {
                            return;
                        }

                        validServices.push(event);
                    }, this);

                    // If we are on initial run(first run without last event time)
                    // we are taking the events from the newest history events
                    servicesEvents = validServices.splice(validServices.length - MAX_EVENTS_TO_FETCH, validServices.length);
                }
            }

            var i = 0, ev;
            if (hostEvents.length > 0) {
		this.logPayload("HostEvents retrieved : "+JSON.stringify(hostEvents));
                lastEventHost = this.getBiggestEventsTime(hostEvents);
                for (i = 0; i < hostEvents.length; i++) {
                    ev = hostEvents[i];
                    events.push(ev);
                }
            }
            if (servicesEvents.length > 0) {
		this.logPayload("ServicesEvents retrieved : "+JSON.stringify(servicesEvents));
                lastEventService = this.getBiggestEventsTime(servicesEvents);
                for (i = 0; i < servicesEvents.length; i++) {
                    ev = servicesEvents[i];
                    events.push(ev);
                }
            }
        }catch (e) {

        }

        return events;
    },
    /**
     * Filtering the biggest time of the passed events
     *
     * @param {Array} events - Array of objects
     *
     * @returns {Number} biggestTime
     */
    getBiggestEventsTime: function(events) {
        if(events.length > 0) {
            var biggestTime = 0;
            events.forEach(function(obj) {
                var eventTime = parseFloat(obj.attrs.last_state_change);
                if(eventTime > biggestTime) {
                    biggestTime = eventTime;
                }
            }, this);
            return this.parseEventTimeMicroSeconds(biggestTime.toString());
        } else {
            return 0;
        }
    },
    /**
     * We are storing in 'last_event' 2 last times. One for the hosts
     * and one for the services(String comma separated)
     *
     * @param {String} csv - String with both last event times (for hosts and services)
     *
     * @returns {Array} result array with the both times
     */
    splitLastEventSignature: function(csv) {
        var result = [];
        csv = csv.toString();
        if(csv != 0) {
            var result = csv.split(",")
                .map(function(el) {
                    return el.trim();
                }, this);
        }

        return result;
    },
    /**
     * We have objects(events) with attribute 'last_state_change' which we need to
     * sort ASC order so we can splice(cut) the events if we have more than the LIMIT(currently 1500 per type)
     */
    compare: function(a,b) {
        if (parseFloat(a.attrs.last_state_change) < parseFloat(b.attrs.last_state_change)) {
            return -1;
        }
        if (parseFloat(a.attrs.last_state_change) > parseFloat(b.attrs.last_state_change)) {
            return 1;
        }
        return 0;
    },

    /**
     * If we have collected events from the target monitor we create snow events
     *
     * @param {Array} events - Array of objects
     *
     * @returns {Array} snEvents Formated snow events
     */
    getSNEvents: function(events) {
        // if no events were found, return
        if (!events || events.length < 1) {
            return [];
        }

        var snEvents = [];
        ms.log(SOURCE + ": INFO | CREATING SNOW EVENTS |");
        for (var i = 0; i < events.length; i++) {
            var event = this.createSNEvent(events[i]); //pass also cached information if possible, for example eventTypes
            if(!!event){
                snEvents.push(event);
            }
        }

        return snEvents;
    },
    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Object} event - Object with the collected data from Icinga2
     *
     * @returns {Object} snEvent Formated snow event
     */
    createSNEvent : function (event) { //get all cached information as well
        var snEvent = new Event();

        //Updating the Timestamp.
        var eventTime = "" + event.attrs.last_state_change;
        eventTime = this.parseEventTimeMs(eventTime);
        var snowTime = this.getSnowTime(eventTime);
        snEvent.setTimeOfEvent(snowTime);

        // On the first run(the initial one where we still don't have last_event time)
        // we are skipping, all the service events on which the hosts are '0' -> OK
        if(!isInitialized && event.type == "Service" && event.attrs.state == 0) {
            return;
        }

        var emsName = this.probe.getParameter("connector_name");
        snEvent.setEmsSystem(emsName);
        snEvent.setSource(SOURCE);

        PullConnectorCustomDomainUtil.get().populateDomain(this.probe, snEvent, event);

        var node = "";
        var text = "";
        var messageKey = "";
        var isHost = true;
        if (event.type === "Host"){
            node += event.attrs.name;
            text += "Node - " + event.attrs.name + " is " + (event.attrs.state === 0 ? "UP" : "DOWN")+"!";
            messageKey += (event.attrs.name + "_" + event.attrs.check_command);
        } else if (event.type == "Service"){
            node += event.attrs.host_name;
            text += event.attrs.last_check_result.output;
            messageKey += event.name;
            isHost = false;
        }

        snEvent.setText(text);

        snEvent.setHostAddress(node); // will be mapped to node field

        snEvent.setMessageKey(messageKey);
        //set all event fields
        var severity = this.getEventSeverity(event.attrs.state,isHost);
        snEvent.setSeverity(severity); //set severity value 1-critical to 4-warning

        var type = event.type;
        snEvent.setType(type);

        // If the event is with 'state' 0(0 for Icinga2 severity, which is 'Info'(0) severity in snow)
        // we are setting the ResolutionState to 'Closing'. For all the others severities
        // the resolutionState is set to 'New'.
        if(event.attrs.state == 0){
            snEvent.setResolutionState("Closing");
        } else {
            snEvent.setResolutionState("New");
        }

        snEvent.setMetricName(event.attrs.check_command);

        this.eventSetProperty(snEvent, "address", event.attrs.address);
        this.eventSetProperty(snEvent, "last_state_up", event.attrs.last_state_up);
        this.eventSetProperty(snEvent, "notes", event.attrs.notes);
        this.eventSetProperty(snEvent, "performance_data", event.attrs.performance_data);
        this.eventSetProperty(snEvent, "notes_url", event.attrs.notes_url);
        this.eventSetProperty(snEvent, "zone", event.attrs.zone);
        this.eventSetProperty(snEvent, "groups", event.attrs.groups);

        if (event.type === "Service"){
            this.eventSetProperty(snEvent, "output", event.attrs.last_check_result.output);
        }

        return snEvent;
    },

    /**
     * Function for setting SNow Event Additional Parameters and checking whether to set a certian property for the SNow Event creation.
     * @param event - SNow Event object
     * @param key - The key to wich the additional field will be set
     * @param value - The value to be set on that key
     */
    eventSetProperty: function (event, key, value) {
        if (!!value) {
            event.setField("u_" + key, value);
        }
        return event;
    },

    /**
     * Function for returning a mapped value for the Event Severity
     * @param key the value from Icinga2 data
     * @param {Boolean} isHost - if 'true' the events is for host. if 'false'
     * the event is for service
     * @returns {*} Returns the associated map value
     */
    getEventSeverity: function (key, isHost) {
        var map = {
            0: 5,
            1: isHost ? 1 : 4,
            2: 1,
            3: 5
        };
        return !!map[key] ? map[key] : null;
    },
    /**
     * Parse the time of event to GMT using the timestamp format till miliseconds
     *
     * @param {String} date - We are receiving the date from the event in this format
     * 1498571546.0927419662
     *
     * @returns {Number} Returns in integer format the timestamp
     */
    parseEventTimeMs: function (date) {
        var splitTime = date.split(".");
        if (splitTime.length > 1) {
            var dateTime = "" + splitTime[0] + splitTime[1].substr(0,3);
            date = parseInt(dateTime);
        } else {
            date = parseInt(date);
        }

        return date;
    },
    /**
     * Parse the time of event to GMT using the timestamp format till micro seconds
     *
     * @param {String} date - We are receiving the date from the event in this format
     * 1498571546.0927419662
     *
     * @returns {Number} Returns in integer format the timestamp
     */
    parseEventTimeMicroSeconds: function (date) {
        var splitTime = date.split(".");
        if (splitTime.length > 1) {
            var dateTime = "" + splitTime[0] + splitTime[1];
            date = parseInt(dateTime);
        } else {
            date = parseInt(date);
        }

        return date;
    },
    /**
     * Parse the time of event to GMT using the following format: 1498571546.0927419662
     * @param {Number} timestamp - 13 digits time format
     * @returns {String} Formated data in this format 1498571546.0927419662
     */
    getIcingaTime: function (timestamp) {
        timestamp = timestamp.toString();
        var time;
        if(timestamp.length > 10) {
          time = "" + timestamp.substr(0, 10) + "." + timestamp.substr(10, timestamp.length);
        }
        else {
          time = "" + timestamp.substr(0, 10);
        }
        return time;
    },
    /**
     * Parsing the date format string to UTC timezone string format: YYYY-MM-DD HH:MM:SS
     *
     * @param date - timestamp format of the date, received from the event
     * @returns {String} Returns String formatted date
     */
    getSnowTime: function (date) {
        var diff = Date.now().toString().length - date.toString().length;
        if (diff > 0)
        {
            date = date.toString();
            for (var i=0;i<diff;i++) date += "0";
        }
        date = parseInt(date);
        var d = new Date(date);
        if(d){
            // yyyy-MM-dd HH:mm:ss

            var year = "" + d.getUTCFullYear();
            var month = "" + (d.getUTCMonth() + 1);
            if (month.length === 1) {
                month = "0" + month;
            }

            var day = "" + d.getUTCDate();
            if (day.length === 1) {
                day = "0" + day;
            }

            var hour = "" + d.getUTCHours();
            if (hour.length === 1) {
                hour = "0" + hour;
            }

            var minute = "" + d.getUTCMinutes();
            if (minute.length === 1) {
                minute = "0" + minute;
            }

            var second = "" + d.getUTCSeconds();
            if (second.length === 1) {
                second = "0" + second;
            }

            return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
        } else {
            this.debug("EVENT DATE PARSE PROBLEM: " + date);
            return "";
        }
    },
    /**
     * Just call the createRequest function and checks if the request is valid
     *
     * @param method - the URI of the request
     * @param params - the parameters of the request.
     *
     * @returns {Object} The request in JSON format
     */
    getResult : function (method, params) {
        var res = [];
        try{
            var response = this.createRequest(method, params);
            //if response has code 200 (Success)
            if(response.getStatusCode() == 200){
                var resultJson = this.parseJSON(response.getBody());
		this.debug("Response body length : " + response.getBody().length());
                if (resultJson.hasOwnProperty("results")){
                    res = resultJson["results"];
                }
            }else{
                this.addError("RESPONSE STATUS ERROR No: " + response.getStatusCode());
                this.addError("RESPONSE ERROR : " + response.getBody());
            }
        }
        catch(ex){
            ms.log(ex.toString());
            this.addError(ex.toString());
        }
        return res;
    },
    /**
     * Function for generating and executing automatically a REST request
     * @param method - the URI of the request
     * @param params - the parameters of the request.
     * @returns Java object with the response.
     */
    createRequest: function(method, params) {
        var username = this.probe.getParameter("username") || "";
        var password = this.probe.getParameter("password") || "";
        var host = "" + this.probe.getParameter("host");
        var port = parseInt(this.probe.getAdditionalParameter("port")) || 8081;
        var protocol = this.probe.getAdditionalParameter("protocol") || "http";
        port = (port === 80 ? "" : (":" + port));
        var query = this.getRequestQuery(params);
        var url = protocol + "://" + host + port + "/v1" + method + query;
        url = encodeURI(url);
        this.debug("HTTP URL: " + url);
        this.debug("DEBUG | REQUEST QUERY | " + query);
        var request = new HTTPRequest(url);
        request.setBasicAuth(username, password);
        request.addHeader('Accept', 'application/json');
        request.addHeader('Content-Type', 'application/json');
        try {
            // Return response of the request GET
            return request.get();
        }
        catch (e) {
            ms.log(e.toString());
            this.debug(e.toString());
        }
    },
    /**
     * Checks the type of the request and call the setQuery function
     *
     * @param params - the parameters of the request.
     *
     * @returns {String} returns the query string for the request
     */
    getRequestQuery: function (params) {
        var q = "?";
        var count = 0;
        for (var p in params) {
            count++;
            q += (p + "=" + params[p] + (count >= 2 ? "&" : ""));
        }

        if (q.length < 2) q = "";

        return q;
    },
    /**
     * Concatenating a message to errorMessage variable
     *
     * @param message
     */
    addError : function(message){
        if (errorMessage === "")
            errorMessage = message;
        else
            errorMessage += "\n" + message;
        ms.log(message);
    },
    /**
     * Parsing the response from string to JSON
     *
     * @param response - response from the http request
     * @returns {Object} the result from the response in JSON format
     */
    parseJSON : function (response) {
        var parser = new JSONParser();
        var resultJson =  parser.parse(response);
        this.debug("Connector: Found " + resultJson.results.length + " records");
        return resultJson;

    },
    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message){
        if (DEBUG === true || DEBUG === "true"){
            ms.log(SOURCE + " : " + message);
        }
        return true;
    },
    logPayload: function(message) {
	if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
	    ms.log(SOURCE + " Payload : " + message);
	}
	return true;
    },

    type: "Icinga2Events_JS"
});
