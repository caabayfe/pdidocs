var CSDMCMDBUtilClient = Class.create();
CSDMCMDBUtilClient.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	isTSOSharingCI : function() {
		
		var json = new JSON();
		var results = {
			"value": false
		};
		
		
		var util = new CSDMCMDBUtil();
		var tsoSysId = util.sanitizeSysId(this.getParameter('sysparm_tso_sys_id'));
		
		if(!util.isTechnicalService(tsoSysId)) {
			results.value = false;
			return json.encode(results); 
		}
		
		// TSO not connected to any DCG
		var dcgs = util.getDynamicCIGroupsFromTSO(tsoSysId);

		if(JSUtil.nil(dcgs)) {
			results.value = false;
			return json.encode(results); 
		}
			
		
		// If multiple TSOs are connected to a DCG
		var gaRel = new GlideAggregate('cmdb_rel_ci'); 
		gaRel.addQuery('parent.sys_class_name', 'service_offering');
		gaRel.addQuery('child', 'IN', dcgs);
		gaRel.addQuery('parent', '!=', tsoSysId);
		gaRel.addAggregate('COUNT');
		gaRel.query();
		if(gaRel.next()) {
			if (gaRel.getAggregate('COUNT') > 0) {
				results.value = true;
				return json.encode(results);
			}
				
		}
		
		// check if a CI is shared between multiple DCG
		
		var ciSysIds = [];
		var map = util.getCIsFromDCG(dcgs);
		Object.keys(map).forEach(function(v){
			ciSysIds = ciSysIds.concat(map[v]);
		});
		
		var ga = new GlideAggregate('svc_ci_assoc');
		ga.addQuery('service_id.sys_class_name=cmdb_ci_query_based_service^service_id.service_classification=Technical Service');
		ga.groupBy('ci_id');
		ga.addHaving('COUNT', '>', '1');
		ga.addQuery('ci_id', 'IN', ciSysIds);
		ga.query();
		var sharedCIs = [];
		while(ga.next()) {
			sharedCIs.push(ga.getValue('ci_id'));
		}
		
		results.value = sharedCIs.length > 0;
		return json.encode(results);
	},
	
    type: 'CSDMCMDBUtilClient'
});
