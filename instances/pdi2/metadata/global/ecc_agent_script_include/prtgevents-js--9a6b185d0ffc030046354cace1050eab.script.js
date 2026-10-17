var PrtgEvents_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var encoder = new JSON();

var SOURCE = "PRTG",
    LIMIT = 3000,
    errorMessage = "",
    isInitialized = false,
    LAST_EVENT_TIME = "",
    LAST_EVENT_ID = "",
    LAST_TYPE_RAW = "",
    LAST_DATETIME_RAW = "",
    // This will be array except the initial run
    LAST_SIGNATURE = "",
    isDebug = false,
    eventCounter = 0,
    isTesting = false,
    eventUrl,
	dateFormatParam;

PrtgEvents_JS.prototype = Object.extendsObject(AProbe, {

    /**
     testConnection : The function is meant to establish if the connection the RESTful API from
     PRTG  is active and running. This is done by probing the PRTG  API for it's own version.
     Cases that the function follows are:
     - PRTG  API is running and returns status code 200 -> OK
     - PRTG  API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection: function () {
        ms.log("*** PRTG  CONNECTOR : TEST CONNECTION ***");
        var retVal = {}; //return object for the function
        isTesting = true;
        try {
            var testConn = this.getResult("GET", "/api/table.xml", {
                info: [{key: "content", value: "sensortree"}]
            });

            if (!!testConn) {
                ms.log("INFO | TEST DATA:" + testConn);
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

        ms.log(SOURCE + ": Connector testConnection:" + retVal["status"]);

        return retVal;
    },

    /**
     * Function that the MID server uses to RUN the script. Main logic lies here.
     * This is the code that the MID Server will run on each Iteraation.
     * @returns An Object with specidfic associated Script return values [status,last_event]
     */
    execute: function () {
        ms.log("***** PRTG  CONNECTOR EXECUTE GET EVENTS! *****");
        var retVal = {};
        var emsName = this.probe.getParameter("connector_name");
        var startScriptTime = new Date();

        isDebug = "" + this.probe.getAdditionalParameter("debug");

        var prtgEvents = this.getPrtgEvents();

        this.createSNEvents(prtgEvents, emsName);

        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        if(eventCounter > 0) {
            retVal["last_event"] = LAST_EVENT_ID + "," + LAST_EVENT_TIME + "," + LAST_TYPE_RAW + "," + LAST_DATETIME_RAW;
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);

            ms.log(SOURCE + ": EventCollector handle total of " + eventCounter + " events in " + 
            totalDurationSec + " seconds (" + Number(eventCounter/totalDurationSec).toFixed(3) + " per second)");
        }

        ms.log("***** PRTG  CONNECTOR FINISH *****");

        return retVal;
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
            result = lastEventSignature.split(",")
                        .map(function(el) {
                            return el.trim();
                        }, this);
        }


        return result;
    },

    /**
     * Here the user can specify additional columns to be retrieved. 
     * If multiple columns are specified, the user must separate them via comma.
     *
     * @param additionalParamCsv - Additional parameter with metrics in csv format. Default is false
     *
     * @returns {Array} [...] Array with the values from additionalParamCsv
     */
    getArrayFromCsv: function(additionalParamCsv) {
        this.debug(SOURCE + ": Received additional param: " + additionalParamCsv);
        var result = [];

        if(additionalParamCsv != "false" || additionalParamCsv != "null") {
            result = additionalParamCsv.split(",")
                     .map(function(element) {
                         return element.trim();
                     });
        }

        this.debug(SOURCE + ": Formated getArrayFromCsv: " + result);

        return result;
    },

    /**
     * Collects the PRTG events
     * @returns {Array} [...] with all the collected events
     */
    getPrtgEvents: function() {
        var response,
            addColumns,
            addColumnsFiltered,
            startDate,
            formattedLastEvent,
            result;
        // LAST_SIGNATURE contains only time stamp on the INITIAL RUN
        // and on every next run we are storing the ID as 1st element, timestamp as 2nd,
        // type_raw as 3rd and datetime_raw as 4th
        LAST_SIGNATURE = this.getLastEventSignature();
		dateFormatParam=this.probe.getAdditionalParameter("date_format");
		if(dateFormatParam==null || dateFormatParam==''){
			dateFormatParam="MM/dd/yyyy hh:mm:ss a";
		}
        if(!isInitialized) {
            //Initial run where we don't have stored ID
            LAST_EVENT_TIME = LAST_SIGNATURE;
        } else {
            LAST_EVENT_ID = LAST_SIGNATURE[0];
            LAST_EVENT_TIME = LAST_SIGNATURE[1];
            LAST_TYPE_RAW = LAST_SIGNATURE[2];
            LAST_DATETIME_RAW = LAST_SIGNATURE[3];
        }
        startDate = this.formatDate(LAST_EVENT_TIME);
        addColumns = "" + this.probe.getAdditionalParameter("add_columns");
        addColumnsFiltered = this.getArrayFromCsv(addColumns);
        var cols = ["parent","name","type","objid","tags","message","status","priority","datetime","actions","baselink","basetype","modifiedby"];
        for (var i=0;i<addColumnsFiltered.length;i++) cols.push(addColumnsFiltered[i]);
        // PRTG API by default sorts the data by DESC order(we can't change this)
        // So for the initial run it's ok, because we are aiming to collect
        // the newest historical events till limit 3000, but for the next runs
        // we need to apply bigger limit so to be sure that we are collecting everything
        // and then if we are out of the limit 3000 to splice only the oldest 3000 events from
        // the received data.
        if(isInitialized) {
			LIMIT=this.probe.getAdditionalParameter("prtg_api_fetched_events_num");
			if(LIMIT==null || LIMIT==''){
				LIMIT = 50000;
			}	
        }
        response = this.getResult("GET", "/api/table.json", {
            info: [
                {key: "filter_dstart", value: startDate},
                {key: "content", value: "messages"},
                {key: "columns", value: cols},
                {key: "count", value: LIMIT}
            ]
        });

        result = response["messages"];
        // If the result is bigger than 3000 and we are not in initializing state(first run)
        // we need to cut the oldest 3000 events from the result, so because the PRTG by 
        // default is ordering by DESC(can't change) we just splice(cut) the last 3000 events
        if(result.length > 3000 && isInitialized) {
            // Because there are a lot of events which are not in the mapping and we need
            // to drop them(but from the whole collected events >3000), so to be on the safe side if we get 3K not valid events.
            // So we are taking all the events from the request, filter them and then we
            // are making the service now events
            var validEvents = [];

            result.forEach(function(event) {
                var status, snSeverity, basetype;

                status = "" + event["status"];
                basetype = "" + event["basetype"];
                snSeverity = this.getSeverity(status);

                if(snSeverity == null || basetype != "sensor") {
                    return;
                }

                validEvents.push(event);

            }, this);

            if(validEvents.length > 3000) {
                result = validEvents.splice(validEvents.length - 3000, validEvents.length);
            } else {
                result = validEvents;
            }
            
        }

        return result;
    },

    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Array} collectedData - Array of collected Events/Alerts with all the info
     * @param {String} emsName - The name of the connector
     */
    createSNEvents: function (collectedData, emsName) {
         var sender = SNEventSenderProvider.getEventSender();
        var lengthEvent = collectedData.length ;
        if(lengthEvent <= 0){
			ms.log("PRTG: number of events is zero, so returning");
			return;
        }
		try{
			while(--lengthEvent >= 0){
				var sEvent = Event();
				var event = collectedData[lengthEvent];
				var node,
					description,
					descriptionFormatted,
					resource,
					messageKey,
					metricName,
					eventTimeString,
					status,
					basetype = "" + event["basetype"],
					checkList,
					snSeverity,
					resolutionState,
					eventTimeDateTimestamp;
				if(dateFormatParam!="MM/dd/yyyy hh:mm:ss a"){
					var format=new SimpleDateFormat(dateFormatParam);
					eventTimeString=format.parse(""+event["datetime"]);
					eventTimeDateTimestamp=eventTimeString.getTime();
				}else{
					eventTimeString=""+event["datetime"];
					eventTimeDateTimestamp=new Date(eventTimeString).getTime();
				}
				if(isInitialized) {
					// We don't want to collect same event from the previous run so
					// here we are checking on objid,type_raw,datetime_raw and datetime, and if
					// they are the same we are skipping this event
					if(LAST_EVENT_ID == event["objid"].toString() && LAST_EVENT_TIME >= eventTimeDateTimestamp
					   && LAST_TYPE_RAW == event["type_raw"].toString() && LAST_DATETIME_RAW >= event["datetime_raw"].toString()) {
						continue;
					}
				}

				PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

				status = "" + event["status"];
				snSeverity = this.getSeverity(status);
				// If the 'status' from the event is not in the mapping from 'getSeverity' function
				// we are setting snSeverity to 'null' and skips the event
				if(snSeverity == null) {
					continue;
				}
				// We are setting resolution state to 'New' for all non-info severities
				// (snow info severity is '5'). If the event severity is info we are setting
				// the resolutionState to 'Closing'
				if(snSeverity == 5) {
					resolutionState = "Closing";
				} else {
					resolutionState = "New";
				}
				if(basetype == "sensor") {
					node = event["parent"];
				} else {
					continue;
				}
				resource = "" + event["name"];
				messageKey = "" + event["objid"];
				metricName = "" + event["tags"];
				description = "" + event["message"];
				descriptionFormatted = this.extractDescriptionString(description);
				if(parseInt(eventTimeDateTimestamp) >= parseInt(LAST_EVENT_TIME)) { //> to >=
					LAST_EVENT_TIME = eventTimeDateTimestamp;
					LAST_EVENT_ID = event["objid"].toString();
					LAST_TYPE_RAW = event["type_raw"].toString();
					LAST_DATETIME_RAW = event["datetime_raw"].toString();
				}else{
					//this event is older than last_event_time that neednot be inserted
					continue;
				}
				sEvent.setHostAddress(node);
				sEvent.setType(basetype);
				sEvent.setResource(resource);
				sEvent.setSeverity(snSeverity);
				sEvent.setResolutionState(resolutionState);
				sEvent.setTimeOfEvent(this.getDate(""+event["datetime"]));
				sEvent.setText(descriptionFormatted);
				sEvent.setMetricName(metricName);
				sEvent.setMessageKey(messageKey);
				sEvent.setEmsSystem(emsName);
				sEvent.setSource(SOURCE);
				checkList = ["basetype", "parent", "name", "type", "objid", "tags", "message", "datetime", "status"];
				for(var attribute in event) {
					attribute += "";
					if(checkList.indexOf(attribute) <= -1) {
						this.eventSetProperty(sEvent, attribute, event[attribute]);
					}
				}
				this.eventSetProperty(sEvent, "url", eventUrl);
				try {
					sender.sendEvent(sEvent);
				}
				catch (e) {
					ms.log(e.toString());
					this.addError(e.toString());
				}
			eventCounter++;
			}
		}catch (e) {
            this.addError(e.toString());
        }
    },

    /**
     * Getting lastEventSignature. If lastEventSignature is empty, we init it
     * from the current (date - days_from) where days_from is additional param from the user
     *
     * @returns {String} lasteventSignature - if we are in the initial run
     * @returns {Array} lasteventSignature - if we are in scheduling runs where the 1st element is 
     * the ID and the 2nd element is the time
     */
    getLastEventSignature: function() {
        // timestamp for testing purposes 1499063616000
        var lastEventSignature = "" + this.probe.getParameter("last_event");
        // Just to be on the safe side
        if(lastEventSignature == null || lastEventSignature == "null") {
            lastEventSignature = 0;
        } else {
            // Here 'lastEventSignature' become array (first el is the ID, second is the time, third is type_raw and 4th is
            // datetime_raw)
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
                ms.log("Connector parameter 'days_from' is a out of range(0-100) or invalid. Set default value to collect events from a week earlier (7 days).");
            }

            now =  new Date();
            now.setDate(now.getDate() - parseInt(daysFrom));

            // lastEventSignature is empty, we will start to retrieved from now
            lastEventSignature =  now.getTime();
            ms.log(SOURCE + ": EventConnector: last_event was empty. Initializing...lastEventSignature: " + lastEventSignature);
        }
        else {
            isInitialized = true;
            ms.log(SOURCE + ": EventConnector: last_event was as expected. Starting the fetch from " + lastEventSignature);
        }

        return lastEventSignature;
    },
    /**
     * The message is between html tags so we need only the string between the tags
     *
     * @param input - the whole string message
     * @returns {String} Returns String with extracted message. If there is no message between
     * we are returning empty string
     */
    extractDescriptionString: function(input) {
        var splitByFirstPart,
            splitBySecondPart,
            result;

        splitByFirstPart = input.split(/">/);
        splitBySecondPart = splitByFirstPart[1].split(/<div class/);
        result = splitBySecondPart[0];
        
        return result;
    },

    /**
     * Function to parse a Epoch time timestamp to a String formatted date.
     * @param input - string format date. Example: 7/20/2017 9:37:57 AM
     * @returns {String} Returns String formatted date
     */
    getDate: function(input){
		var d;
		if(dateFormatParam!="MM/dd/yyyy hh:mm:ss a"){
			var format=new SimpleDateFormat(dateFormatParam);
			d=new Date(format.parse(""+input).getTime());
			
		}else{
			d = new Date(input);
		}
        var year = "" + d.getUTCFullYear();
        var month = "" + (d.getUTCMonth() + 1); if (month.length == 1) { month = "0" + month; }

        var day = "" + d.getUTCDate(); if (day.length == 1) { day = "0" + day; }

        var hour = "" + d.getUTCHours(); if (hour.length == 1) { hour = "0" + hour; }

        var minute = "" + d.getUTCMinutes(); if (minute.length == 1) { minute = "0" + minute; }

        var second = "" + d.getUTCSeconds(); if (second.length == 1) { second = "0" + second; }
        return (year + '-' + month + '-' +  day + ' ' + hour + ':' + minute + ':' + second);
    },

    /**
     * Format the date into string format as per pattern
     *
     * @param timeInMilliseconds
     * @returns {String} The formated date as per pattern
     */
    formatDate: function(timeInMilliseconds) {
		var format = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");
        var lastMetricDate = new Date(parseInt(timeInMilliseconds));
        var dateFormat = format.format(lastMetricDate);
        this.debug("dateformat: " + dateFormat.toString());
        return "" + dateFormat;
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
     *
     * @param key the value from PRTG data
     * @returns {*} Returns the associated map value
     */
    getSeverity: function(key){
        var severityMap = {
            "Up": 5,
            "DownAcknowledged": 5,
            "Active": 5,
            "Paused (License Limit)": 4,
            "Paused": 4,
            "Resuming": 5,
            "Collecting": 5,
            "PausedbyDependency": 4,
            "PausedbySchedule": 4,
            "PausedbyLicense": 4,
            "PausedUntil": 4,
            "PausedbyUser": 4,
            "NoProbe": 4,
            "Unknown": 4,
            "Warning": 4,
            "Unusual": 4,
            "DownPartial": 2,
            "Down": 1
        };

        if(severityMap.hasOwnProperty(key)) {
            return severityMap[key];
        }
        else {
            ms.log(SOURCE + ": The severity is not in the mapping so we are skipping this event by purpose");
            // If the severity from the event is not in the mapping above, we will skip this event
            return null;
        }
    },

    /**
     * Just call the createRequest function and checks if the request is valid
     *
     * @param type - the type of the request [GET]
     * @param method - the URI of the request
     * @param params - the parameters of the request. For ex: table name, attributes, startDate
     *
     * @returns {Object} The request in JSON format or XML format(only for the test connection)
     */
    getResult : function (type, method, params) {
        var req = this.createRequest(type, method, params);
        if(!!req){
			return this.extractBody(req);
        }
        return [];
    },
	
	extractBody : function (req) {
		// If we are in testing connection. 
        // The received response is in XML
        if(isTesting) {
			return req.getBody();
        } 
		else {
			return this.parseJSON(req);
        }
	},


    /**
     * Function for generating and executing automatically a REST request
     * @param type - the type of the request [GET]
     * @param method - the URI of the request 
     * @param params - the parameters of the request.
     * @returns Java object with the response.
     */
    createRequest: function (type, method, params) {
        var response, body;
        var host = this.probe.getParameter("host"); //get host url from SNow
        var protocol = this.probe.getAdditionalParameter("protocol") || "http"; 
        var port = this.probe.getAdditionalParameter("port") || 80; //get the set port from the SNow Connector Definition Instance
        var username = this.probe.getParameter("username") || "";
        var password = this.probe.getParameter("password") || "";
        port = (port == 80 ? "" : (":" + port));
        var url = protocol + "://" + host + port + method; // Build the url for the request
        // Need this url for the additional info of the events
        eventUrl = protocol + "://" + host + port;
        var query = this.getRequestQuery(type, params, username, password);

        url += query;

        url = encodeURI(url);
        this.debug("URL:" + url);
		
        var request = new HTTPRequest(url);

        if(!isTesting) {
            request.addHeader('Content-Type', 'application/json');
        }
        try {
            if(type == "GET"){
                response = request.get();
				body = this.extractBody(response);
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
     * @param type - the type of the request [GET]
     * @param params - the parameters of the request.
     * @param username
     * @param password
     *
     * @returns {String} returns the query string if the type of the request is GET
     */
    getRequestQuery: function (type, params, username, password) {
        var q;
        if(type == "GET") {
            q = this.setQuery(type, params, username, password);
            return q;
        } else {
            ms.log(SOURCE + ": The type of the request is not correct. Please check");
        }
        
    },

    /**
     * Set the query
     *
     * @param type - the type of the request
     * @param params - the parameters of the request. For ex: table-name, attributes, startDate
     * @param username
     * @param password
     *
     * @returns {String} returns the concatenated query string
     */
    setQuery: function(type, params, username, password) {
        if(type == "GET") {
            var q = "?";

            if(params.hasOwnProperty("info")) {
                params.info.push({key: "username", value: username}, {key: "passhash", value: password});
                params.info.forEach(function(el, index) {
                    if(index == 0) {
                        q += el.key + "=" + el.value;
                    } else {
                        q += "&" + el.key + "=" + el.value;
                    }
                }, this);
            }

            return q;
        } else {
            ms.log(SOURCE + ": Not valid type of the request");
        }
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
        ms.log("**** PRTG JS ERROR: "+message);
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

    type: "PrtgEvents_JS"
});
