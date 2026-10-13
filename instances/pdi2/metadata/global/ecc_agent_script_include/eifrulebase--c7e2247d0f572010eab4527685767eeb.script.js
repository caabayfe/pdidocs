var EIFRuleBase = Class.create();

EIFRuleBase.prototype = {

	initialize : function() {
		/*
		* Java packages
		*/
		this.EIF_EVENT = Packages.com.service_now.mid.extension.eif.EIFEvent;
		this.EVENT = Packages.com.snc.commons.eventmgmt.Event;
		this.EXPPARAM = Packages.com.service_now.mid.extension.EIFExtParameters;
		this.DATETIMEFORMATTER = Packages.java.time.format.DateTimeFormatter;
		this.LOCALDATETIME = Packages.java.time.LocalDateTime;
		this.ZONEID = Packages.java.time.ZoneId;
		this.ZONEOFFSET = Packages.java.time.ZoneOffset;
		this.ZONEDDATETIME = Packages.java.time.ZonedDateTime;
		this.STRINGMAP = Packages.com.glide.collections.StringMap;
		this.STRING = Packages.java.lang.String;

		/*
		* Vars
		*/
		this.itmDTFmt = this.DATETIMEFORMATTER.ofPattern("MM/dd/yyyy HH:mm:ss.SSS");
		this.snowDTFmt = this.DATETIMEFORMATTER.ofPattern("yyyy-MM-dd HH:mm:ss");
		this.defaultMap = {
			"source": "source", 
			"sub_origin": "resource", 
			"cms_hostname": "node",
			"_event_class": "metric_name", 
			"msg": "description", 
			"severity": "severity"
		};

	},

	/**
     * Override this function in EIFSourceRule for custom processing requirements
     */
	run: function(eifEvent, extParam) {
		var event = new this.EVENT();  //  The servicenow event passed to the instance
		var source = eifEvent.get("source");

		if (source.startsWith("ITM"))
			event = this.itmEventProcessor(event, eifEvent, extParam);
		else
			event = this.defaultEventProcessor(event, eifEvent, extParam);

		return event;
	},

	defaultEventProcessor: function (event, eifEvent, extParam) {
		// Run the field map for thr event using the default map in EIFSourceRule base
		event = this.fieldMap(eifEvent, event, this.defaultMap);

		// Set the message key
		var keyFields = ["_event_class", "source", "sub_source", "sub_origin"];
		event.setMessageKey(this.getMsgKey(eifEvent, keyFields));

		// Set the timestamp to now, as we do not know which field to use for generic EIF events
		event.setGMTNowTimeOfEvent();

		return event;
	},

	itmEventProcessor: function (event, eifEvent, extParam) {
		// Drop situation clearing event from agent switch
		if (eifEvent.containsKey("situation_eventdata") && eifEvent.containsKey("situation_status") && eifEvent.containsKey("integration_type")) {
			if (eifEvent.get("integration_type") == "U" && eifEvent.get("situation_status") == "N" && eifEvent.get("situation_eventdata") == "DROP~") {
				event.setField("message_key", "DROPEVENT");
				return event;
			}
		}

		var fieldMap = {
			source: "source",
			cms_hostname: "event_class",
			sub_origin: "resource", 
			cms_hostname: "node",
			_event_class: "metric_name", 
			msg: "description", 
			severity: "severity"
		};

		// Message key default fields
		var keyFields = ["_event_class", "situation_name", "situation_type", "situation_origin", "situation_displayitem"];

		// Handle master resets
		if (eifEvent.get("situation_name") == '**') {
			keyFields.push("cms_hostname");  // ensure the event is correctly deduped
			eifEvent.put('situation_status', 'Y');  // To ensure the event is processed at the instance
		}

		// set the message key
		event.setMessageKey(this.getMsgKey(eifEvent, keyFields));


		// Set the timestamp
		if (eifEvent.containsKey("situation_time")) {
			var evtDt = this.getEventDT(eifEvent.get("situation_time"), this.itmDTFmt);
			if (evtDt !== undefined)
				event.setTimeOfEvent(evtDt);
		}

		// Or set to now if that wasnt possible
		if (event.getTimeOfEvent() == null)
			event.setGMTNowTimeOfEvent();

		// situation_status handling
		if (eifEvent.containsKey("situation_status")) {
			var situationStatus = "" + eifEvent.get("situation_status");  // +"" to convert java string to js string
			if (situationStatus == "N")
				event.setResolutionState("Closing");
			else if (situationStatus == "A")
				eifEvent.put("acknowledged", "true");
			else if (situationStatus == "E")
				eifEvent.put("acknowledged", "false");
			else if (situationStatus == "F")
				eifEvent.put("acknowledged", "false");
		}

		// Parse situation_eventdate field and store as JSON string
		if (eifEvent.containsKey("situation_eventdata")) {
			var situation_eventdata = eifEvent.get("situation_eventdata");
			if (situation_eventdata != undefined)
				eifEvent.put("situation_eventdata", this.itmParseEvtData(situation_eventdata));
		}

		// Run field mapping - best run last as this deals with additional info including any changes made above
		event = this.fieldMap(eifEvent, event, fieldMap);

		return event;	
	},

	itmParseEvtData: function (situation_eventdata) {		
		ms.log("situation_eventdata=" + situation_eventdata);
		if (situation_eventdata != undefined) {
			var kvp = situation_eventdata.split(";");  // get key/value paris from event data
			var parsedSitData = {};

			for (var kvpI in kvp) {

				var kv = kvp[kvpI].split("=");
				ms.log("kvp=" + kvp[kvpI] + "; kv:  len=" + kv.length + "; key="+kv[0]+"; value="+kv[1]);
				if (kv.length == 2)
					parsedSitData[kv[0]] = kv[1];
			}
			return JSON.stringify(parsedSitData);
		}		

		return "";
	},

	getEventDT: function (value, evtDTFmt, zone) {
		try {
			var ldt = this.LOCALDATETIME.from(evtDTFmt.parse(value));  // Localdatetime from the value/format

			if (zone == undefined)
				zone = this.ZONEID.systemDefault();
			var lzdt = ldt.atZone(zone);  // Add system time zone to the local date format
			var uzdt = lzdt.withZoneSameInstant(this.ZONEID.of("UTC"));  // Create a UTC zoned DT

			return uzdt.format(this.snowDTFmt);  //  Return the UTC time of the event
		}
		catch (ex) {
			ms.log("Unable to parse time from event: " + ex.getMessage() + " " + ex.stack);
		}
	},

	fieldMap: function (eifEvent, event, map) {
		var keys = eifEvent.keySet().toArray();
		var addInfo = new this.STRINGMAP();
		for (var i in keys) {
			var k = keys[i];
		//	ms.log("eif event "+k+"="+eifEvent.get(k));
			if (map[k] !== undefined) {
				event.setField(map[k], eifEvent.get(k));
			}
			else {
				addInfo.put(k, eifEvent.get(k));
			}
		}

		// Set additional info
		event.setAdditionalParameters(addInfo);

		return event;
	},

	getMsgKey: function(eifEvent, keyFields) {
		var msgKey = [];  // Add event class to message key
		for (var kf in keyFields) {
			if (eifEvent.containsKey(keyFields[kf]))
				msgKey.push(eifEvent.get(keyFields[kf]));
		}
		return msgKey.join("~");
	},

	type: "EIFRuleBase"
};
