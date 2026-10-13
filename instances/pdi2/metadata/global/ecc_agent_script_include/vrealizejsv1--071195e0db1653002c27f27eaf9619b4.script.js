var XMLUtil = Packages.com.glide.util.XMLUtil;
var g_probe=null;
var vRealizeJSv1 = Class.create();
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;

var MAX_EVENTS_TO_FETCH = 3000;
var DAYS_BACK_AT_FIRST_RUN = 14; // for the first init
var FIRST_RUN = false;

var GUEST_IP = "guest_ip_address";
var HOST_IP = "ip_address";
var MAC = "mac_address";
var RESOURCE_NAME = "resourceName";
var errorMessage = "";
var isDebug = false;
var islogPayloadForDebug = false;

vRealizeJSv1.prototype = Object.extendsObject(AProbe, {
	// test the connection with vRealize server 
	testConnection : function() {
		ms.log("vRealizeJSv1 testing connection");

		var retVal = {};
		var query = '/suite-api/api/alerts?page=0&pageSize=3';
		var response = this.getResponse(query);
		if (response == null){
			retVal['status']  = FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}
		ms.log('vRealizeJSv1 Connector Test Connection response:' + response);		 
		ms.log('result:' + response.getStatusCode());
		if (response.getStatusCode() === 200){
			retVal['status']  = SUCCESS.toString();
		}
		else{
			retVal['status']  = FAILURE.toString();
			this.addError('vRealizeJSv1 Connector Test Connection response code: ' + response.getStatusCode());
		}
		if (retVal['status'] === FAILURE.toString())
			retVal['error_message'] = errorMessage;
		return retVal;

	},

	execute: function() {
		ms.log("vRealizeJSv1 Connector: execute connection ...");

		var retVal = {};

		isDebug = "" + this.probe.getAdditionalParameter("debug");
		islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");

		var lastSignature = this.probe.getParameter("last_event");
		//get the signature correct according to the format 
		//============  UPDATE_TIME.CANCEL_TIME ==============
		lastSignature = this.setLastEventsSignature(lastSignature);		 
		var events = [];

		var lastUpdateSignature;
		var	lastCancelSignature;
		var dotIdx = lastSignature.indexOf('.');

		lastUpdateSignature = lastSignature.substring(0, dotIdx);
		lastCancelSignature = lastSignature.substring(dotIdx + 1);
		//send a couple of parameters to the function
		var parameters = {};
		parameters['sortOrder'] = 'ASCENDING';
		if (FIRST_RUN) {
			parameters['sortOrder'] = 'DESCENDING';			
		}
		parameters['timeRangeQuery'] = 'ops:updateTimeRange';	//query filter
		parameters['activeOnly'] = 'true';						//only active events
		var updateEvents = this.getEvents(lastUpdateSignature, parameters);
		lastUpdateSignature = this.getLastEventSignature(updateEvents, lastUpdateSignature);
		parameters['timeRangeQuery'] = 'ops:cancelTimeRange';  //query filter
		parameters['activeOnly'] = 'false';
		var cancelEvents = this.getEvents(lastCancelSignature, parameters);
		lastCancelSignature = this.getLastEventSignature(cancelEvents, lastCancelSignature);
		events = updateEvents.concat(cancelEvents);




		if (events == null) {
			retVal['status'] = FAILURE.toString();
			retVal['error_message'] = errorMessage;
			return retVal;
		}
		// send all events			
		var sender = SNEventSenderProvider.getEventSender();
		var successFlag = true;
		for (var i = 0; i< events.length; i++) {	

			this.logPayload("Event Object Created : "+events[i]);
			successFlag = sender.sendEvent(events[i]);
			if (!successFlag) {
				if (this.isEventActive(events[i]) !== null) {
					//get the time from the last event that didn't send correctly
					//and reduce 1 from the time, to get this event on the next call
					var timeOfEvent = +(events[i].getField("alertTimeStamp")) - 1 ;		
					if (this.isEventActive(events[i]))		//take specific time according to the query
						lastUpdateSignature = timeOfEvent;
					else 
						lastCancelSignature = timeOfEvent;
				}
				break;
			}
		}
		retVal['status'] = SUCCESS.toString();
		retVal['last_event'] = lastUpdateSignature + '.' + lastCancelSignature;

		ms.log("vRealizeJSv1 Connector: sent " + events.length + 
			   " events. Return to instance: status="+retVal['status'] + 
			   "  lastDiscoverySignature=" + retVal['last_event'] );

		return retVal;
	},
	//check if an event is active
	isEventActive: function(event) {
		if (event !== null) {
			var state = event.getResolutionState() + '';
			if (state === 'New')
				return true;
			else
				return false;
		}
	},
	// set LastEventsSignature to format of "updateTime.cancelTime"
	// for avoding null or update from previous version of SNC   
	setLastEventsSignature: function(lastSignature) {
		if (lastSignature === null) {	//run for first time
			var nowDate = new Date(); 
			var nowEpoch = nowDate.getTime() - DAYS_BACK_AT_FIRST_RUN * 24 * 3600 * 1000;
			FIRST_RUN = true;
			return (nowEpoch + "." + nowEpoch);
		}
		lastSignature = lastSignature + '';
		if (lastSignature !== null && lastSignature.indexOf('.') != -1) {	//on a regular base
			return lastSignature;
		} else {	//after upgrade from previuos version
			var twoDaysAgo = +lastSignature - 2 * 24 * 3600 * 1000;	//get cancel events form last 2 days
			return lastSignature + "." + twoDaysAgo;
		}
	},
	//get the signature from the last event form an events array
	getLastEventSignature: function(events, oldSignature) {
		if (events !== null && events.length > 0) {
			// the result is sorted, but the sort order can differ. Therefore 
			// the last signature is either on the first or the last event
			var lastEventSignature = events[0].getField("alertTimeStamp");
			var firstEventSignature = events[events.length-1].getField("alertTimeStamp");

			if (firstEventSignature >= lastEventSignature)
				return firstEventSignature;
			else 
				return lastEventSignature;
		}
		return oldSignature;
	},
	createRequest: function(query) {
		var username =  this.probe.getParameter("username");
		var password =  this.probe.getParameter("password");
		var host =  this.probe.getParameter("host").trim();
		var protocol = this.probe.getAdditionalParameter("protocol").trim();
		var port = this.probe.getAdditionalParameter("port").trim();

		if (port && (''+port).trim().length) {
			host = host + ":" + port;
		}

		var url = protocol+ "://" + host + query;	
		ms.log("vRealizeJSv1 Connector: URL is " + url);
		var request = new HTTPRequest(url);
		request.setBasicAuth(username, password);
		return request;
	},

	getResponse: function(query) {
		var request = this.createRequest(query);
		var response = request.get();
		if (response == null)
			this.addError(request.getErrorMessage());
		return response;
	},


	getResponseFromQuery: function(queryTime, parameters) {

		var query = '/suite-api/api/alerts/query?pageSize=' + MAX_EVENTS_TO_FETCH + '&sortBy=UPDATE_TIME_UTC&sortOrder=' + parameters['sortOrder'];	//change the start time to update
		this.debug("query : "+query);

		var xmlString = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><ops:alert-query compositeOperator="AND" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ops="http://webservice.vmware.com/vRealizeOpsMgr/1.0/"><' + parameters['timeRangeQuery'] +'><ops:startTime>'+queryTime+'</ops:startTime></' + parameters['timeRangeQuery'] + '><ops:activeOnly>' + parameters['activeOnly'] + '</ops:activeOnly></ops:alert-query>';
		this.debug("Request Body : "+xmlString);

		var request = this.createRequest(query);
		request.addHeader('Content-Type','application/xml');
		request.addHeader('Accept','application/xml');
		var response;
		try{
			response = request.post(xmlString);
		} catch(e){
			this.addError("Request failed on: " + timeRangeQuery + ":" + e);
		}
		if (response == null)
			this.addError(request.getErrorMessage());
		return response;
	},

	addToResourceMap: function(resourceMap, resId)
	{
		var resourceData = {};
		var url = '/suite-api/api/resources/'+resId + '/properties';	
		this.debug("Resource Properties URL : "+url);
		var obj = this.requestResource(url);

		// Format of the responce:
		// <ops:property name="config|name">vCenter_Hyperic_Server</ops:property>
		// <ops:property name="net:4000|ip_address">10.196.39.141</ops:property>
		// <ops:property name="net:4000|mac_address">00:50:56:80:47:22</ops:property>
		// <ops:property name="summary|guest|ipAddress">10.196.39.141</ops:property>

		var helper = new XMLHelper();
		//Since the returned "obj" is a javascript object, Have to convert it to String
		this.logPayload("Response Body of Resource Properties : " + helper.toXMLStr(obj));

		if(obj && obj['ops:property']) {
			var properties = obj['ops:property'];
			for (var i = 0; i < properties.length; i++) {
				if (properties[i]['@name'].indexOf("ip_address") >= 0)
					resourceData[HOST_IP] = properties[i]['#text'];
				else if (properties[i]['@name'] === "summary|guest|ipAddress")
					resourceData[GUEST_IP] = properties[i]['#text'];
				else if (properties[i]['@name'].indexOf("mac_address") >= 0)
					resourceData[MAC] = properties[i]['#text'];
				else if (properties[i]['@name'] === "config|name")
					resourceData[RESOURCE_NAME] = properties[i]['#text'];
			}
		}

		url = '/suite-api/api/resources/'+resId;
		this.debug("URL for resource : "+url);
		obj = this.requestResource(url);
		this.logPayload("Response Body of Resources : "+helper.toXMLStr(obj));

		// Format of the responce:
		// <ops:resourceKey>
		// <ops:resourceKindKey>VirtualMachine</ops:resourceKindKey>
		var resourceKind = obj['ops:resourceKey']['ops:resourceKindKey'];
		if (resourceKind != null)
			resourceData['resourceKind'] = resourceKind;
		resourceMap[resId] = resourceData;
	},

	requestResource: function(url)
	{
		var response = this.getResponse(url);
		var xmlString=response.getBody();
		var helper = new XMLHelper(xmlString);
		return helper.toObject();
	},
	exptractNodeFromProperties: function(resourceData)
	{
		// node is defined by guest ip or host it or mac or resource name (in this order)
		var node = "";
		if (resourceData[GUEST_IP])
			node = resourceData[GUEST_IP];
		else if (resourceData[HOST_IP])
			node = resourceData[HOST_IP];
		else if (resourceData[MAC])
			node = resourceData[MAC];
		else if (resourceData[RESOURCE_NAME])
			node = resourceData[RESOURCE_NAME];

		return node;
	},

	getEvents: function(latestTimestamp, parameters) 
	{

		latestTimestamp++;

		var query = this.getResponseFromQuery(latestTimestamp, parameters);
		if (query == null)
			return null;
		var xmlString=query.getBody();
		this.logPayload("Response Body from vRealize : "+xmlString);
		var helper = new XMLHelper(xmlString);
		var obj = helper.toObject();

		var xmlevents = obj['ops:alert'];

		if (xmlevents && !xmlevents.length && !Array.isArray(xmlevents))
			xmlevents = [xmlevents];
		var alertDefinitions = {};
		var resourcesMap = {};
		var emsName =  this.probe.getParameter("connector_name");
		var events = [];
		for (var i=0; i<xmlevents.length; i++) {
			var event = Event();
			var xmlalert = xmlevents[i];
			resId = xmlalert['ops:resourceId'];	
			resKey = xmlalert['ops:resourceId'];
			alertDefinition = xmlalert['ops:alertDefinitionId'];

			PullConnectorCustomDomainUtil.get().populateDomain(this.probe, event, xmlalert);

			// get resource properties
			if (!resourcesMap[resId])
				this.addToResourceMap(resourcesMap,resId);
			var resourceData = resourcesMap[resId];
			event.setField("node", this.exptractNodeFromProperties(resourceData));
			if (resourceData[RESOURCE_NAME])
				event.setField("resource", resourceData[RESOURCE_NAME]);
			// all resource properties are going to additional info			
			for (var key in resourceData) {
				if (resourceData.hasOwnProperty(key)) 
					event.setField(key, resourceData[key]);
			}
			event.setField("description", xmlalert['ops:alertDefinitionName']);
			event.setField("Criticality", xmlalert['ops:alertLevel']);
			var type = xmlalert['ops:alertDefinitionId'].replace("AlertDefinition-VMWARE-","");
			event.setField("type", type);
			event.setField("metric_name", type);
			event.setField("alertID", xmlalert['ops:alertId']);

			var severity=(xmlalert['ops:alertLevel']);
			event.setField("severity", this.mapSeverity(severity));

			event.setSource("vRealize");
			event.setEmsSystem(emsName);
			if(xmlalert['ops:alertImpact'])
				event.setField("AlertImpact", xmlalert['ops:alertImpact']);

			event.setField("AlertType", xmlalert['ops:type']);
			event.setField("AlertSubType", xmlalert['ops:subType']);
			var timePick;
			if (xmlalert['ops:cancelTimeUTC'] != 0) {		//if event is inactive take cancel time and generate closing event
				timePick = 'ops:cancelTimeUTC';
				event.setResolutionState("Closing");
			} else {
				timePick = 'ops:updateTimeUTC';
				event.setResolutionState("New");		
			}        		
			var timeStamp = xmlalert[timePick];
			event.setField("alertTimeStamp",timeStamp);
			var dateString = this.getEventDate(timeStamp);
			event.setField("Time of the alert: ", (dateString));
			event.setTimeOfEvent(dateString);

			events[i] = event;
		}
		return events;
	},	
	//convert from epoch time to string time 
	getEventDate: function(date) {
		// date starts at 0 to calculate the epoch time of each event.
		var d = new Date(0);
		d.setUTCSeconds(date/1000);
		// yyyy-MM-dd HH:mm:ss
		var year = "" + d.getUTCFullYear();
		var month = "" + (d.getUTCMonth() + 1); if (month.length == 1) { month = "0" + month; }
		var day = "" + d.getUTCDate(); if (day.length == 1) { day = "0" + day; }
		var hour = "" + d.getUTCHours(); if (hour.length == 1) { hour = "0" + hour; }
		var minute = "" + d.getUTCMinutes(); if (minute.length == 1) { minute = "0" + minute; }
		var second = "" + d.getUTCSeconds(); if (second.length == 1) { second = "0" + second; }
		var dateString = year + '-' + month + '-' +  day + ' ' + hour + ':' + minute + ':' + second;
		return dateString;
	},


	mapSeverity: function(severity) {
		var mappedSeverity = 5; //  info
		if (severity==='IMMEDIATE')
			mappedSeverity = 2;
		else if (severity==='CRITICAL')
			mappedSeverity = 1;
		else if (severity==='WARNING')
			mappedSeverity = 3;
		else if (severity==='INFORMATION')
			mappedSeverity = 5;
		return mappedSeverity;

	},
	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
	},
	debug: function(message) {
		if (isDebug == true || isDebug == "true") {
			ms.log("vRealize : " + message);
		}
		return true;
	},
	logPayload: function(message) {
		if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
			ms.log("vRealize Payload : " + message);
		}
		return true;
	},
	type: "vRealizeJSv1"
});
