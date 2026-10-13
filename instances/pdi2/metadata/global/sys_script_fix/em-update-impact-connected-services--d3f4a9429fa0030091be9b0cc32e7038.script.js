(function(){
	var bsList =[];
	var bsListWithSeverity = [];
	var inQuerySize = 100;
	var numberOfTriggeredServices = 0;
	var im = new SNC.ImpactManager();
	
	var gr = new GlideRecord('em_connected_bs_graph');
	gr.query();
	if(gr.next()){
		gs.log("Existing 'EM - Update impact connected services' fix script. Should not run more than once.");
		return;
	}
	var startDateTime = new GlideDateTime(gs.nowNoTZ());
    gs.log("EM - Update impact connected services Start Time: " + startDateTime);
	findAllBSs();
	triggerManualServices();
	triggerDiscoveredServices();	
	gs.log("Number of services triggered by 'EM - Update impact connected services' - " + numberOfTriggeredServices);
	var endDateTime = new GlideDateTime(gs.nowNoTZ());
    gs.log("EM - Update impact connected services End Time: " + endDateTime);

	function findAllBSs(){
		var businessServiceGr = new GlideRecord('cmdb_ci_service_auto');
		businessServiceGr.query();
		while(businessServiceGr.next()){
			bsList.push(businessServiceGr.getValue('sys_id'));
			var severity = businessServiceGr.getValue('severity');
			if(severity != null && severity != 5 && severity != 0){
				bsListWithSeverity.push(businessServiceGr.getValue('sys_id'));
			}
		}
	}

	function triggerManualServices(){
		var impactGraphGr;
		for(var i = 0 ; i <= bsListWithSeverity.length ; i+=inQuerySize){
			impactGraphGr = new GlideAggregate('em_impact_graph');
			var subBsList = bsListWithSeverity.slice(i, i+inQuerySize);
			gs.log('triggerManualServices subBsList= '+subBsList);
			impactGraphGr.addQuery('child_id','IN',subBsList);
			impactGraphGr.groupBy('business_service');
			impactGraphGr.query();
			while(impactGraphGr.next()){
				im.triggerImpact(impactGraphGr.getValue('business_service'));
				numberOfTriggeredServices++;
				gs.log('TRIGGET IMPACT FOR impactGraphGr - ' +impactGraphGr.getValue('business_service'));
			}
		}
	}

	function triggerDiscoveredServices(){
		var connectedServiceGr;
			for(var i = 0 ; i <= bsList.length ; i+=inQuerySize){
				connectedServiceGr = new GlideAggregate('em_connected_services');
				var subBsList = bsList.slice(i, i+inQuerySize);
				gs.log('triggerDiscoveredServices subBsList= '+subBsList);
				connectedServiceGr.addQuery('connected_service_id','IN',subBsList);
				connectedServiceGr.groupBy('service_id');
				connectedServiceGr.query();
				while(connectedServiceGr.next()){
					im.triggerImpact(connectedServiceGr.getValue('service_id'));
					numberOfTriggeredServices++;
					gs.log('TRIGGET IMPACT FOR connectedServiceGr - ' + connectedServiceGr.getValue('service_id') );
				}
			}
	}
})();
