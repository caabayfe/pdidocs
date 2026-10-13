var SolarWindsJS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;

var SOLAR_WINDS = "SolarWinds";
var MAX_EVENTS_TO_FETCH = 3000;
var errorMessage = "";
var isDebug = false;
var islogPayloadForDebug = false;

SolarWindsJS.prototype = Object.extendsObject(AProbe, {
    
    // test the connection with SolarWinds server
    testConnection : function() {

        ms.log("Solarwinds testing connection");
         
        var retVal = {};
        
        try {
			
            var response = this.getResponse(this.getQueryForTestConnection());

            if (response == null){
                retVal['status'] = FAILURE.toString();
                retVal['error_message'] = errorMessage;
                return retVal;
            }
            ms.log('SolarWindJS Connector Test Connection response:');  
            if (response.getStatusCode() == 200){
                ms.log(response.getBody()); 
                retVal['status']  = SUCCESS.toString();
            }
            else{
                this.addError(response.getErrorMessage());
                retVal['status']  = FAILURE.toString();
            }
            ms.log('result:' + response.getStatusCode());
        } catch (e) {
            retVal['status'] = FAILURE.toString();
        }
        
        ms.log("SolarWindJS Connector testConnection " + retVal['status'] );
        if (retVal['status'] === FAILURE.toString())
            retVal['error_message'] = errorMessage;
        return retVal;
                
    },
    
    execute: function() {
        
        ms.log("SolarWindJS Connector: execute connection ...");
        
        var retVal = {};
        isDebug = "" + this.probe.getAdditionalParameter("debug");
        islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");


        var resultArray = this.getResult(this.getQueryForExecute()); //retrieve all events from SolarWinds

        this.logPayload("Payload received from Solarwinds:" + JSON.stringify(resultArray));
        
        var events = this.getSNEvents(resultArray); //convert raw events to SN events
        if (events == null) {
            retVal['status'] = FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }
        
        // send all events
        var sender = SNEventSenderProvider.getEventSender();
        var i = 0;
        var successFlag = true;
        for (; i< events.length; i++) {
            if (events[i]) {
                successFlag = successFlag && sender.sendEvent(events[i]); //send each event
            }
        }
        
        if (successFlag) {
            retVal['status'] = SUCCESS.toString();
            if (events.length > 0) {
                this.updateLastSignature(events, retVal); //if all events were sent successfuly, update last signature
            }
        } else {
            retVal['status'] = FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }
        
        ms.log("SolarWindJS Connector: sent " + events.length +
        " events. Return to instance: status="+retVal['status'] +
        "  lastDiscoverySignature=" + retVal['last_event'] );
        
        return retVal;
    },
    
    getSNEvents: function(resultArray) {

        if (resultArray == null)
            return null;
        
        var events = [];
        
        // if no events were found, return
        if (resultArray.results.length === 0)
            return events;
        ms.log("resultArray.results.length: " + resultArray.results.length);
        
		// init all maps with additional information for events
        var eventTypes = this.getEventTypes();
        var applications = this.getApplications();
        var components = this.getComponents();
        var nodes = this.getNodes();
        var volumes = this.getVolumes();
        var interfaces = this.getInterfaces();
		var nodeProperties = this.getNodesProperties();
		
        if (eventTypes == null || nodes == null) {
            return null;
        }

        var latestTimestamp = this.probe.getParameter("last_event");
        var i = 0;
        for (; i<resultArray.results.length; i++) {

            var event =  this.createSNEvent(resultArray.results[i], eventTypes, 
            	applications, components, nodes, volumes, interfaces, nodeProperties);
            
            // filter out events on first pull
            if (!this.filterEvent(latestTimestamp, event)) {
                events.push(event);
            }
        }
        
        return events;
    },

    //ignore closed and info events on first action of pulling
    filterEvent : function (latestTimestamp, event) {
				if (latestTimestamp == null ){
					//checking if event is closed
					if( event.isClosing()){
						return true;
					}
					//checking if event is older than time period
					//time period format yyyy-MM-dd' 'HH:mm:ss.mmm
					
					var timeOfEvent = event.getTimeOfEvent().split(' ');
					var eventDate=timeOfEvent[0].split("-");
					
					var year= eventDate[0];
					var month= eventDate[1];
					var day=eventDate[2];
					//javascript month starts from 0
					var timeOfEventinMilis =new Date(year,month-1,day,0,0,0,0).getTime();
				    var initialSyncDays=this.probe.getAdditionalParameter("initial_sync_in_days");
					 
					//round to midnight
					var selectedTimePeriod=	new Date().setHours(0,0,0,0)-(initialSyncDays*24*60*60*1000);
					
					if(selectedTimePeriod>timeOfEventinMilis){
						ms.log("event with time stamp " + event.getTimeOfEvent()+" will be filtered out. It is older than "+initialSyncDays +" last days");
						return true;
					}
					
				}
				
				return false;
			},

    getQueryForTestConnection : function () {
        var query = "SELECT TOP 10 NodeID FROM Orion.Nodes";
        return query;
    },

    getQueryForExecute : function () {
        var latestTimestamp = this.probe.getParameter("last_event");

        var query = "SELECT TOP " + MAX_EVENTS_TO_FETCH + 
            " EventID, EventTime, NetworkNode, NetObjectID, EventType, Message, Acknowledged, " +
            "NetObjectType, Timestamp FROM Orion.Events " +
            "WHERE NetworkNode >= 0 AND NetObjectID > 0 ";

        if (latestTimestamp != null) { //differ between first collcection cycle to others 
            query = query + "AND EventID > " + latestTimestamp + " order by EventID asc ";
        } else {
            // in case it is the first collection cycle, take maxEventsCount events from the end
            query = query + " order by EventID desc ";
        }
        this.debug("Solarwinds query for events: " + query);
        return query;
    },

    getEventTimestampFieldName : function () { //return the name of event timestamp field
        return "swEventId";
    },

    getURL : function (host, query) {
        var port =  this.probe.getAdditionalParameter("port"); //retrieve all additional parameters unique to this Source

        var url = 'https://'+host+':' + port + '/SolarWinds/InformationService/v3/Json/Query?query='
        +encodeURIComponent(query);

        this.debug("Solarwinds url for event retrieval: " + url);
         return url;
    },

    createSNEvent : function (rawEvent, eventTypes, applications, components, nodes, volumes, interfaces, nodeProperties) { //get all cached information as well
        var event = Event();

        event.setSource(SOLAR_WINDS);
        var emsName =  this.probe.getParameter("connector_name"); 
        event.setEmsSystem(emsName); //set the connector instance name as source instance

        PullConnectorCustomDomainUtil.get().populateDomain(this.probe, event, rawEvent);
        
        if (rawEvent.EventTime != null)
            event.setTimeOfEvent(this.parseTimeOfEvent(rawEvent.EventTime)); 

        // remove not ascii chars
        var sanitizedMessage = rawEvent.Message.replace(/[^\x00-\x7F]/g, " ");
        // replace \" with "
        sanitizedMessage = sanitizedMessage.replace(/\\"/g, "\"");
        event.setText(sanitizedMessage);
            
        if (nodes[rawEvent.NetworkNode] != null) { 
        	var node = nodes[rawEvent.NetworkNode];
            event.setHostAddress(node[0]);
            event.setField("hostname", node[1]);
        }
            
        event.setField("eventType", rawEvent.EventType);
            
        if (eventTypes[rawEvent.EventType] != null) {
         	var icon = eventTypes[rawEvent.EventType][0];
           	event.setField("icon", icon);
          	if (icon === "Add" || icon === "Green" || icon === "Start")
            	event.setResolutionState("Closing");
            else
            	event.setResolutionState("New");

        } else {
           	event.setResolutionState("New");
       	}
		
		this.populateCustomProperties(event, rawEvent, nodeProperties);
             
    	event.setField("netObjectId", rawEvent.NetObjectID);
     	event.setField("swEventId", rawEvent.EventID); 
     	event.setField("networkNodeId", rawEvent.NetworkNode);
     	event.setField("NetObjectType", rawEvent.NetObjectType);

      	this.populateEventFieldsByNetObjectType(event, rawEvent, components, applications, interfaces, volumes, eventTypes, nodes);
        this.logPayload("Event object sent for Solarwinds event creation:"+event);

        return event;
    },

     populateEventFieldsByNetObjectType: function (event, rawEvent, components, applications, interfaces, volumes, eventTypes, nodes) {
     	
     	var NetObjectType = rawEvent.NetObjectType;
        this.debug("Solarwinds Network object type Property value: " + NetObjectType.trim());
        if (NetObjectType.trim() == 'AM') {
        // Network object type is Componenet - populate Metric Name and Resource fields
        	if (components != null) {
          		var component = components[rawEvent.NetObjectID];
            	if (component != null) {
                	event.setMetricName(component[0]);
                	if (component[1] != null && applications != null) {
                    	var applicationName = applications[component[1]];   
                    	if (applicationName != null)
                        	event.setResource(applicationName);

                	}
            	}
			}
        } else if (NetObjectType.trim() == 'AA') {
        // Network object type is Application - populate Resource field
        	if (applications != null) {
        		var application = applications[rawEvent.NetObjectID];
        		if (application != null)
        			event.setResource(application);
        	}
        } else if (NetObjectType.trim() == 'I' || NetObjectType.trim() == 'IW') {
			// Network object type is Interface - populate Metric Name and Resource fields
        	if (interfaces != null) {
        		var interfaceName = interfaces[rawEvent.NetObjectID];
        		if (interfaceName != null) {
        			event.setResource(interfaceName);
        			event.setMetricName(eventTypes[rawEvent.EventType][1]);
        		}	
        	}
        } else if (NetObjectType.trim() == 'V') {
        // Network object type is Volume - populate Metric Name and Resource fields
			if (volumes != null) {
        		var volumeName = volumes[rawEvent.NetObjectID];
        		if (volumeName != null) {
        			event.setResource(volumeName);
        			event.setMetricName(eventTypes[rawEvent.EventType][1]);
        		}
        	}
        } else if (NetObjectType.trim() == 'N') {
        // Network object type is Volume - populate Metric Name and Resource fields
			if (nodes != null) {
        		var nodeName = nodes[rawEvent.NetObjectID];
        		if (nodeName != null) {
        			event.setResource(nodeName);
        			event.setMetricName(eventTypes[rawEvent.EventType][1]);
        		}
        	}
        }
        // Otherwise, Metric Name and Resource fields will be empty
     },
	populateCustomProperties: function (event, rawEvent, nodesProperties) {
		if (nodesProperties != null && nodesProperties[rawEvent.NetworkNode] != null) {
			var nodePropertiesValue = nodesProperties[rawEvent.NetworkNode];
			
			var propetriesParam = this.probe.getAdditionalParameter("nodes_custom_properties");
			var propetriesArr = propetriesParam.split(',');
			for (var i = 0; i < propetriesArr.length; i++) {
				var currentProperty = propetriesArr[i].trim();
 				if (nodePropertiesValue[currentProperty] != null)
 					event.setField(currentProperty, nodePropertiesValue[currentProperty]);
			}
		}
	},

    getResponse : function (query) {
        //return parsed response according to the query type (such as REST or DB);
        return this.getResponseJSON(query, true);
    },
    
    getResponseJSON: function(query, reportError) {
        var request = this.createRequest(query);
        request.addHeader('Accept','application/json');
		var response = request.get();
		if (reportError && response == null)
			this.addError(request.getErrorMessage());
		return response;
    },
	
	getResponseNoError: function(query) {
		return this.getResponseJSON(query, false);
    },

    createRequest: function(query) {
        var username =  this.probe.getParameter("username");
        var password =  this.probe.getParameter("password");
        var host =  this.probe.getParameter("host");
     
        var url = this.getURL(host, query);
        var request = new HTTPRequest(url);
        request.setBasicAuth(username, password);
        return request;
    },

    updateLastSignature: function(events, retVal) {
        
        var timeOfEvent = this.getEventTimestampFieldName();
        // the result is sorted, but the sort order can differ. Therefore
        // the last signature is either on the first or the last event
        var firstEventSignature = events[0].getField(timeOfEvent); 
        var lastEventSignature = events[events.length-1].getField(timeOfEvent);
		
        if (parseInt(firstEventSignature) >= parseInt(lastEventSignature))
            retVal['last_event'] = firstEventSignature;
        else
            retVal['last_event'] = lastEventSignature;        
    },

     getResult : function (query) {
        
        var response = this.getResponse(query);

        if (response == null) {
            this.addError("SolarWindJS Connector: Failed to bring data. Null response");
            return null;
        }
        
        if (response.getStatusCode() != 200) {
            this.addError("SolarWindJS Connector Error Code: " +  response.getStatusCode());
            return null;
        }

        return this.parseToJSON(response); 

    },
	
	getResultNoError : function (query) {
        
        var response = this.getResponseNoError(query);

        if (response == null || response.getStatusCode() != 200) {
            return null;
        }
		
		return this.parseToJSON(response); 

    },
   
   //get response and parse it to JSON
    parseToJSON : function (response) {
        var parser = new JSONParser();
        var resultJson =  parser.parse(response.getBody() );
        ms.log("SolarWindJS Connector: Found " + resultJson.results.length + " records");
        return resultJson;
        
    },
   

    parseTimeOfEvent: function (sourceTime) {
		// input is yyyy-MM-dd'T'HH:mm:ss.mmm. we are taking yyyy-MM-dd HH:mm:ss
		var timeOfEvent = sourceTime.replace('T',' ');
		timeOfEvent = timeOfEvent.substring(0,19);
		return timeOfEvent;
    },

    getEventTypes : function () {
        
       var resultJson = this.getResult(
           "SELECT EventType, Name, Icon, NotifyMessage,NotifySubject FROM Orion.EventTypes");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        
        var i = 0;
        for (; i<resultJson.results.length; i++) 
            resultMap[resultJson.results[i].EventType] = 
					[resultJson.results[i].Icon, resultJson.results[i].Name];

        this.debug(" Solarwinds EventTypes are: " + JSON.stringify(resultMap));    
        return resultMap;
    },

    getApplications : function () {
        
        var resultJson = this.getResultNoError("SELECT ApplicationId, Name FROM Orion.Apm.Application");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        var i = 0;
        for (; i<resultJson.results.length; i++)  
            resultMap[resultJson.results[i].ApplicationId] = resultJson.results[i].Name;

        this.debug(" Solarwinds Applications: are: " + JSON.stringify(resultMap));    
        return resultMap;
    },
    
    getComponents : function () {

		var resultJson = 
            this.getResultNoError("SELECT ComponentID, Name, applicationID FROM Orion.Apm.Component");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        var i = 0;
        for (; i< resultJson.results.length; i++)  
                resultMap[resultJson.results[i].ComponentID] = 
                    [resultJson.results[i].Name, resultJson.results[i].applicationID];

        this.debug(" Solarwinds Components are: " + JSON.stringify(resultMap));            
        return resultMap;
    },

    getInterfaces : function () {

		var resultJson = 
            this.getResultNoError("SELECT InterfaceId, InterfaceName FROM Orion.NPM.Interfaces");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        var i = 0;
        for (; i< resultJson.results.length; i++)  
                resultMap[resultJson.results[i].InterfaceId] = resultJson.results[i].InterfaceName;
        
        this.debug(" Solarwinds Interfaces are: " + JSON.stringify(resultMap));            
        return resultMap;
    },

     getVolumes : function () {

		var resultJson = 
            this.getResultNoError("SELECT VolumeID, Caption FROM Orion.Volumes");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        var i = 0;
        for (; i< resultJson.results.length; i++)  
                resultMap[resultJson.results[i].VolumeID] = resultJson.results[i].Caption;
        
        this.debug(" Solarwinds Volumes are: " + JSON.stringify(resultMap));            
        return resultMap;
    },
    
    getNodes : function () {
        
       var resultJson = this.getResult(
           "SELECT NodeID, IPAddress, DNS FROM Orion.Nodes");

        if (resultJson == null)
            return null;
        
        var resultMap = {};
        
        var i = 0;
        for (; i<resultJson.results.length; i++) 
                resultMap[resultJson.results[i].NodeID] = 
                    [resultJson.results[i].IPAddress, resultJson.results[i].DNS];
        
        this.debug(" Solarwinds  Nodes are: " + JSON.stringify(resultMap));    
        return resultMap;
    },
	getNodesProperties : function () {
		
		var properties = this.probe.getAdditionalParameter("nodes_custom_properties");
		var resultMap = {};
		
		if (properties) {
			
			if (properties.startsWith("E.g:")) //no custom value -> no custom properties
				return null;
			
			query = "SELECT NodeID, " + properties + " FROM Orion.NodesCustomProperties";
			var resultJson = this.getResultNoError(query);
			if (resultJson == null)
			   return null;
        
			var i = 0;
			for (; i<resultJson.results.length; i++) 
					resultMap[resultJson.results[i].NodeID] = resultJson.results[i];
		}
        this.debug("SolarWinds  node custom properties: " + JSON.stringify(resultMap));
        return resultMap;
    },
	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
	},
    
	retrieveKpi : function() {
		var metricConnector = SolarWindsMetricsJS.get(this.probe).retrieveKpi();
        	this.debug("Solarwind metricConnector: " + metricConnector);
		return metricConnector;
	},
    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message) {
        if (isDebug == true || isDebug == "true") {
            ms.log("SolarWinds: " + message);
        }
        return true;
    },

    /**
     * Logging payload and event objectif the additional parameter logPayloadForDebug is set to be true
     *
     * @param message
     */
    logPayload: function(message) {
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
            ms.log("SolarWinds Payload: " + message);
        }
        return true;
    },
    type: "SolarWindsJS"
});
