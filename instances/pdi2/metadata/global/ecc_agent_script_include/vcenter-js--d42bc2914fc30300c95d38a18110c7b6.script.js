var vCenter_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var StringUtil = Packages.com.glide.util.StringUtil;
var encoder = new JSON();

var SEVERITY_MAP = {
	"gray" : 4,
	"green" : 5,
	"yellow" : 4,
	"orange" : 2,
	"red": 1
};

var STATE_MAP = {
	"green" : "Closing",
	"gray" : "New",
	"yellow" : "New",
	"orange" : "New",
	"red" : "New"
};
var objectMissingFlag = false;
var SOURCE = "vCenter",
    SNLIMIT = 1000,
    errorMessage = "",
    AUTH_TOKEN = "",
    isDebug = false,
    islogPayloadForDebug = false,
    // Need this flag, because the response from the test connection is html
    // and needs different parsing
    isTestConnection = false,
    eventCounter = 0,
	SESSION = null,
	UUID = null,
	LAST_EVENT_SIGNATURE = 0,
	LAST_EVENT_KEY = null;

vCenter_JS.prototype = Object.extendsObject(AProbe, {

    /**
     testConnection : The function is meant to establish if the connection the SOAP API from
     vCenter is active and running. This is done by probing the vCenter API for it's own version.
     Cases that the function follows are:
     - vCenter API is running and returns status code 200 -> OK
     - vCenter API is not running, or no connection on the selected host is available, or Port(proxy)
     hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
     from the response, and also indicate the Status Code of the response -> FAILURE
     */
    testConnection: function () {
        ms.log("*** vCenter CONNECTOR : TEST CONNECTION ***");
        var retVal = {}; //return object for the function
        isTestConnection = true;
        try {
            // Retrieving the token in global variable AUTH_TOKEN
            this.authToken();

            var testConnetion = this.getCurrentTime();

            if (!!testConnetion) {
                // Printing the whole JSON, because we don't need the data. Using it just to 
                // test the connection
                ms.log("INFO | TEST DATA:" + JSON.stringify(testConnetion));
            }
        } catch (e) {
			ms.log(JSON.stringify(e));
            this.addError(e.toString());
            retVal["status"] = FAILURE.toString();
        }

        // We need to logout the current token
        this.authTokenSignOut();
        
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
     * @returns An Object with specidfic associated Script return values [status,last_event]
     */
    execute: function () {
		this.populateFields();
		objectMissingFlag = false;
        var retVal = {};
        ms.log("***** vCenter CONNECTOR EXECUTE GET EVENTS! *****");
        var startScriptTime = new Date();
        var emsName = this.probe.getParameter("connector_name");
		isDebug = "" + this.probe.getAdditionalParameter("debug");
		//ms.log("isDebug: " + isDebug);
		islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");
		//ms.log("islogPayloadForDebug: " + islogPayloadForDebug);
        
		// Retrieve the token
        this.authToken();

		var vCenterEvents = null;
		if (LAST_EVENT_SIGNATURE) {
			ms.log("Querying events for next runs");
			// Getting the events
			vCenterEvents = this.getvCenterEvents();
		} else {
			ms.log("Querying events for first run");
			UUID=this.retrieveServiceContent();
			this.createCollectorForEvents();
			this.setCollectorPageSize();
			this.resetCollector();
			vCenterEvents = this.readNextEvents();
		}

		this.populateAlarms(vCenterEvents);

        // Handling all the collected events and send them to service now
        if(vCenterEvents.length > 0) {
            var lastEvent = this.createSNEvents(vCenterEvents, emsName);
        } else {
            this.debug("No new info events");
        }

        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        // We need to logout the current token
        this.authTokenSignOut();

        if(eventCounter > 0) {
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);

            ms.log(SOURCE + ": EventCollector handled total of " + eventCounter + " events in " + 
            totalDurationSec + " seconds (" + Number(eventCounter/totalDurationSec).toFixed(3) + " per second)");
        } else {
            ms.log(SOURCE + ": NO NEW EVENTS");
        }

        ms.log("***** vCenter CONNECTOR FINISH *****");

        retVal["last_event"] = LAST_EVENT_SIGNATURE+","+LAST_EVENT_KEY+","+UUID;

        return retVal;
    },

	populateFields: function() {
		ms.log("entering populating fields");
		if (!this.probe.getParameter("last_event")) {
			ms.log("last_event is empty: connector fisrt run");
			return;
		}
		
		this.debug("last_event exists");

		var lastEventField = this.probe.getParameter("last_event");

		if (lastEventField == "0" || lastEventField == "null") {
			return;
		}
		
		this.debug("lastEventField="+lastEventField);

		var parts = lastEventField.split(",");

		if (!parts[0]) {
			return;
		}

		LAST_EVENT_SIGNATURE = parts[0]+"";

		if (parts.length == 1) {
			return;
		}

		LAST_EVENT_KEY = parts[1];

		UUID = parts[2];
	},

	populateAlarms: function(events) {
		var alarmIds = this.getAlarmIds(events);

		if (!alarmIds.length) {
			return;
		}

		var alarms = this.getAlarms(alarmIds);

		if(alarms){

		this.populateCounters(alarms);
		this.addAlarms(events, alarms);
		}
	},

	populateCounters: function(alarms) {
		var counterIds = this.getCounterIds(alarms);
		
		if (!counterIds) {
			return;
		}

		var counters = this.getCounters(counterIds);

		for (var i in alarms) {
			var alarm = alarms[i];

			this.addCounters(alarm, counters);
		}
	},

	getCounterIds: function(alarms) {
		var counterIds = [];

		for (var i in alarms) {
			var alarm = alarms[i];

			this.normalizeField(alarm, "propSet");
			var propSets = alarm.propSet;
			
			if (!propSets.length) {
				continue;
			}
			for (var j in propSets) {
				 var propSet = propSets[j];
				
				// I don't know why but it happens
				if (!propSet) {
					continue;
				}
				this.normalizeField(propSet.val, "expression");
				var expressions = propSet.val.expression;

				for (var k in expressions) {
					var expression = expressions[k];
					
					if (expression) {
						if (expression.metric && expression.metric.counterId) {
							counterIds.push(expression.metric.counterId);
						}
					}
				}
			}
		}

		return counterIds;
	},

    normalizeField: function(obj, field) {
		var subObj = obj[field];

		var result = null;
        if(Object.prototype.toString.call(subObj) == "[object Array]") {
            result = subObj;
        } else {
			result = [];
            result.push(subObj);
        }

		obj[field] = result;
    },

	getCounters: function(counterIds) {
		var countersObj = {};

		var body = this.createRequestBody("queryPerfCounter", {counters: counterIds});

        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

		this.normalizeField(responseJson["soapenv:Body"]["QueryPerfCounterResponse"], "returnval");
		var counters = responseJson["soapenv:Body"]["QueryPerfCounterResponse"]["returnval"];

		for (var i in counters) {
			var counter = counters[i];

			countersObj[counter.key] = counter;
		}

		return countersObj;
	},

	addCounters: function(alarm, counters) {
		var propSet = Object.prototype.toString.call(alarm.propSet) == "[object Array]" ? alarm.propSet[0] : alarm.propSet;
		var expressions = propSet.val.expression;

		for (var i in expressions) {
			var expression = expressions[i];

			if (expression) {
				if (!expression.metric) {
					continue;
				}

				var counterId = expression.metric.counterId;

				if (!counterId) {
					continue;
				}

				expression.metric.counter = counters[counterId];
			}
		}
	},

	getAlarmIds: function(events) {
		var alarmIdSet = {};

		for (var i in events) {
			var event = events[i];

			if (!event.alarm) {
				continue;
			}

			var alarmId = this.getAlarmId(event);

			alarmIdSet[alarmId] = true;
		}

		alarmIds = [];

		for (i in alarmIdSet) {
			alarmIds.push(i);
		}

		return alarmIds;
	},

	getAlarmId: function(event) {
		return event.alarm.alarm["#text"];
	},

	getAlarms: function(alarmIds) {
		var alarmsObj = {};

		var body = this.createRequestBody("retrievePropertiesEx", {alarms: alarmIds});

        var response = this.createRequest(body);
       if(response){
			var responseJson = this.normalizeObjects(response);
			var returnval = responseJson["soapenv:Body"]["RetrievePropertiesExResponse"]["returnval"];
			this.normalizeField(returnval, "objects");
			var alarms = returnval["objects"];
			for (var i in alarms) {
				var alarm = alarms[i];
				alarmsObj[alarm["obj"]["#text"]] = alarm;
			}
			return alarmsObj;
        }
		return null;
	},

	addAlarms: function(events, alarms) {
		for (var i in events) {
			var event = events[i];
			var alarmObj = event.alarm;
			if (!alarmObj) {
				continue;
			}
			var alarm = alarms[alarmObj["alarm"]["#text"]];
			alarmObj.alarm = alarm;
		}
		ms.log("Done mapping.");
	},

    /**
     * Function for getting and managment of the AUTH_TOKEN that is needed for every request made.
     * @returns {*} a String token ID
     */
    authToken: function () {
		this.debug("Logging in");
		
        var username = StringUtil.escapeHTML(this.probe.getParameter("username") || "");
        var password = StringUtil.escapeHTML(this.probe.getParameter("password") || "");
        var body = this.createRequestBody("login", {
            "user": username,
            "password": password
        });

        var response = this.createRequest(body, false);

        var cookie = response.getHeader('Set-Cookie');

        AUTH_TOKEN = cookie;
		this.debug("Login successful. Current auth token is: " + AUTH_TOKEN);
    },

	createCollectorForEvents: function() {
		var body = this.createRequestBody("createCollectorForEvents", {});

        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

		SESSION = responseJson["soapenv:Body"]["CreateCollectorForEventsResponse"]["returnval"]["#text"];
		this.debug("Session: "+JSON.stringify(SESSION));
	},

    authTokenSignOut: function() {
		var body = this.createRequestBody("logout", {token: AUTH_TOKEN});
		var response = this.createRequest(body);

		if(response.getStatusCode() == 200) {
			this.debug("Current token: " + AUTH_TOKEN + " was successfully logout!");
		} else {
			this.debug("Current token: " + AUTH_TOKEN + "There was a problem with loging out the token!");
		}
    },

    getCurrentTime: function() {
        var body = this.createRequestBody("currentTime", {});
        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

        return responseJson;
    },

    /**
     * Collects all New Events
     * @returns {Array} [...] with all the Events
     */
    getvCenterEvents: function() {
        var params = {
            startTime: this.buildTimeStart(LAST_EVENT_SIGNATURE)
        };

		this.debug("Creating queryEvents body");
        var body = this.createRequestBody("queryEvents", params);
        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

        if(responseJson.hasOwnProperty("soapenv:Body")) {
            // Array of objects
			this.normalizeField(responseJson["soapenv:Body"]["QueryEventsResponse"], "returnval");
            responseJson = responseJson["soapenv:Body"]["QueryEventsResponse"]["returnval"];
        } else {
            responseJson = [];
        }

        return responseJson;
    },

    buildTimeStart: function(timestamp) {
        var dateObj;
        var result;
        var microsecondsToAdd;

        if(timestamp.length > 13) {
            microsecondsToAdd = timestamp.slice(13, timestamp.length);
			timestamp = timestamp.slice(0, 13);
        } else {
            ms.log(SOURCE + ": Wrong timestamp length in buildTimeStart. Should be 16 digits lenght(till microseconds)! Number is " + timestamp);
        }

        dateObj = new Date(parseInt(timestamp, 10));

        if(!microsecondsToAdd) {
            microsecondsToAdd = "000";
        }

        result = dateObj.toJSON().replace("Z", microsecondsToAdd + "Z");

        return result;
    },

    convertStingDateToTimestamp: function(dateString) {
        var arr = [];
        var result;
        var microseconds;
        var concatDate;

        arr = dateString.split(".");
		
		if(!arr[1]) {
			arr[1] = "";
			arr[0] = arr[0].replace("Z", "");
		}

        arr[1] = arr[1].replace("Z", "");

        if(arr[1].length > 3) {
            microseconds = arr[1].slice(3, arr[1].length);
            arr[1] = arr[1].slice(0, 3);
        } else if(arr[1].length <= 3) {
            while(arr[1].length < 3) {
                arr[1] += "0";
            }

            microseconds = "000";
        }

        concatDate = arr[0] + "." + arr[1] + "Z";
        result = new Date(concatDate).getTime() + microseconds;

        if(result.length < 16) {
            while(result.length < 16) {
                result += "0";
            }
        }

        return result;
    },

	readNextEvents: function() {
		var body = this.createRequestBody("readNextEvents", {});
        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

		this.normalizeField(responseJson["soapenv:Body"]["ReadNextEventsResponse"], "returnval");
		return responseJson["soapenv:Body"]["ReadNextEventsResponse"]["returnval"];
	},

	getResource: function(event) {
		if (event.entity.name) {
			if (event.entity.entity["@type"]) {
				return event.entity.entity["@type"]+" "+event.entity.name;
			}
			return event.entity.name;
		}

		if (event.vm.name) {
			return event.vm.name;
		}

		if (event.datacenter.name) {
			return event.datacenter.name;
		}

		if (event.ds.name) {
			return event.ds.name;
		}

		if (event.dvs.name) {
			return event.dvs.name;
		}

		if (event.computeResource) {
			return event.computeResource;
		}

		if (event.componentName) {
			return event.componentName;
		}
	},

	retrieveServiceContent: function() {
        var body = this.createRequestBody("retrieveServiceContent", {});
        var response = this.createRequest(body);
        var responseJson = this.normalizeObjects(response);

		responseJson = responseJson["soapenv:Body"]["RetrieveServiceContentResponse"];

		if (responseJson.returnval && responseJson.returnval.about && responseJson.returnval.about.instanceUuid) {
			ms.log("json uuid="+JSON.stringify(responseJson.returnval.about.instanceUuid));
			return responseJson.returnval.about.instanceUuid;
		}
	},

	setCollectorPageSize: function() {
        var body = this.createRequestBody("setCollectorPageSize", {});
        this.createRequest(body);
	},

	resetCollector: function() {
        var body = this.createRequestBody("resetCollector", {});
        this.createRequest(body);
	},

    createRequestBody: function(method, params) {
        var startEnvelop, endEnvelop, header, startBody, endBody, bodyParams, requestBody;

		if (this.probe.getAdditionalParameter("collect_stateless_events") == "true") {
			this.debug("collect_stateless_events=true");
		}
        startEnvelop = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:vim25">\n'; 
        endEnvelop = '</soapenv:Envelope>\n';
        header = '<soapenv:Header/>\n'; 
        startBody = '<soapenv:Body>\n';
        endBody = '</soapenv:Body>\n';

        if(method === "login") {
            bodyParams = '<urn:Login>\n' + 
            '<urn:_this type="SessionManager">SessionManager</urn:_this>\n' + 
            '<urn:userName>' + params.user + '</urn:userName>\n' + 
            '<urn:password>' + params.password + '</urn:password>\n' + 
            '</urn:Login>\n';
        } else if(method === "currentTime") {
            bodyParams = '<urn:CurrentTime>\n' +
            '<urn:_this type="ServiceInstance">ServiceInstance</urn:_this>\n' + 
            '</urn:CurrentTime>\n';
        } else if(method === "logout") {
            bodyParams = '<urn:Logout>\n' + 
            '<urn:_this type="SessionManager">SessionManager</urn:_this>\n' + 
            '</urn:Logout>\n';
        } else if(method === "queryEvents") {
			var filter = this.probe.getAdditionalParameter("collect_stateless_events") == "true" ? "" : '<urn:eventTypeId>AlarmStatusChangedEvent</urn:eventTypeId>\n'+
				 '					<urn:eventTypeId>AlarmClearedEvent</urn:eventTypeId>\n';
            // If we are not in the first run, filtering the events by time
            if(LAST_EVENT_SIGNATURE) {
                bodyParams = '<urn:QueryEvents>\n' + 
                '<urn:_this type="EventManager">EventManager</urn:_this>\n' +
                '<urn:filter>\n' +
                '<urn:time>\n' + 
                '<urn:beginTime>' + params.startTime + '</urn:beginTime>\n' + 
                '</urn:time>\n' +
				filter+
                '</urn:filter>\n' + 
                '</urn:QueryEvents>\n';
            } else {
                bodyParams = '<urn:QueryEvents>\n' + 
                '<urn:_this type="EventManager">EventManager</urn:_this>\n' +
                '<urn:filter>\n' +
					filter+
                '</urn:filter>\n' + 
                '</urn:QueryEvents>\n'; 
            }
        } else if(method === "retrieveServiceContent") {
			bodyParams = '<urn:RetrieveServiceContent>\n'+
							 '<urn:_this type="ServiceInstance">ServiceInstance</urn:_this>\n'+
						  '</urn:RetrieveServiceContent>\n';
		} else if(method === "createCollectorForEvents") {
			var filter = this.probe.getAdditionalParameter("collect_stateless_events")  == "true" ? "<urn:filter/>\n" : '<urn:filter>\n'+
								 '<urn:eventTypeId>AlarmStatusChangedEvent</urn:eventTypeId>\n'+
				 '					<urn:eventTypeId>AlarmClearedEvent</urn:eventTypeId>\n'+
							 '</urn:filter>\n';
			bodyParams = '<urn:CreateCollectorForEvents>\n'+
							 '<urn:_this type="EventManager">EventManager</urn:_this>\n'
							 + filter +
						 '</urn:CreateCollectorForEvents>\n';
		} else if(method === "setCollectorPageSize") {
			bodyParams = '<urn:SetCollectorPageSize>\n'+
							'<urn:_this type="EventHistoryCollector">'+SESSION+'</urn:_this>\n'+
							'<urn:maxCount>'+SNLIMIT+'</urn:maxCount>\n'+
						 '</urn:SetCollectorPageSize>\n';
		} else if(method === "resetCollector") {
			bodyParams = '<urn:ResetCollector>\n'+
							'<urn:_this type="EventHistoryCollector">'+SESSION+'</urn:_this>\n'+
						 '</urn:ResetCollector>\n';
		} else if(method === "readNextEvents") {
			bodyParams = '<urn:ReadNextEvents>\n'+
							'<urn:_this type="EventHistoryCollector">'+SESSION+'</urn:_this>\n'+
							'<urn:maxCount>'+SNLIMIT+'</urn:maxCount>\n'+
						 '</urn:ReadNextEvents>\n';
		} else if(method === "retrievePropertiesEx") {
			bodyParams = '<urn:RetrievePropertiesEx>\n'+
							'<urn:_this type="PropertyCollector">propertyCollector</urn:_this>\n'+
							'<urn:specSet>\n'+
							'<urn:propSet>\n'+
							'<urn:type>Alarm</urn:type>\n'+
							'<urn:all>false</urn:all>\n'+
							'<urn:pathSet>info.expression</urn:pathSet>\n'+
							'</urn:propSet>\n';

						 var alarms = params.alarms;

						 for (var i in alarms) {
							 var alarm = alarms[i];
							 bodyParams += '<urn:objectSet>\n'+
								'<urn:obj type="Alarm">'+alarm+'</urn:obj>\n'+
								'<urn:skip>false</urn:skip>\n'+
							 '</urn:objectSet>\n';
						 }

			bodyParams += '</urn:specSet>\n'+
							'<urn:options>\n'+
							'</urn:options>\n'+
				  '</urn:RetrievePropertiesEx>\n';
		} else if(method === "queryPerfCounter") {
			bodyParams = '<urn:QueryPerfCounter>\n'+
							'<urn:_this type="PerformanceManager">PerfMgr</urn:_this>\n';
			var counters = params.counters;

			for (var j in counters) {
				var counter = counters[j];
				bodyParams += '<urn:counterId>'+counter+'</urn:counterId>';
			}

			bodyParams += '</urn:QueryPerfCounter>\n';
		}

        requestBody = startEnvelop + header + startBody + bodyParams + endBody + endEnvelop;
        return requestBody;
    },

	getMessageKey: function(event) {
		var keyParts = [];

		if (UUID) {
			keyParts.push(UUID);
		}

        if(objectMissingFlag){
			keyParts.push(event.alarm.alarm["#text"]);
		}

		if (event.alarm && event.alarm.alarm && event.alarm.alarm.obj && event.alarm.alarm.obj["#text"])  {
			keyParts.push(event.alarm.alarm.obj["#text"]);
		}

		if (event.entity && event.entity.entity && event.entity.entity["#text"]) {
			keyParts.push(event.entity.entity["#text"]);
		}

		return keyParts.join(".");
	},

	getSeverity: function(event, type) {
		var vCenterSeverity = null;

		if (type != "AlarmStatusChangedEvent") {
			return 5;
		}

		if (event.to) {
			vCenterSeverity = event.to;
		}

		if (vCenterSeverity == "gray") {
			if (event.from) {
				vCenterSeverity = event.from;
			}
		}

		if (!vCenterSeverity) {
			return null;
		}

		return SEVERITY_MAP[vCenterSeverity];
	},

	getState: function(event, type) {
		var vCenterState = null;
		
		if (type != "AlarmStatusChangedEvent") {
			return "Closing";
		}
		
		if (event.to) {
			vCenterState = event.to;
		}

		if (!vCenterState) {
			return "Closing";
		}

		return STATE_MAP[vCenterState];
	},

	getMetricName: function(event) {
		var metricNames = [];
		var eventTypeIds = {};

		if (!event.alarm || !event.alarm.alarm || !event.alarm.alarm.propSet) {
			return "";
		}
		
		var propSet = event.alarm.alarm.propSet;
		
		propSet = Object.prototype.toString.call(propSet) == "[object Array]" ? propSet[0] : propSet;

		if (!propSet.val) {
			return "";
		}
		
		var delimeter = propSet.val["@xsi:type"] == "OrAlarmExpression" ? " or " : " and ";
		
		var expressions = propSet.val.expression;
		
		var alarmId = null;
		
		if (event.alarm && event.alarm.alarm) {
			if (event.alarm.alarm["#text"]) {
				alarmId = event.alarm.alarm["#text"];
			} else if (event.alarm.alarm.obj && event.alarm.alarm.obj["#text"]){
				alarmId = event.alarm.alarm.obj["#text"];
			}
		}
		
		var isMetric = false;
		var type = null;
		for (var i in expressions) {
			var expression = expressions[i];
			if (expression) {
				type = expression["@xsi:type"];

				if (type == "MetricAlarmExpression") {
					var counter = expression.metric.counter;
					metricNames.push(counter.groupInfo.label+"."+counter.nameInfo.label);
					isMetric = true;
				} else {
					if (isMetric) {
						break;
					}

					if (!expression.eventTypeId) {
						continue;
					}

					var eventTypeId = expression.eventTypeId;
					var parts = eventTypeId.split(".");
					eventTypeId = parts[parts.length-1];

					if (eventTypeIds[eventTypeId]) {
						continue;
					}

					eventTypeIds[eventTypeId] = true;
					metricNames.push(eventTypeId);
				}
			}
		}

		var metricName = "";

		if (metricNames.length) {
			metricName = metricNames.join(delimeter);
		} else if (event.alarm.name) {
			metricName = event.alarm.name;
		}

		return isMetric ? metricName : alarmId+" "+metricName;
	},

    /**
     * Function to assemble and create a SNow Event Objects from all the needed pre-collected data
     *
     * @param {Array} collectedData - Array of collected Events/Alerts with all the info
     * @param {String} emsName - The name of the connector
     */
    createSNEvents: function (collectedData, emsName, type) {
        var sender = SNEventSenderProvider.getEventSender();

        collectedData.forEach(function(event) {
			if (!event) {
				return true;
			}
			if (LAST_EVENT_KEY == event.key) {
				return true;
			}

			eventDateTime = this.convertStingDateToTimestamp(event["createdTime"]);

			if (!LAST_EVENT_SIGNATURE || LAST_EVENT_SIGNATURE < eventDateTime) {
				LAST_EVENT_SIGNATURE = eventDateTime;
				LAST_EVENT_KEY = event.key;
			}

            var sEvent = new Event();

			var type = event["@xsi:type"];
			if (type) {
				sEvent.setType(type);
			}

			if (event.entity && event.entity.entity && event.entity.entity["@type"] == "HostSystem") {
				sEvent.setHostAddress(event.host.name);
			}

			sEvent.setSource(SOURCE);
			sEvent.setEmsSystem(emsName);

			PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

			var resource = this.getResource(event);

			if (resource) {
				sEvent.setResource(resource);
			}

			var severity = this.getSeverity(event, type);

			if (severity) {
				sEvent.setSeverity(severity);
			}

            sEvent.setResolutionState(this.getState(event, type));

			if (event.createdTime) {
				sEvent.setTimeOfEvent(this.getDate(this.convertStingDateToTimestamp(event.createdTime)/1000));
			}

			if (event.fullFormattedMessage) {
				sEvent.setText(event.fullFormattedMessage);
			}

			if (type == "AlarmStatusChangedEvent" || type == "AlarmClearedEvent") {
				var messageKey = this.getMessageKey(event);

				if (messageKey) {
					sEvent.setMessageKey(messageKey);
				}

				sEvent.setMetricName(this.getMetricName(event));
			}

			var additionalInfoFields = this.getAdditionalInfoFields(event);

			if (type == "AlarmStatusChangedEvent" || type == "AlarmClearedEvent") {
				sEvent.setField("vcenter_uuid", UUID);
				
				if (event.entity && event.entity.entity && event.entity.entity["#text"]) {
					sEvent.setField("object_id", event.entity.entity["#text"]);
				}
				
				sEvent.setField("managed_object_type", event.entity.entity["@type"]);
			}

            // Adding to the additional info
			for (var key in additionalInfoFields) {
				var additionalInfoField = additionalInfoFields[key];
				this.eventSetProperty(sEvent, key, additionalInfoField);
			}

            try {
                sender.sendEvent(sEvent);
                this.logPayload("sEvent sent: " + sEvent);
            } 
            catch (e) {
                ms.log(JSON.stringify(e));
				ms.log("event of error: "+JSON.stringify(event));
                this.addError(e.toString());
            }

            eventCounter++;

        }, this);
    },

	getAdditionalInfoFields: function(event) {
		var additional_info = {};

		if (event.key) {
			additional_info["key"] = event.key;
		}

		if (event.chainId) {
			additional_info["chainId"] = event.chainId;
		}

		if (event.host.name) {
			additional_info["host_name"] = event.host.name;
		}

		if (event.host && event.host.host && event.host.host["#text"]) {
			additional_info["host_Id"] = event.host.host["#text"];
		}

		if (event.computeResource.name) {
			additional_info["computeResource_name"] = event.computeResource.name;
		}

		if (event.computeResource && event.computeResource.computeResource && event.computeResource.computeResource["#text"]) {
			additional_info["computeResource_Id"] = event.computeResource.computeResource["#text"];
		}

		if (event.vm.name) {
			additional_info["vm_name"] = event.vm.name;
		}

		if (event.vm && event.vm.vm && event.vm.vm["#text"]) {
			additional_info["vm_Id"] = event.vm.vm["#text"];
		}

		if (event.datacenter.name) {
			additional_info["datacenter_name"] = event.datacenter.name;
		}

		if (event.datacenter && event.datacenter.datacenter && event.datacenter.datacenter["#text"]) {
			additional_info["datacenter_Id"] = event.datacenter.datacenter["#text"];
		}

		if (event.ds.name) {
			additional_info["ds_name"] = event.ds.name;
		}

		if (event.ds && event.ds.ds && event.ds.ds["#text"]) {
			additional_info["ds_Id"] = event.ds.ds["#text"];
		}

		if (event.dvs.name) {
			additional_info["dvs_name"] = event.dvs.name;
		}

		if (event.dvs && event.dvs.dvs && event.dvs.dvs["#text"]) {
			additional_info["dvs_Id"] = event.dvs.dvs["#text"];
		}

		if (event.source.name) {
			additional_info["source_name"] = event.source.name;
		}

		if (event.source && event.source.source && event.source.source["#text"]) {
			additional_info["source_Id"] = event.source.source["#text"];
		}

		if (event.alarm.name) {
			additional_info["alarm_name"] = event.alarm.name;
		}

		if (event.alarm && event.alarm.alarm && event.alarm.alarm.obj && event.alarm.alarm.obj["#text"]) {
			additional_info["alarm_Id"] = event.alarm.alarm.obj["#text"];
		}

        if(objectMissingFlag){
			additional_info["alarm_Id"] =  event.alarm.alarm["#text"];
		}

		if (event.net && event.net.net && event.net.net["#text"]) {
			additional_info["net_Id"] = event.net.net["#text"];
		}
		
		if (event.net && event.net.name) {
			additional_info["net_name"] = event.net.name;
		}

		additional_info["warning_condition"] = this.getConditionStr(event, "yellow");
		additional_info["critical_condition"] = this.getConditionStr(event, "red");

		return additional_info;
	},

	getConditionStr: function(event, key) {
		var conditions = [];

		var alarm = event.alarm.alarm;

		var propset = Object.prototype.toString.call(alarm.propSet) == "[object Array]" ? alarm.propSet[0] : alarm.propSet;

		if (!propset || !propset.val) {
			return "";
		}
		
		var delimeter = propset.val["@xsi:type"] == "AndAlarmExpression" ? " and " : " or ";

		var expressions = propset.val.expression;

		for (var i in expressions) {
			var expression = expressions[i];
			if (expression) {
				var counter = expression.metric.counter;

				if (!counter || expression["@xsi:type"] != "MetricAlarmExpression") {
					continue;
				}

				var expressionWord = expression[key];

				if (counter.unitInfo.label == "%") {
					expressionWord = expressionWord/100;
				}

				var text = counter.groupInfo.label + "." + counter.nameInfo.label + " " + expression.operator + " " + expressionWord + " " + counter.unitInfo.label 
				+ " for " + expression[key+"Interval"] + " seconds";
				conditions.push(text);
			}
		}

		return conditions.join(delimeter);
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
     * Function for checking whether to set a certian property for the SNow Event creation.
     * @param event - SNow Event object
     * @param key - The key to wich the additional field will be set
     * @param value - The value to be set on that key
     */
    eventSetProperty: function(event,key,value){
		value = value+"";
        if(!!value && value.length >= 1){
            event.setField("u_" + key, value);
        }
        return event;
    },

    /**
     * Function for generating and executing automatically a REST request with a SET body object
     * @param body An JS object with the request params needed.
	 * @param safeToLog Set to false when content of request body contains sensitive information like server credentials. Default: true
     * @returns Java object with the response.
     */
    createRequest: function (body, safeToLog) {
		safeToLog = safeToLog !== false; // Set to false if caller explicitly sets it to false. True by default for undefined / null

        var response, status;
        var host = this.probe.getParameter("host"); //get host url from SNow
        var protocol = this.probe.getAdditionalParameter("protocol") || "https"; 
        var port = this.probe.getAdditionalParameter("port") || 80; //get the set port from the SNow Connector Definition Instance
        port = (port == 80 ? "" : (port));
        var url = protocol + "://" + host +":"+ port + "/sdk/vimService"; // Build the url for the request

        // Work-around for the square brackets
        url = encodeURI(url);
        this.debug("Connecting to URL: " + url);

        var request = new HTTPRequest(url);
        request.addHeader("Content-Type", "text/xml;charset=UTF-8");

        // Don't need this header when we are making the request for the token
        if(!!AUTH_TOKEN) {
			this.debug("Adding auth token to request header");
            request.addHeader("Cookie", AUTH_TOKEN);
        }

        request.addHeader("SOAPAction", "urn:vim25/5.0");

        try {

			if (safeToLog) {
				// Request body is a XML string. No need to encode as JSON
                this.logPayload("Posting request with content: \n" + body);
            }

            response = request.post(body);

			if (safeToLog) {
				// SOAP response can contain sensitive information during login. Only log if it's safe to log as per caller.
				this.logPayload("Response body : \n" + body);
			}

            status = response.getStatusCode();
            if (status === 200) {
                return response;
            } else {
                this.addError("RESPONSE STATUS ERROR No: " + status);
                this.addError("RESPONSE ERROR : " + response.getBody());
                  if(response.getBody().contains("ManagedObjectNotFoundFault")){
                	objectMissingFlag = true;
					this.addError(" For More info please contact with vCenter Support team or check the below  articles : " );
					this.addError(" Article : " + "https://kb.vmware.com/s/article/1039326" );
				}
                return false;
            }
        }
        catch (e) {
			ms.log(JSON.stringify(e));
            this.addError(e.toString());
        }
    },

    /**
     * We are parsing the response to xml format and then to JSON
     *
     * @param response
     *
     * @returns {Object} object from type JSON with all the events info
     */
    normalizeObjects: function(response) {
        var xmlObj = new XMLHelper(response.getBody());
        xmlObj = xmlObj.toObject();

        return xmlObj;
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
        ms.log("**** vCenterJS ERROR: "+message);
    },

	/**
     * Logging payload and event object if the additional parameter logPayloadForDebug is set to be true
     *
     * @param message
     */
    logPayload: function(message) {
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
            ms.log(SOURCE + ": Payload: " + message);
        }
        return true;
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

    type: "vCenter_JS"
});
