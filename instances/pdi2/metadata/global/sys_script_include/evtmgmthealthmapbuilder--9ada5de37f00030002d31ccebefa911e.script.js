var EvtMgmtHealthMapBuilder = Class.create();
EvtMgmtHealthMapBuilder.prototype = {
	
	//Please note, this script is used from HLA script HLASelfHealthManager
	
    initialize: function() {
		this.DISCOVERY_SOURCE = 'discovery_source';
    },
	
	serviceName:function(){
		return "ServiceNow Event Management";
	},
	
	eventSourcesName:function(){
		return "Event Sources";
	},

	eventSourcesInternalName:function(){
		return "Event Sources";
	},
	
	midServersName:function(){
		return "MID Servers";
	},

	midServersInternalName:function(){
		return "MID Servers";
	},
	
	createService:function(){
		
		var healthCommon = new EvtMgmtHealthMonitorCommon();
		
		if (!healthCommon.allowHealthToRun() || healthCommon.selfHealthOnlyAlertsActive()){
			return false;
		}

		var createdNewService = false;
						
		/*********************************************/
		// -------------- Helper methods -------------/

		/*********************************************/
		// --- Static Service Component Modeling -----/
	
		var service = this.createServiceName();
	
		var em = this.createEmApp();

		var mids = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(mids, {internal_name: this.midServersInternalName(), name: this.midServersName(), 
								   discovery_source: "EventManagement"});

		var evProc = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(evProc, {internal_name: "Event Processing", name: "Event Processing", 
									 discovery_source: "EventManagement"});

		var evSources = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(evSources, {internal_name: this.eventSourcesInternalName(), name: this.eventSourcesName(), 
										discovery_source: "EventManagement"});

		var alertProc = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(alertProc, {internal_name: "Alert Processing", name: "Alert Processing", 
										discovery_source: "EventManagement"});
		
		var impactCalc = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(impactCalc, {internal_name: "Impact Calculation", name: "Impact Calculation", 
										discovery_source: "EventManagement"});

		this.createRel(service, em);
		this.createRel(service, mids);
		this.createRel(em, evProc);
		this.createRel(em, evSources);
		this.createRel(em, alertProc);
		this.createRel(em, impactCalc);


		/*********************************************/
		// ------- Dynamic Connector Modeling --------/
		gs.info("createConnectorCIs - start");
		var existingCis={};
		var grConnectorCis = new GlideRecord('cmdb_ci_appl_now_connector');	
		this.query (grConnectorCis, {category: "Connector"});
		while (grConnectorCis.next()){
			existingCis["" + grConnectorCis.correlation_id] = "Delete";
		}
		var grConnectors = new GlideRecord('em_connector_instance');
		this.query(grConnectors, {active:true});
			
		while (grConnectors.next()){
			this.addOrUpdateConnector(grConnectors);
			var id = grConnectors.sys_id;
			if (existingCis[id]) {
				existingCis[id] = "Exists";
				gs.debug("Connector Exists - "+grConnectors.name+" "+id);
			} else {
				// no CI for this connector, add it.
				gs.debug("Connector Added - "+grConnectors.name+" "+id);
			}			
		}
		var ci;
		for (var connectorId in existingCis){
			if (existingCis[connectorId]=="Delete"){
				var grConnectorCi = new GlideRecord("cmdb_ci_appl_now_connector");
				this.query(grConnectorCi, {"correlation_id": connectorId, category:"Connector"});
				while (grConnectorCi.next()){
					this.removeDynamicCi(grConnectorCi);
				}

				//delete this one
			}				
		}

		/*********************************************/
		// ------- Dynamic MID Modeling --------/
		// add mid servers
		var ecc_agent = new GlideRecord("ecc_agent");
		ecc_agent.addQuery('validated', 'true');
		ecc_agent.query();
		var activeMids = {};
		var mid;
		while (ecc_agent.next()) {
			mid = this.addOrUpdateMid(ecc_agent);
			// ci already exists for this connector, flag it
			activeMids["" + mid.sys_id] = true;
		}

		// delete rels to not found mids
		mid = new GlideRecord("cmdb_ci_appl_now_mid");
		this.query(mid, {category: "MID"});
		while(mid.next()) {
			if (!activeMids["" + mid.sys_id]) {
				this.removeDynamicCi(mid);
			}
		}

		
		/*********************************************/
		// ------ Call Manual Service Builder --------/
		return this.buildService(service);
    },
	
	buildService : function (service){
		/*********************************************/
		// ------ Call Manual Service Builder --------/
		var bsm = new SNC.BusinessServiceManager(); 
		var exclusionListRelations = gs.getProperty("sa.mapping.system.manual.rel_type.blacklist","");
		exclusionListRelations = exclusionListRelations.split(',');
		
		var emExclusionListRelations = gs.getProperty("evt_mgmt.hlt_monitor_rel_type_exclusive_list","");
		emExclusionListRelations = emExclusionListRelations.split(',');
		// Always exclude "Runs on::Runs" type by default
		emExclusionListRelations.push('60bc4e22c0a8010e01f074cbe6bd73c3');
		
		
		var exclusions = exclusionListRelations.concat(emExclusionListRelations).filter(function(s) { return s }).join(',');
		
		if (!bsm.populateDiscoveredService(service.getUniqueValue(), 5, exclusions)) {
			gs.log('Failed to populate Self Health service. ' + bsm.error);
			return bsm.error;
		}
		return null;
	},
	
	/*********************************************/
	// ------ Dynamic Add Remove --------/
	
	removeDynamicCi : function (grToRemove){
		var service = new GlideRecord("cmdb_ci_service_discovered");
		this.query(service, {name: this.serviceName()});
		if (service.next()){
			this.removeRel(grToRemove);
			this.removeFromModel(service, grToRemove);
			gs.debug("Delete CI relationship -"+grToRemove.name);			
		} else {
			gs.debug("Cound not retrieve service");
		}
	},
	
	addOrUpdateConnector : function (grConnector){
		var grSources = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.query(grSources, {internal_name: this.eventSourcesInternalName()});
		if (grSources.next()){
			var id = "" + grConnector.sys_id;
			var name = "" + grConnector.name;
			//var host = "" + grConnector.host;
			var flds = {name: name, correlation_id:id, category: "Connector", 
						connector:id, discovery_source: "EventManagement"};
			this.updateDynamicCi("cmdb_ci_appl_now_connector", flds, grSources, id);
			
		} else {
			gs.debug("Cound not retrieve parent: Event Sources");
		}
	},
	
	addOrUpdateMid : function (grEccAgent){
		var mids = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.query(mids, {internal_name: this.midServersInternalName()});
		if (mids.next()){
			var name = "" + grEccAgent.name;
			var fqdn = "" + grEccAgent.host_name;
			var ip = "" + grEccAgent.ip_address;
			var id = "" + grEccAgent.sys_id;
			var version = "" + grEccAgent.version;
			var midFlds = {name: name, fqdn: fqdn, ip_address: ip, 
						   correlation_id: id, version: version, category: "MID", 
						   mid_server:id, discovery_source: "EventManagement"};
			var mid = this.updateDynamicCi("cmdb_ci_appl_now_mid", midFlds, mids, id);
			
			return mid;			
		} else {
			gs.debug("Cound not retrieve parent: MIDs");
		}

	},
	
	updateDynamicCi : function (type, fields, parent, id){
		var grCi = new GlideRecord(type);
		this.insertOrUpdateById(grCi, fields, id);
		this.createRel(parent, grCi);
		return grCi;
	},
	
	/*********************************************/
	// -------------- Helper methods -------------/
	query: function(gr, vals) {
		gs.debug("query " + gr.getTableName() + ", fields: " + JSON.stringify(vals));
		for (var key in vals) {
			if (key === "name" && vals.internal_name) //ignore 'name' in case internal name exists - use  internal name to query
				continue;
			if (key === this.DISCOVERY_SOURCE) // Skip 'discovery_source' in query as it's a dynamic field that might return inconsistent results
				continue;
			gr.addQuery(key, vals[key]);
		}
		return gr.query();
	},

	queryByCorrelationId: function(gr, correlationId) {
		gs.debug("query " + gr.getTableName() + ", correlationId: " + correlationId);
		gr.addQuery("correlation_id", correlationId);
		return gr.query();
	},

	update: function(gr, vals) {
		var sessionId = this.changeDomain();
		
		for (var key in vals) {
			gr.setValue(key, vals[key]);
		}
		var ret = gr.update();
		
		gs.getSession().setDomainID(sessionId);
		
		return ret;
			
	},

	insert : function(gr, vals) {
		var sessionId = this.changeDomain();
		for (var key in vals) {
			gr.setValue(key, vals[key]);
		}
		var ret =  gr.insert();  
		
		gs.getSession().setDomainID(sessionId);
		
		return ret;
	},

	deleteRecord : function(gr, vals) {
		var sessionId = this.changeDomain();
		for (var key in vals) {
			gr.addQuery(key, vals[key]);
		}
		var ret = gr.deleteMultiple();

		gs.getSession().setDomainID(sessionId);
		
		return ret;
	},

	insertOrUpdate : function(gr, vals) {
		this.query(gr, vals);
		if (gr.next())
			return this.update(gr, vals);

		return this.insert(gr, vals);
	},

	insertOrUpdateById : function(gr, vals, id) {
		this.queryByCorrelationId(gr, id);
		if (gr.next())
			return this.update(gr, vals);

		return this.insert(gr, vals);
	},

	createRel : function(source, target) {
		var gr = new GlideRecord("cmdb_rel_ci");
		// create Depends On::Used By relation
		var fields = {parent: "" + source.sys_id, child: "" + target.sys_id, type: "1a9cb166f1571100a92eb60da2bce5c5"};
		gs.debug("createRel: " + JSON.stringify(fields));
		this.insertOrUpdate(gr, fields);
	},

	removeRel : function(target) {
		var gr = new GlideRecord("cmdb_rel_ci");
		// create Depends On::Used By relation
		var fields = { child: "" + target.sys_id, type: "1a9cb166f1571100a92eb60da2bce5c5"};
		gs.debug("removeRel: " + JSON.stringify(fields));
		this.deleteRecord(gr, fields);
	},

	removeFromModel : function(manualService, ci) {
		var sm = new SNC.BusinessServiceManager();
		if (!sm.removeManualCi(ci.getUniqueValue(), manualService.getUniqueValue())) {  
			gs.log('Self health: Failed to remove CI ' + sm.error);
			return sm.error;
		}
		return null;          
	},
	
	changeDomain: function (){
		var orgSessionID = gs.getSession().getCurrentDomainID();		
             
		var domainForSessionChange = GlideProperties.get("evt_mgmt.domain_self_monitoring", "");

		if (orgSessionID != domainForSessionChange && GlideStringUtil.notNil(domainForSessionChange)) {
			gs.debug("Changing domain from "+orgSessionID+" to "+domainForSessionChange);
			gs.getSession().setDomainID(domainForSessionChange);
			return orgSessionID;
		}
		
		return null;
	},
	
	createServiceName: function() {
		
		var service = new GlideRecord("cmdb_ci_service_discovered");
		this.query(service, {name: this.serviceName()});
		if (!service.next()) {
			createdNewService = true;
			this.insert(service, {name: this.serviceName(), operational_status: 1});
		}
		
		return service;
	},
	
	createEmApp: function() {
		
		var em = new GlideRecord("cmdb_ci_appl_now_app");
		this.insertOrUpdate(em, {internal_name: "Event Management",
							name: "Event Management", discovery_source: "EventManagement"});
		return em;
	},
	
	createMonitoringApp: function() {
		
		var service = this.createServiceName();
		var em = this.createEmApp();
		
		var monitoring = new GlideRecord("cmdb_ci_appl_now_app_comp");
		this.insertOrUpdate(monitoring, {internal_name: "Monitoring", name: "Monitoring", 
										discovery_source: "EventManagement"});

		this.createRel(em, monitoring);
	},


    type: 'EvtMgmtHealthMapBuilder'
};
