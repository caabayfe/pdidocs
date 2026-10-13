var OMiJS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;

var Event = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;

var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var parser = new JSONParser();

var DEBUG = false;

var SOURCE = "OMi";
var errorMessage = "";
var LAST_EVENT = 0; //Get the last event id to query from
var lastEventStart = 0;
var LIMIT = 3000;
var FIRST_INIT = false;

var retVal = {};
var errorMessage = "";
var whitelist = [];
var now = Date.now();

var totalSize;
var pageSize;
var timestamp;

OMiJS.prototype = Object.extendsObject(AProbe, {

	/**
	 testConnection : The function is meant to establish if the connection the RESTful API from
	 OMi is active and running. This is done by probing the OMi API for it"s own version.
	 Cases that the function follows are:
	 - OMi API is running and returns status code 200 -> OK
	 - OMi API is not running, or no connection on the selected host is available, or Port(proxy)
	 hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
	 from the response, and also indicate the Status Code of the response -> FAILURE
	 */
	testConnection: function () {
		ms.log("*** OMi Connector testing connection ***");
		try {
			var timeStamp = this.getOmiDate(Date.now(),true);
			var response = this.createRequest("event_list", [{name: "watermark", value : timeStamp}]);
			var resData = this.getResponseBody(response);
			if (response.getStatusCode() == 200) {
				retVal.status = SUCCESS.toString();
			} else {
				this.addError(response.getErrorMessage());
				retVal.status = FAILURE.toString();
			}
		} catch (e) {
			this.addError(e.toString());
			retVal.status = FAILURE.toString();
		}

		ms.log("*** OMi test Connector status: " + retVal.status);
		if (retVal.status === FAILURE.toString()){	
			retVal.error_message = errorMessage;
			ms.log("*** OMi test Connector Error: " + retVal.error_message);
		}
		
		//retVal["last_event"] = "0";//Line used for resetting the last_event on the connector Instace with a Test Connection
		return retVal;
	},
	/**
	 * Function that the MID server uses to RUN the script. Main logic lies here.
	 * This is the code that the MID Server will run on each Iteraation.
	 * @returns An Object with specidfic associated Script return values [status,last_event]
	 */
	execute: function () {
		//
		try{
			DEBUG = this.probe.getAdditionalParameter("debug");
			DEBUG = (DEBUG == "true" || DEBUG == "1");
			LAST_EVENT = parseInt(this.probe.getParameter("last_event"), 10) || 0;
			//ms.log("*** LAST RUN TIMESTAMP FROM PROBE:" + LAST_EVENT + " / "+ this.getDate(LAST_EVENT));
			var firstInit = new Date();
			var days_from = parseInt(this.probe.getAdditionalParameter("days_from"), 10) || 1 ;
			firstInit.setDate(firstInit.getDate()-days_from);
			firstInit = firstInit.getTime();
			if(LAST_EVENT == 0){
				FIRST_INIT = true;
				LAST_EVENT = firstInit;
			}
			ms.log("*** LAST EVENT TIMESTAMP: [" + LAST_EVENT + "-"+ this.getDate(LAST_EVENT) + "] |  NOW : [" + now + "-"+ this.getDate(now)+"]");
			//
			whitelist = this.probe.getAdditionalParameter("whitelist");
			//assigned_user.user_name,node_hints.node.dns_name
			if(!!whitelist){
				whitelist = ""+whitelist;
				if(whitelist.length > 0 && whitelist != "false"){
					whitelist = whitelist.split(",");
				}else{
					whitelist = [];
				}
			}else{
				whitelist = [];
			}
			//
			ms.log("***** OMi CONNECTOR EXECUTE GET EVENTS! *****");
			//
			var events = this.getEvents();
			var currentStartIndex = 1;	
			do{
				if(events!=null){
					ms.log("*** QUERY NEW EVENTS RETURNED : " + events.length);
					var sender = SNEventSenderProvider.getEventSender();
					if (events.length > 0) {
						var snowNewEvents = this.createSNEvents(events);// Create an array of SNow Events from all the gathered data
						for (var i = 0; i < snowNewEvents.length; i++) {
							if (!sender.sendEvent(snowNewEvents[i])) {
								ms.log("*** ERROR sending SNow Event OBJ: " + JSON.stringify(snowNewEvents[i]));
								retVal.status = FAILURE.toString();
								this.addError("Error sending OMi event to SNOW.");
							}
						}
						ms.log("*** SNow EVENTS CREATED : " + snowNewEvents.length);
						retVal.status = SUCCESS.toString();
					} else {
						ms.log("****** NO NEW EVENTS TO SEND ******");
					}
				}else{
					retVal.status = FAILURE.toString();
					this.addError("OMi API Connection Error when getting Events");
				}
			    currentStartIndex += pageSize;
				if(currentStartIndex <= totalSize){
					events = this.getEvents(currentStartIndex);
				}
			}
			while(currentStartIndex < totalSize);
		}catch(exception){
			this.addError(exception.toString());
			retVal.status = FAILURE.toString();
		}
		if(retVal.status == FAILURE.toString()){
			retVal.status = FAILURE.toString();
			retVal.error_message = errorMessage;
			ms.log("LAST EVENT ID AFTER EXECUTION HAS NOT CHANGED !");
		}else{
			retVal.last_event = ""+LAST_EVENT;
			retVal.status = SUCCESS.toString();
			ms.log("LAST EVENT ID AFTER EXECUTION: " + retVal["last_event"]);
		}
		//
		ms.log("***** OMi CONNECTOR FINISH *****");
		return retVal;
		//
	},
	
	
	/**
	 * Function to automate the collection of New Events
	 * @returns {Array} [...] with all the Events
	 */
	getEvents: function (startIndex) {
		var events = [];
		var params = [];
		//
        if(startIndex){
			params.push({
				name: "watermark",
				value: timestamp
			});			
			params.push({
				name: "start_index",
				value: startIndex
			});			
		}else{
			timestamp = this.getOmiDate(LAST_EVENT,true);
			params.push({
				name: "watermark",
				value: timestamp
			});			
		}
		if(!FIRST_INIT){
			params.push({
				name: "include_closed",
				value: true
			});
		}
		
		//
		var query_filter = ""+this.probe.getAdditionalParameter("query_filter") || "";
		if(query_filter.length > 0 && query_filter != "false"){
			if(FIRST_INIT){
				query_filter += " AND severity NE \"Normal\"";
			}
			params.push({
				name: "query",
				value: query_filter
			});
		}else{
			if(FIRST_INIT){
				query_filter = "severity NE \"Normal\"";
				params.push({
					name: "query",
					value: query_filter
				});
			}
		}
		//
		var request = this.createRequest("event_list",params);
		if(!!request){
			var res = this.getResponseBody(request);
			
			//read global responce values like totalSize, pageSize, currentStartIndex 
			if(!startIndex){
			    var eventList = res["event_list"];
			    totalSize = eventList["@total_size"];
			    pageSize = eventList["@page_size"];
			}

			events = res["event_list"]["event"];
			//
			return events;
		}else{
			return null;
		}
	},

	/**
	 * Function to assemble and create a SNow Event Objects Array from all the needed pre-collected data
	 * @param events - Array of collected Events/Alerts
	 * @returns An {Array} [...] with all Valid collected and appended SNow Event Objects
	 */
	createSNEvents: function (events) {
		var res = [];
		lastEventStart = LAST_EVENT;
		
		for (var n = 0; n < events.length; n++) { //Iterating through all the collected events
			var event = events[n];
			if (event && n < LIMIT) {
				var eventTime = this.parseDate(event.time_changed);
				if(eventTime.getTime() > LAST_EVENT){
					var sEvent = this.createSNEvent(event);
					res.push(sEvent);//Appending this event to the stack of events to be returned.
				}else{
					//ms.log("OLD EVENT FILTERING: "+event.time_changed+" --- "+this.getDate(eventTime)+" --- "+eventTime.getTime()+" --- LAST:"+LAST_EVENT);
				}
			}
		}
		//
		LAST_EVENT = "" + lastEventStart;
		//
		// STRY54854858: populate connector tags in event additional info
		new ConnectorUtil().populateFieldInEvents(res, {'connector_tags': this.probe.getParameter('connector_tags')});
		return res;
	},

	createSNEvent : function(event){
		//
		//ms.log("EVENT: "+event.id);
		// Don't put events for sending if we already have them in SNow, we get 100 events per page and we may have more than needed on that page and we need to ingore them.
		var sEvent = Event(); // Initializing a new SNow Event record that will be populated with event/condition/app/server data.
		var emsName = this.probe.getParameter("connector_name");

		sEvent.setEmsSystem(emsName);
		sEvent.setSource(SOURCE);// Hardcoded

		PullConnectorCustomDomainUtil.get().populateDomain(this.probe, sEvent, event);

		//TO BE MADE CONDITIONAL MESSAGE-KEY
		var messageKey = SOURCE+"_";
		if(this.checkFields(event,["node_ref.node.name","related_ci.configuration_item.name"])){
			messageKey += ""+this.getField(event,"node_ref.node.name");
			if(!!this.getField(event,"category")){
				messageKey += "_"+this.getField(event,"category");
			}
			messageKey += "_"+this.getField(event,"related_ci.configuration_item.name");
			if(!!this.getField(event,"eti_value.eti.name")){
				messageKey += "_"+this.getField(event,"eti_value.eti.name");
			}else if(!!this.getField(event,"eti_hint")){
				messageKey += "_"+(this.getField(event,"eti_hint")).split(":")[0];
			}
		}else if(this.checkFields(event,["node_ref.node.name","related_ci_hints.hint"])){
			messageKey += ""+this.getField(event,"node_ref.node.name");
			if(!!this.getField(event,"category")){
				messageKey += "_"+this.getField(event,"category");
			}
			messageKey += "_"+this.getField(event,"related_ci_hints.hint");
			if(!!this.getField(event,"eti_value.eti.name")){
				messageKey += "_"+this.getField(event,"eti_value.eti.name");
			}else if(!!this.getField(event,"eti_hint")){
				messageKey += "_"+(this.getField(event,"eti_hint")).split(":")[0];
			}
		}else if(this.checkFields(event,["node_hints.hint","related_ci.configuration_item.name"])){
			messageKey += ""+(this.getField(event,"node_hints.hint")).split("|")[0];
			if(!!this.getField(event,"category")){
				messageKey += "_"+this.getField(event,"category");
			}
			messageKey += "_"+this.getField(event,"related_ci.configuration_item.name");
			if(!!this.getField(event,"eti_value.eti.name")){
				messageKey += "_"+this.getField(event,"eti_value.eti.name");
			}else if(!!this.getField(event,"eti_hint")){
				messageKey += "_"+(this.getField(event,"eti_hint")).split(":")[0];
			}
		}else if(this.checkFields(event,["node_hints.hint","related_ci_hints.hint"])){
			messageKey += ""+(this.getField(event,"node_hints.hint")).split("|")[0];
			if(!!this.getField(event,"category")){
				messageKey += "_"+this.getField(event,"category");
			}
			messageKey += "_"+this.getField(event,"related_ci_hints.hint");
			if(!!this.getField(event,"eti_value.eti.name")){
				messageKey += "_"+this.getField(event,"eti_value.eti.name");
			}else if(!!this.getField(event,"eti_hint")){
				messageKey += "_"+(this.getField(event,"eti_hint")).split(":")[0];
			}
		}else{
			messageKey = event.id;
		}
		sEvent.setMessageKey(messageKey);

		//
		sEvent.setText(event.title);

		//Setting severity for SNow from OMi needs an additional mapping between the numbers indicating the severity field.
		sEvent.setSeverity(this.getSeverity(event.severity)); //get the mapped severity between SNow and OMi
		//
		var eventTime = this.parseDate(event.time_changed);
		sEvent.setTimeOfEvent(this.getDate(eventTime));
		//ms.log("EVENT ["+event.id+"] DATE: "+event.time_changed + " ---- " + this.getDate(eventTime)+" ---- "+eventTime+" ---- "+eventTime.getTime());

		if(!!event.node_ref && !!event.node_ref.node && !!event.node_ref.node.name){
			sEvent.setHostAddress(event.node_ref.node.name); // will be mapped to node field
		}

		var metricName = "";

		if(!!event.eti_value){
			metricName = event.eti_value.eti.name;
		}
		sEvent.setMetricName(metricName);
		if(!!event.category){
			sEvent.setType(event.category);
		}
		//
		if(!!event.related_ci && !!event.related_ci.configuration_item && !!event.related_ci.configuration_item.type){
			sEvent.setResource(event.related_ci.configuration_item.type);
		}
		//
		if(event.state == 'open' || event.state == 'in_progress' || event.state == 'resolved'){
			sEvent.setResolutionState("New");
		}else if(event.state == "closed"){
			sEvent.setResolutionState("Closing");
		}else{
			sEvent.setResolutionState("New");
		}
		//
		//Fill in all custom attributes
		if(!!event.custom_attribute_list && !!event.custom_attribute_list.custom_attribute && event.custom_attribute_list.custom_attribute.hasOwnProperty("length")){
			//ms.log("EVENT WITH CUSTOM ATTRIBUTES: ID-"+event.id+" - ATTRS - "+JSON.stringify(event.custom_attribute_list.custom_attribute))
			for(var f=0; f<event.custom_attribute_list.custom_attribute.length; f++){
				var custom_field = event.custom_attribute_list.custom_attribute[f];
			  	if(!!custom_field.name && !!custom_field.value){
					this.eventSetProperty(sEvent, "custom_"+custom_field.name, custom_field.value);
					//ms.log("EVENT ADDING NEW CUSTOM ATTR: "+custom_field.name+ " - "+custom_field.value);
				}
			}
		}
		//
		//Whitelist search and insert
		if(!!whitelist && whitelist.hasOwnProperty("length") && whitelist.length > 0){
			//ms.log("EVENT WITH WHITELIST ATTRIBUTES: ID-"+event.id+" - ATTRS - "+JSON.stringify(whitelist))
			for(var i=0; i<whitelist.length; i++){
				var path = whitelist[i];
				var attr = this.getField(event,path);
				if(!!attr){
					path = path.split(".");
					for(var item in path){
						path[item] = path[item].split("_");
						path[item] = path[item].join("-");
					}
					path = path.join("_");
					this.eventSetProperty(sEvent, path, attr);
				}
			}
		}
		//
		//Setting additional attributes through the eventSetProperty function, passing the sEvent, key, value params to the function.
		//The function role is so to not set a param in the SNow Event if it is empty or null !
		this.eventSetProperty(sEvent, "omi_event_id", event.id);
		this.eventSetProperty(sEvent, "monitor_host", this.probe.getParameter("host"));
		this.eventSetProperty(sEvent, "configuration_item_name", event.related_ci.configuration_item.name);
		this.eventSetProperty(sEvent, "description", event.description);
		this.eventSetProperty(sEvent, "duration", event.duration);
		this.eventSetProperty(sEvent, "solution", event.solution);
		this.eventSetProperty(sEvent, "drilldown_url", event.drilldown_url);
		this.eventSetProperty(sEvent, "priority", event.priority);
		this.eventSetProperty(sEvent, "sub_category", event.sub_category);
		this.eventSetProperty(sEvent, "application", event.application);
		this.eventSetProperty(sEvent, "assigned_user", event.assigned_user.user_name);
		this.eventSetProperty(sEvent, "assigned_group", event.assigned_group.name);
		this.eventSetProperty(sEvent, "cause", event.cause.title);
		this.eventSetProperty(sEvent, "related_ci_hint", event.related_ci_hints.hint);
		this.eventSetProperty(sEvent, "node_dns", event.node_hints.node.dns_name);
		this.eventSetProperty(sEvent, "ip_address", event.node_hints.node.ip_address);
		this.eventSetProperty(sEvent, "eti_hint", event.eti_hint);

		//
		eventTime = eventTime.getTime();
		lastEventStart = eventTime > lastEventStart ? eventTime : lastEventStart;
		//
		return sEvent;
	},

	/**
	 * Function for checking whether to set a certian property for the SNow Event creation.
	 * @param event - SNow Event object
	 * @param key - The key to wich the additional field will be set
	 * @param value - The value to be set on that key
	 */
	eventSetProperty: function (event, key, value) {
		if (value) {
			//value = this.escapeSlashes(value);
			event.setField("u_" + key, value);
		}
		return event;
	},


	/**
	* Function for extracting an event field from custom mapping.
	* @param obj - Object to be lokking the data and fields from.
	* @param path - String with the Object value path separated in levels with a '.'
	*/
	getField: function(obj, path){
		if(!!obj && !!path){
			if(path.indexOf("event.") == 0){
				path = path.substr(6,path.length);
			}
			parts = path.split(".");
			if (parts.length==1){
				if(obj.hasOwnProperty(parts[0])){
					return obj[parts[0]];
				}else{
					return null;
				}
			}
			return this.getField(obj[parts[0]], parts.slice(1).join("."));
		}else{
			return null;
		}
	},
	/**
	* Function for checking mapping field availability.
	* @param obj - Object to be lokking the data and fields from.
	* @param path - String with the Object value path separated in levels with a '.'
	*/
	checkFields: function(obj,paths){
		var ret = true;
		//ms.log("CHECKING FIELDS:"+JSON.stringify(paths));
		for(var i=0;i<paths.length;i++){
			//ms.log("CHECKING FIELD:"+paths[i] + " -> " + !!this.getField(obj,paths[i]));
			if(!this.getField(obj,paths[i])){
				ret = false;
			}
		}
		return ret;
	},

	/**
	 * Function to parse the OMi timestamp into JS Date with the proper Hour.
	 * @param date - event object with params
	 * @returns {Date} Returns String formatted date
	 */
	parseDate: function(date){
		if(typeof date == "number"){
			return new Date(date);
		}else if(typeof date == "string"){
			
			var googleDate = "";
			var utcFormat=false;
			/*
			there might be different formats in OMI 
			it can be 2017-04-08T05:31:24.613Z just utc format
			or can be with timezone offset 2017-04-08T05:31:24.613+03:00
			*/
		if(date.contains("Z"))	{
			utcFormat=true;
			googleDate=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})((\.)(\d{1,3}))*/g;
		}
		else{
			googleDate=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})((\.)(\d{1,3}))*([+-])(\d{2}):(\d{2})/g;
		}
	
			var m = googleDate.exec(date);
			if(!m){
				return null;
			}
			var year = parseInt(m[1], 10);
			var month = parseInt(m[2], 10);
			var day = parseInt(m[3], 10);
			var hour = parseInt(m[4], 10);
			var minute = parseInt(m[5], 10);
			var second = parseInt(m[6], 10);
			var msec = parseInt(m[9], 10) || 0;

			var retDate = new Date();
			retDate.setUTCFullYear(year);
			retDate.setUTCDate(day);
			retDate.setUTCMonth(month - 1);
			retDate.setUTCHours(hour);
			retDate.setUTCMinutes(minute);
			retDate.setUTCSeconds(second);
			retDate.setUTCMilliseconds(msec);
			
            var offset_sign;
			var offset_hours ;
			var offset_minutes;
			//offset calculation
			if(!utcFormat){
			 offset_sign = m[10];
			 offset_hours = parseInt(m[11], 10) || 0;
			 offset_minutes = parseInt(m[12], 10) || 0;
			}

			if(!!offset_sign){
				if(offset_sign == "+"){
					retDate.setUTCHours(retDate.getUTCHours() - offset_hours);
					retDate.setUTCMinutes(retDate.getUTCMinutes() - offset_minutes);
				}else if(offset_sign == "-"){
          retDate.setUTCHours(retDate.getUTCHours() + offset_hours);
          retDate.setUTCMinutes(retDate.getUTCMinutes() + offset_minutes);
        }
			}
			return retDate;
		}else if(date instanceof Date){
	    return date;
		}else{
			return undefined;
		}
	},
	/**
	 * Function to parse a OMi format date/time value to a String formatted date.
	 * @param date - Integer clock value or Date Obj to be parsed and arranged into string value
	 * @returns {string} Returns String formatted date
	 */
	getOmiDate: function (date,simple) {
		var d = new Date();
		if(typeof date == "number"){
			d = new Date(date);
		}else if(typeof date === "string"){
			d = this.parseDate(date);
		}else if(date instanceof Date){
		    d = date;
		}
		var ret = "";
		if(!!date){
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

			var seconds = "" + d.getUTCSeconds();
			if (seconds.length == 1) {
				seconds = "0" + seconds;
			}
			var miliseconds = "" + d.getMilliseconds();
			if (miliseconds.length == 1) {
				miliseconds = "00" + miliseconds;
			}else if(miliseconds.length == 2){
				miliseconds = "0" + miliseconds;
			}
			//ms.log("OMI GET DATE -> " + " ---- Date : "+date + " ---- Parsed Date: "+d.toUTCString());
			if(!!simple){
				ret = ""+(year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + seconds+"Z");
			}else{
				var offset = d.getTimezoneOffset();
				var offset_sign = d >= 0 ? "+" : "-";
				var offset_hours = offset / 60;
				var offset_minutes = offset % 60;
				offset_minutes = (offset_minutes > 0 ? (offset_minutes < 10 ? "0"+offset_minutes : offset_minutes) : "00");
				var offsetStr = "" + offset_sign + offset_hours + ":" + offset_minutes;
				ret = ""+(year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + seconds + ":" + miliseconds + offsetStr);
			}
		}else{
			ms.log("DATE PARSE PROBLEM: "+date);
			ret = "";
		}
		return ret;
	},


	/**
	 * Function to parse a Epoch time value to a String formatted date.
	 * @param date - Integer clock value or Date Obj to be parsed and arranged into string value
	 * @returns {string} Returns String formatted date
	 */
	getDate: function (date) {
		var d;
		if(typeof date == "number"){
			d = new Date(date);
		}else if(typeof date == "string"){
			d = this.parseDate(date);
		}else if(date instanceof Date){
			d = date;
		}
		if(d instanceof Date){
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
			//ms.log("GET DATE -> " + " ---- Date : "+date + " ---- Parsed Date: "+d.toUTCString());
			return (year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second);
		}else{
			ms.log("DATE PARSE PROBLEM: "+date);
			return "";
		}
	},

	/**
	 * Function for returning a mapped value for the Event Severity
	 * Service now severity : 1-Critical 2-Major 3-Minor 4-Warning 5-Info
	 * OMi severities : "Informational" and "Severe" and "Warning"
	 * @param key the value from OMi data
	 * @returns {*} Returns the associated map value
	 */
	getSeverity: function (key) {
		var map = {
			"critical" : 1,
			"major": 2,
			"minor": 3,
			"warning": 4,
			"unknown": 4,
			"normal": 5
		};
		return map[key] ? map[key] : null;
	},

	/**
	 * Function for generating consistent GET request params string.
	 * @param params - Object with key value pairs for the Quety Params
	 * @returns a JS Encoded String with the body params needed for a request
	 */
	getRequestQuery: function (params) {
		function hasParam(p){
			for(var i=0; i<params.length; i++){
				if(params[i].name == p){
					return true;
				}
			}
			return false;
		}
		if(!hasParam("order_by")){
			params.push({
				name: "order_by",
				value: "time_changed"
			});
		}
		if(!hasParam("order_direction")){
			params.push({
				name: "order_direction",
				value: "ascending"
			});
		}
		if(!hasParam("page_size")){
			params.push({
				name : "page_size",
				value: LIMIT
			});
		}
		if(!hasParam("format")){
			params.push({
				name: "format",
				value: "JSON"
			});
		}
		//ms.log("*** PARAMS TO BE URL encoded : "+JSONparser.encode(params));
		var q = "?";
		var separator = params.length > 1 ? "&" : "";
		for (var i = 0; i < params.length; i++) {
			var param = params[i];
			q += (param.name + "=" + param.value + separator);
		}
		//ms.log("*** URL encoded : "+q);
		if (q.length < 2) q = "";
		return q;
	},

	/**
	 * Function for generating and executing automatically a REST request with a SET method and object params
	 * @param method String with the method of extraction (New or Updated Events) event_list/event_change_list
	 * @param params An JS Object with the request paramaters to be encoded
	 * @returns Java object with the response.
	 */
	createRequest: function (method, params) {
		var username = this.probe.getParameter("username");
		var password = this.probe.getParameter("password");
		var host = this.probe.getParameter("host");
		var port = this.probe.getAdditionalParameter("url_port") || 80;
		var protocol = this.probe.getAdditionalParameter("protocol") || "http";
		port = (port == 80 ? "" : (":" + port));
		//
		var query = this.getRequestQuery(params);
		method = !!method ? method : "event_list";
		//http(s)://<FQDN>/opr-web/rest/9.10/event_list
		var url = protocol + "://" + host + port + "/opr-web/rest/9.10/" + method + query;
		url = encodeURI(url);
        if (DEBUG) {
			ms.log("OMi API Request: "+url);			
		}

		var request = new HTTPRequest(url);
		request.setBasicAuth(username, password);
		request.addHeader("Content-Type", "application/json");

		try {
			var response = request.get();
			var status = response.getStatusCode();
			if (status == 200) {
				//ms.log("API RESPONSE BODY: \n"+ response.getBody());
				return response;
			}else {
				this.addError("RESPONSE STATUS ERROR No: " + status);
				this.addError("RESPONSE ERROR : " + response.getBody());
				return null;
			}
		}
		catch (e) {
			this.addError(e.toString());
			return null;
		}
	},

	/**
	 * Parse the body from the response of a request
	 * @param response - the HTTPresponse object to get the responseBody from
	 * @returns {*} - a parsed JSON object from the string of the body
	 */
	getResponseBody: function (response) {
        var body = response.getBody();
        //ms.log("*** RESPONSE BODY : \n" + body + "\n *** END ***");
        var res = parser.parse(body);
		//JSUtil.logObject(res);
        return res;
    },
	
	/**
	 * Generalized function for managing the errors in the script.
	 * @param message - A string Message with the error to be managed.
	 * @returns Nothing. Void function
	 */
	addError: function (message) {
		if (errorMessage === ""){
			errorMessage = message;
		}else{
			errorMessage += "\n" + message;
		}
		ms.log("ERROR: "+message);
	},

	/**
	 * Function for logging and debugging data
	 * @param data
	 */
	debug: function (message, data) {
		message = message ? message : "";
		if (data) {
			if (typeof data === "object") {
				data = JSON.stringify(data) || parser.stringify(data) || JSUtil.logObject(data);
			}else{

			}
			if (DEBUG) {
				ms.log("MESSAGE:" + message + (data ? (" DATA : " + data + "") : ""));
			}
		}
	},

	type: "OMiJS"
});
