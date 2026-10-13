var NagiosXI = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;

var Instant = Packages.java.time.Instant;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
var Calendar = Packages.java.util.Calendar;
var TimeZone = Packages.java.util.TimeZone;

var errorMessage = "";
var NAGIOS_XI = "Nagios";
var MAX_EVENTS_TO_FETCH = 3000;
var severityByStateType = "false";


NagiosXI.prototype = Object.extendsObject(AProbe, {

	testConnection : function() {
		
		ms.log("NagiosXIJS testing connection");

		var url = this.getNagiosURL();
		
		var retVal = {};
		
		try {
			var response = this.getResponseFromURL(url);
			
			if (response == null) {
				retVal['status']  = FAILURE.toString();
				this.addError("Failed to connect to Nagios on test connector. Response is null");
				retVal['error_message'] = errorMessage;
				return retVal;
				
			}
			ms.log('NagiosXIJS Connector Test Connection response:' + response.getBody());
			ms.log('result:' + response.getStatusCode());
			
			//var parser = new JSONParser();
			// replace JSONParser with JSON.parse() to support UTF-8 (e.g. Japanese)
			var resultJson =  JSON.parse(response.getBody());
			
			if (response.getStatusCode() == 200 && resultJson.error == undefined) //success
				retVal['status']  = SUCCESS.toString();
			else { //failure
				this.addError("Failed to connect to Nagios on test connector.");
				if (response.getStatusCode() != 200) { 
					this.addError(response.getErrorMessage());
				} else {
					this.addError(resultJson.error);
				}
				
				retVal['status']  = FAILURE.toString();
				retVal['error_message'] = errorMessage;
			}
			
		} catch (e) {
			this.addError("Failed to connect to Nagios");
			this.addError(e);
			retVal['status'] = FAILURE.toString();
			retVal['error_message'] = errorMessage;
		}
		
		ms.log("NagiosXIJS Connector testConnection " + retVal['status'] );
		
		return retVal;
		
	},

	execute: function() {
		
		ms.log("NagiosJS Connector: execute connection ...");
		var retVal = {};
		try {	
			var utcDate = "";
			var url = this.getNagiosURL();
		
			var response = this.getResponseFromURL(url);
			if(response == null){
				this.addError("Failed to connect to Nagios on execute. Response is null");
				retVal['status'] = FAILURE.toString();
				retVal['error_message'] = errorMessage;
				return retVal;
			}
			var resultJson = this.getJSONFromResponse(response);
			if (resultJson == null) {
				retVal['status'] = FAILURE.toString();
				retVal['error_message'] = errorMessage;
				return retVal;
			}

			var events = null;
			var uxDate = null;
			var lastSig=this.probe.getParameter("last_event");
			if(resultJson.recordcount == 0){
				ms.log("execute method: no records found. count was " + resultJson.recordcount + " records");
				retVal['status'] = SUCCESS.toString();
				return retVal;

			} else if(resultJson.stateentry[0].state_time==lastSig && resultJson.recordcount == 1){
				ms.log("execute method: no new records found.");
				retVal['status'] = SUCCESS.toString();
				return retVal;

			} else if(resultJson.recordcount == 1){
				ms.log("execute method:  first entry time "+resultJson.stateentry[0].state_time);

			} else{
				ms.log("execute method: recordcount > 0 response first entry time "+resultJson.stateentry[0].state_time);

			}
			events = this.getEventsFromJSON(resultJson);

			if (events == null) {
				retVal['status'] = FAILURE.toString();
				this.addError("execute method: events array is null");
				retVal['error_message'] = errorMessage;
				return retVal;
			}

			ms.log("execute events.length " + events.length);
			var sender = SNEventSenderProvider.getEventSender();

			var i = 0;
			var successFlag = true;
			for (; i< events.length; i++) {
				if (events[i] && !this.filterEvent(lastSig, events[i])) {
					successFlag = successFlag && sender.sendEvent(events[i]);
				}
			}

			if (successFlag) {
				retVal['status'] = SUCCESS.toString();
				if (events.length > 0) {
					var lastEventSignature = events[0].getTimeOfEvent();
					retVal['last_event'] = lastEventSignature;
				}
			} else {
				retVal['status'] = FAILURE.toString();
				this.addError("Execute method: Failed to send events");
				retVal['error_message'] = errorMessage;
			}

        } catch (e) {
			this.addError("Failed to retreive Nagios events");
			this.addError(e);
			retVal['status'] = FAILURE.toString();
			retVal['error_message'] = errorMessage;
		}

		ms.log("NagiosJS Connector: execute finished " + retVal['status']);
		return retVal;
	},

	filterEvent: function(lastSig, event) {
		if (lastSig == null) { //first collection cycle
			if (event.isClosing())
				return true;
		}else if (lastSig !=null){
            if(this.getUTCEpochFromNagiosString(lastSig) >= this.getUTCEpochFromNagiosString(event.getTimeOfEvent()))
                return true;
        }
		return false;
	},

	getResponseFromURL: function(url) {
		var request = new HTTPRequest(url);
		request.addHeader('Accept','application/json');
		var response = request.get();
		return response;
	},

	getJSONFromResponse : function (response) {

		if (response == null) {
			this.addError("NagiosJS Connector: Failed to bring data. Null response");
			return null;
		}

		if (response.getStatusCode() != 200) {
			this.addError("NagiosJS Connector Error Code: " +  response.getStatusCode());
			return null;
		}

		//var parser = new JSONParser();
		// replace JSONParser with JSON.parse() to support UTF-8 (e.g. Japanese)
		var resultJson =  JSON.parse(response.getBody());

		if (!resultJson) {
			this.addError("NagiosJS Connector: Failed to bring data: " +  resultJson);
			return null;
		}

        // In new version - the statehistory has been removed from the response.
        // To be compatible with previous version - we return statehistory as a final JSON results.
        // As a result - we pass over JSON response without additional condition if it belongs to prev or new version of Nagios.
		var finalJSONResult = resultJson;
		if(resultJson.statehistory){
			finalJSONResult = resultJson.statehistory;
		}

		ms.log("NagiosJS Connector: Found " + finalJSONResult.recordcount + " records");
		return finalJSONResult;

	},


	getEventsFromJSON: function(parsed)
	{
		if (parsed == null)
			return null;

		var events = [];

		if (parsed.recordcount === 0)
			return events;

		ms.log("getEventsFromJSON record count was greater than 0 count is " + parsed.recordcount);
		var entryData = "";
		var timeOfEvent = "";
		var node = "";
		var severity = "";
		var severityType = "";
		var type = "";
		var event = null;
		var mappedSeverity = "";

		if(parsed.recordcount == 1){
			timeOfEvent = parsed.stateentry[0].state_time;
			timeOfEvent = this.translateToGMT(timeOfEvent);
			type = parsed.stateentry[0].service_description;
			entryData = parsed.stateentry[0].output;
			node = parsed.stateentry[0].host_name;
			severity = parsed.stateentry[0].state;
			severityType = parsed.stateentry[0].state_type;

			mappedSeverity = this.getMappedSeverity(severity, severityType);
			event = this.getPopulatedEvent(type, timeOfEvent, mappedSeverity, entryData, node);
			PullConnectorCustomDomainUtil.get().populateDomain(this.probe, event, parsed.stateentry[0]);
			events[0] = event;
			return events;
		}

		var i = 0;
		for (; i < parsed.recordcount; i++) {
			node = parsed.stateentry[i].host_name;
			timeOfEvent = parsed.stateentry[i].state_time;
			timeOfEvent = this.translateToGMT(timeOfEvent);
			type = parsed.stateentry[i].service_description;
			entryData = parsed.stateentry[i].output;
			severity = parsed.stateentry[i].state;
			severityType = parsed.stateentry[i].state_type;

			mappedSeverity = this.getMappedSeverity(severity, severityType);
			event = this.getPopulatedEvent(type, timeOfEvent, mappedSeverity, entryData, node);
			PullConnectorCustomDomainUtil.get().populateDomain(this.probe, event, parsed.stateentry[i]);
			events[i] = event;
		}
		return events;
	},

	getMappedSeverity: function(nagiosSeverity, sevType) {
		var mappedSeverity = 5; //  info
        if (severityByStateType == 'false') {
			
            if (nagiosSeverity === '2')
                mappedSeverity = 1;
            else if (nagiosSeverity === '1' && sevType === '1')
                mappedSeverity = 1;
            else if (nagiosSeverity === '1' && sevType === '0')
                mappedSeverity = 2;
            else if (nagiosSeverity === '0')
                mappedSeverity = 5;

        } else if (severityByStateType == 'true') {

            if (nagiosSeverity === '0') {
                mappedSeverity = 5; //OK -> OK
            } else if (nagiosSeverity === '1' && sevType === '0') {
                mappedSeverity = 4; //Warning-Soft -> Warning
            } else if (nagiosSeverity === '1' && sevType === '1') {
                mappedSeverity = 3; // Warning-Hard -> Minor
            } else if (nagiosSeverity === '2' && sevType === '0') {
                mappedSeverity = 2; // Critical-Soft -> Major
            } else if (nagiosSeverity === '2' && sevType === '1') {
                mappedSeverity = 1; // Critical-Hard -> Critical
            } else if (nagiosSeverity === '3' && sevType === '0') {
                mappedSeverity = 4; // Unknown-Soft -> Warning
            } else if (nagiosSeverity === '3' && sevType === '1') {
                mappedSeverity = 3; // Unknown-Hard -> Minor
            }

        }

        return mappedSeverity;
	},

	getPopulatedEvent: function(type, timeOfEvent, mappedSeverity, entryData, node){
		var emsName =  this.probe.getParameter("connector_name");

		var event = Event();
			event.setSource(NAGIOS_XI);
			event.setMetricName(type);
			event.setTimeOfEvent(timeOfEvent);
			event.setSeverity(mappedSeverity);
			event.setHostAddress(node);
			event.setText(entryData);
			event.setType(type);
			event.setMessageKey(node+"_"+type);
			event.setEmsSystem(emsName);

			if (mappedSeverity == 5) {
				event.setResolutionState("Closing");
			}
			return event;
	},

		getBirthday : function (daysBack){
		var dt = new Date();
		var myEpoch = dt.getTime();
		var bd = myEpoch - daysBack * 24 * 3600 * 1000;
		return Math.round(bd/1000);
	},

	translateToGMT: function(timeOfEvent) {
		var timeOfEventGMT;
		var timeZone = this.probe.getAdditionalParameter("time_zone");

		try{
			if ( timeZone && timeZone != null) {
				var formatterFrom = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				formatterFrom.setTimeZone(TimeZone.getTimeZone(timeZone));

				var formatterTo = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				formatterTo.setTimeZone(TimeZone.getTimeZone("GMT"));

				var timeOfEventUTC = formatterFrom.parse(timeOfEvent);
				timeOfEventGMT = formatterTo.format(timeOfEventUTC);
			}
		}
		catch (ex) {
			ms.log("ERROR NagiosXI: failure to parse and format message " + ex);
		}

		if (!timeOfEventGMT) {
			ms.log("ERROR NagiosXI: No valid time_zone parameter. No translation to GMT. time_zone parameter value is " + timeZone);
			timeOfEventGMT = timeOfEvent;
		}

		return timeOfEventGMT;
	},

	getUTCEpochFromNagiosString : function(dtString){
 		var splitDate = dtString.split(" ");
 		var fromIso8601 = Instant.parse(splitDate[0] + "T" + splitDate[1] + "Z");
     	var lngEp = fromIso8601.toEpochMilli();
		lngEp=lngEp/1000;
		return lngEp;
	},

	//called from this.getURL for execute and for testConnection
	  getNagiosURL : function() {
		  var lastRun = this.probe.getParameter("last_event");
		  if(typeof lastRun === "undefined" || lastRun === null || lastRun == "" || lastRun == "undefined") {
		  	var daysBack = this.probe.getAdditionalParameter("initial_sync_in_days");
			  if (daysBack<1) {
				  daysBack=7;
				  ms.log ("Number of days to sync cant be lower than 1, reverted to 7 days");
			  }
		  	//validate value
			  lastRun = this.getBirthday(daysBack);
		  } else {
			  lastRun = this.getUTCEpochFromNagiosString(lastRun);
		  }
		var host = this.probe.getParameter("host");
		var password = this.probe.getParameter("password");
		var port = this.probe.getAdditionalParameter("port");
		var protocol = this.probe.getAdditionalParameter("protocol");
        var sevstatetype = this.probe.getAdditionalParameter("severity_by_state_type");
		if(sevstatetype!=null){
			severityByStateType = sevstatetype;
		}

		if (protocol != 'http' && protocol != 'https')
			protocol = 'http';

		//validate port
        var url = protocol + "://" + host + ":" + port + "/nagiosxi/api/v1/objects/statehistory?starttime=" + lastRun +
        	"&orderby=state_time:d&records=" + MAX_EVENTS_TO_FETCH + "&apikey=" + password + "&pretty=1";

		var urlToPrint = protocol +  "://" + host + ":" + port + "/nagiosxi/api/v1/objects/statehistory?starttime=" + lastRun +
        	"&orderby=state_time:d&records=" + MAX_EVENTS_TO_FETCH + "&apikey=" + "****" + "&pretty=1";

        ms.log("Execute URL " + urlToPrint);
        return url;
    },
	retrieveKpi : function() {
		var metricConnector = NagiosMetrics_JS.get(this.probe).retrieveKpi();
		return metricConnector;
	},
	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
	},
	type: "NagiosXI"
});
