var EvtMgmtHealthMonitorCommon = Class.create();
EvtMgmtHealthMonitorCommon.prototype = {
	
	//Please note, this script is used from HLA script HLASelfHealthManager
	
	OPERATIONAL_INTELLIGENCE : "operational_intelligence",
	DISTRIBUTED_CLUSTER_METRIC_NAME : "operational_intelligence/distributed_cluster_monitor",
	METRICS_COLLECTION_METRIC_NAME : "operational_intelligence/metrics_collection_monitor",
	SCHEDULED_JOBS_METRIC_NAME : "operational_intelligence/scheduled_jobs_monitor",
	OI_EXTENSION_METRIC_NAME : "operational_intelligence/oi_extension_monitor",

	initialize: function() {
	},
	
	allowHealthToRun : function (){
		return this.selfHealthActive() && this.domainSepConfigured();
	},
	
	// is self health feature active
	selfHealthActive: function(){
		var active = GlideProperties.get("evt_mgmt.self_health_active", "false");
		return active != "false";
	},
	
		// is self health feature active
	selfHealthOnlyAlertsActive: function(){
		var active = GlideProperties.get("evt_mgmt.self_health_active", false);
		return active == "partial";
	},
	
	// is the domain separation feature active
	isDomainSepActive:function (){
		var domainSeparationActive = 
			GlideProperties.get("glide.sys.domain.partitioning", false); 
		return domainSeparationActive == "true";
	},
	
	domainSepConfigured: function() {
		// if domain separation is active, the property which determines
		// which domain the montiring service is in must be set
		var isDomainActive = this.isDomainSepActive();
		var domainForSessionChange = 
			GlideProperties.get("evt_mgmt.domain_self_monitoring", "");
		if (isDomainActive){
			if (GlideStringUtil.nil(domainForSessionChange)){
				return false;
			}
			var gr = new GlideRecord("domain");
			gr.addQuery("sys_id", domainForSessionChange);
			gr.query();
			if (!gr.hasNext()){
				return false;				
			}
		}
		return true;
	},
	
	// Write a record to the em_xmlstats_data table
	writeToXMLStatsDataTable: function(metricName, category, value, recordTime, product) {
		var gr = new GlideRecord("em_xmlstats_data");
		gr.addQuery("metric_name",metricName);
		gr.addQuery("category",category);
		gr.query();
		if (gr.next()) {
			gr.setValue("value", value);
			gr.setValue("record_time", recordTime);
			gr.setValue("product", product);
			gr.update();
		} else {
			gr.setValue("metric_name", metricName);
			gr.setValue("category", category);
			gr.setValue("value", value);
			gr.setValue("record_time", recordTime);
			gr.setValue("product", product);
			gr.insert();
		}
	},
	
	//Returns a GlideRecord  of all relevant states
	getMonitorConfigRecord: function(scriptSysId) {
		var gr = new GlideRecord("em_monitor_conf");
		gr.addQuery("active","true");
		gr.addQuery("script",scriptSysId);
		gr.query();
		return gr;
	},
	
	//Returns a GlideRecord of all relevant states
	getAllConfigStates: function(mntrCnfgSysId) {
		var gr = new GlideRecord("em_monitor_state");
		gr.addQuery("active","true");
		gr.addQuery("monitor_conf_sys_id",mntrCnfgSysId);
		gr.query();
		return gr;
	},
	
	//Checks what should be the next state of the event/alert
	//Open (send a new/update event/alert)
	//Closed (send a close to the alert)
	//Do nothing - no need to update current event/alert
	getNextEventAlertStatus: function(mntrStateSysId, mntrStateGlideRecord, newSeverity) {
		var stateGr= this.getGlideRecord(mntrStateSysId, mntrStateGlideRecord, "em_monitor_state");
		
		var oldSeverity = stateGr.last_severity;
		var oldState = stateGr.last_state;
		
		if (oldState ==  "Closed") { //closed
			if ((newSeverity < "5") && (newSeverity > "0")) {
				return "Open";
			} else {
				return "Do Nothing";
			}
		} else {//current is open
			if ((newSeverity == "5") || (newSeverity == "0")) {
				return "Closed";
			} else if (newSeverity != oldSeverity) {
				return "Open"; // update alert
			} else {
				return "Do Nothing";
			}
		}
		
		return "Do Nothing"; //do nothing
		
	},
	
	//Checks rather a specific monitor should run
	shouldRun: function(mntrCnfgSysId, mntrConfgGr) {
		
		var gr = this.getGlideRecord(mntrCnfgSysId, mntrConfgGr, "em_monitor_conf");
		if (gr != null) {
			
			if (gr.getValue("active") === "false")
				return false;
			
			var frequency = parseInt(gr.getValue("frequency"));
			var lastRun = gr.getValue("last_run");
			
			var lastRunGdt = new GlideDateTime();
			
			if(!gs.nil(lastRun)) {
				lastRunGdt = new GlideDateTime(lastRun);
			}
			else{
				//for the first time we run
				lastRunGdt.addSeconds(-1 * frequency);
			}

			var now = new GlideDateTime();
			lastRunGdt.addSeconds(frequency);
			
			// it's time for a new run
			if (lastRunGdt.compareTo(now) <= 0) {
				return true;
			}
		}
		
		return false;
	},
	
	//Will check the value againts each threashold to decide which severity to create
	calculateSeverity: function(value, mntrCnfgSysId, mntrConfgGr, addInfo) {
		var gr = this.getGlideRecord(mntrCnfgSysId, mntrConfgGr, "em_monitor_conf");
		
        
        if (addInfo)
			addInfo.metric_value = ""+ value;
		
		var isBooleanValue = gr.getValue("boolean_value");
		
        if (isBooleanValue == 1){
            if (value == 0)
                return 5;
            var current_severity = gr.getValue("severity");
            addInfo.severity = current_severity;
            return current_severity;
        }
			
		var critical = gr.getValue("threshold_critical");
		var major = gr.getValue("threshold_major");
		var minor = gr.getValue("threshold_minor");
		var warning = gr.getValue("threshold_warning");
		

		
		if (gr != null && gr.getValue("comparison_direction") === '1') { //check rather value is bigger (or equal) to threshold
			if (GlideStringUtil.notNil(critical) && value >= critical){
				if (addInfo)
					addInfo.critical_threshhold = critical;
				return 1;
			}
			if (GlideStringUtil.notNil(major) && value >= major){
				if (addInfo)
					addInfo.major_threshhold = major;
				return 2;
			}
			if (GlideStringUtil.notNil(minor) && value >= minor){
				if (addInfo)
					addInfo.minor_threshhold = minor;
				return 3;
			}
			if (GlideStringUtil.notNil(warning) && value >= warning){
				if (addInfo)
					addInfo.warning_threshhold = warning;
				return 4;
			}
			return 5;
			
		} else { //check rather value is lower (or equal)
			if (GlideStringUtil.notNil(critical) && value <= critical){
				if (addInfo)
					addInfo.critical_threshhold = critical;
				return 1;
			}
			if (GlideStringUtil.notNil(major) && value <= major){
				if (addInfo)
					addInfo.major_threshhold = major;
				return 2;
			}
			if (GlideStringUtil.notNil(minor) && value <= minor){
				if (addInfo)
					addInfo.minor_threshhold = minor;
				return 3;
			}
			if (GlideStringUtil.notNil(warning) && value <= warning){
				if (addInfo)
					addInfo.warning_threshhold = warning;
				return 4;
			}
			return 5;
		}
		return 5;
	},
	
	//Check if the last value of the monitor is different from the current value
	//Update the alert if the value was changed
	openEventIfValueHasChanged: function(monitorStateGr, currValue) {
	    if (monitorStateGr) {
	        var oldValue = monitorStateGr.last_value;
	        if (oldValue != currValue) {
	            return "Open";
	        }
	    }
	    return "Do Nothing";
	},

	//Will return a json for the binding of the CI
	getCmdbCIData: function(generateAlert, mntrCnfgSysId, mntrConfgGlideRecord, mntrStateSysId, mntrStateGlideRecord, explicitBindedName) {
		
		var resData = this.getBindingData(generateAlert, mntrCnfgSysId, mntrConfgGlideRecord, mntrStateSysId, mntrStateGlideRecord, explicitBindedName);
		
		if (!generateAlert) {
			return resData;
		}
		//If creating a new alert, it means that there is a problem on event processing- bind to the accpected ci manually
		else {
			if (!(resData.ci_type)) //if it's empty, use cmdb_ci_appl_now_app
				resData.ci_type = "cmdb_ci_appl_now_app";
			
			var ciGr = new GlideRecord(resData.ci_type);
			
			if (resData.correlation_id) {
				ciGr.addQuery("correlation_id",resData.correlation_id);
			} else if (resData.internal_name) {
				ciGr.addQuery("internal_name",resData.internal_name);
			} else {
				ciGr.addQuery("internal_name","Event Processing");
			}
			
			resData.cmdb_ci = "";
			ciGr.query();
			if(ciGr.next()) {
				resData = {};
					resData.ci_type = "cmdb_ci_appl_now_app";
					resData.cmdb_ci = ciGr.sys_id;
				}
				
				return resData;
			}
		},
		
		getBindingData: function(generateAlert, mntrCnfgSysId, mntrConfgGlideRecord, mntrStateSysId, mntrStateGlideRecord, explicitBindedName) {
			var resData = {};

				//Add type to the event for the binding flow
				resData.ci_type = "cmdb_ci_appl_now_app";
				
				//If found monitored_sysid on the state- bind to it
				var stateGr = this.getGlideRecord(mntrStateSysId, mntrStateGlideRecord, "em_monitor_state");
				if (stateGr) {
					if (stateGr.monitored_sysid && (GlideStringUtil.notNil(stateGr.monitored_sysid))) {
						resData.correlation_id = stateGr.monitored_sysid + "";
						return resData;
					}
				}
				
				//If hadn't found monitored_sysid- try to bind to the defult ci for that monitoring tool
				var confGr = this.getGlideRecord(mntrCnfgSysId, mntrConfgGlideRecord, "em_monitor_conf");
				if (confGr) {
					if (confGr.default_ci_name && (GlideStringUtil.notNil(confGr.default_ci_name)) ) {
						//OOTB default_ci_name will be one of- "Event Management", "Event Processing", "Event Sources", "Alert Processing",  "MID Servers"
						resData.internal_name = confGr.default_ci_name + "";
						return resData;
					}
				}
			
				if (explicitBindedName && explicitBindedName + '' != 'undefined') {
					resData.internal_name = explicitBindedName;
					return resData;
				}
				
				if (generateAlert) {
					//Bind to the Event Processing if no binding was found, since it's an alert creation
					resData.internal_name = "Event Processing";
				} else {
					resData.internal_name = "Event Management";
				}
				return resData;
			},
			
			//Will be used by the event/alert generator
			getMessageKey: function(mntrCnfgSysId, mntrConfgGlideRecord, mntrStateSysId, mntrStateGlideRecord) {
				//If found state- bind to it
				var stateGr = this.getGlideRecord(mntrStateSysId, mntrStateGlideRecord, "em_monitor_state");
				if (stateGr) {
					return stateGr.sys_id;
				} else {
					return "";//use default message_key
				}
				
			},
			
			//Will update both monitor state table
			updateState: function(mntrStateSysId, newSeverity, newAlertState, newValue, stateAddInfo, message) {
				var stateGr= this.getGlideRecord(mntrStateSysId, null, "em_monitor_state");
				if (stateGr.isValid()) {
					stateGr.setValue("last_value", newValue);
					stateGr.setValue("last_state", newAlertState);
					stateGr.setValue("last_severity", newSeverity);
					stateGr.setValue("additional_info", stateAddInfo);
					stateGr.setValue("message", message);
					stateGr.update();
				}
			},
	
				//Will update monitor config table
			updateConfigLastRunState: function(mntrCnfgSysId, confAddInfo) {
				var confGr= this.getGlideRecord(mntrCnfgSysId, null, "em_monitor_conf");
				if (confGr.isValid()) {
					confGr.setValue("last_run", new GlideDateTime());
					confGr.setValue("additional_info", confAddInfo);
					confGr.update();
				}
			},
			
			//Will update monitor config table
			updateConfigLastRunStateWithTime: function(mntrCnfgSysId, confAddInfo, time) {
				
				var confGr= this.getGlideRecord(mntrCnfgSysId, null, "em_monitor_conf");
				if (confGr.isValid()) {
					confGr.setValue("last_run", time);
					confGr.setValue("additional_info", confAddInfo);
					confGr.update();
				}
			},
			
			//Will create a new  monitor state record if doesn't exist
			createNewState: function(name, fieldMessage, table, monitorSysId, addInfo, mntrCnfgSysId, stateDescription) {
				var gr = new GlideRecord("em_monitor_state");
				
				//find if record exsit by the reference (or by name if no reference)
				if (GlideStringUtil.notNil(mntrCnfgSysId))
					gr.addQuery("monitor_conf_sys_id", mntrCnfgSysId);
				
				if (GlideStringUtil.notNil(monitorSysId))
					gr.addQuery("monitored_sysid", monitorSysId);
				
				if (GlideStringUtil.notNil(name))
					gr.addQuery("name", name);
				
				gr.query();
				
				//If not exist- insert a new record
				if (!gr.next()) {
					//insert a new record
					gr = new GlideRecord("em_monitor_state");
					gr.setValue("name", name);
					gr.setValue("description", stateDescription);
					gr.setValue("message", fieldMessage);
					gr.setValue("table", table);
					gr.setValue("monitored_sysid", monitorSysId);
					gr.setValue("additional_info", addInfo);
					gr.setValue("monitor_conf_sys_id", mntrCnfgSysId);
					gr.insert();
				}
			},
			
			getGlideRecord: function(sysId, gr, tableName) {

				if (gr)
					return gr;
					
				if (GlideStringUtil.nil(sysId) || GlideStringUtil.nil(tableName))
					return null;

				var newGr = new GlideRecord(tableName);
				if (newGr.get(sysId))
					return newGr;
				
				return null;
			},
	
			deletePropFromGr: function(gr, propStr) {

				delete gr[propStr];
				return gr;
			},
			
			type: 'EvtMgmtHealthMonitorCommon'
		};
