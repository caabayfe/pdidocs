var EvtMgmtConvertAndPopulateITService = Class.create();
EvtMgmtConvertAndPopulateITService.prototype = {
    initialize: function() {
    },

	execute: function (serviceName, depth){
		gs.log("EvtMgmtConvertAndPopulateITService start convert for" + serviceName);

		var manualClass = 'cmdb_ci_service_manual';
		var discoveredClass = 'cmdb_ci_service_discovered';

		var serviceGr = new GlideRecord(manualClass);
		serviceGr.addQuery("name", serviceName);
		serviceGr.query();
		if (!serviceGr.next()) {
			gs.log("EvtMgmtConvertAndPopulateITService "+serviceName+" - no service found");
			return;
		}

		var service_id = serviceGr.getUniqueValue();
		if (!this.reclassifyService(service_id, manualClass, discoveredClass)){
			gs.log("EvtMgmtConvertAndPopulateITService "+serviceName+" - exiting - error: reclassify failed.");
			return;
		}

		var bsm = new SNC.BusinessServiceManager();
		var blackListRelations = gs.getProperty("sa.mapping.system.manual.rel_type.blacklist","");
		if (!bsm.populateDiscoveredService(service_id, depth, blackListRelations)) {
			gs.log('EvtMgmtConvertAndPopulateITService - error -Failed to populate service. '+ serviceName + bsm.error);

			//revert reclassification
			this.reclassifyService(service_id, discoveredClass, manualClass);
			return;
		}

		gs.log("EvtMgmtConvertAndPopulateITService completed successfully.");
	},

	reclassifyService : function (id, fromClass, toClass){
			// reclassify to it service
		gs.getSession().putProperty("convert_from", 'cmdb_ci_service');
		var gr = new GlideRecord(fromClass);
		gr.get(id);
		var rci = SncReclassifyCI.createFromGlideRecord(gr, toClass);
		rci.setReason("Upgrade - Convert to IT Service");
		rci.reclassify();
		gs.getSession().clearProperty("convert_from");
		return true;
	},

    type: 'EvtMgmtConvertAndPopulateITService'


};
