if(!isServiceRecordsAlreadyExists()){
	addServiceRecords();	
}

function addServiceRecords(){
	var currentService = "";
	var start = new Date().getTime();

	var gr = new GlideRecord("em_impact_graph");
	gr.addQuery("status", "!=", "deleted");
	gr.orderBy("business_service");
	gr.orderByDesc("sys_updated_on");
	gr.query();

	while(gr.next()){
		//if record belongs to the same service - continue 
		if(currentService == gr.business_service){
			continue; 
		}
		currentService = "" + gr.business_service;
        addServiceRecord(gr.getValue("business_service"), gr.getValue("status"), gr.getValue("bucket"));		
	}

	var end = new Date().getTime();
	var duration = end - start;
	gs.info("EM Upgrade em_impact_graph took " + duration + " ms.");	
}

function addServiceRecord(business_service, status, bucket){
	var gr = new GlideRecord("em_impact_graph");
	gr.addQuery("business_service", business_service);
	gr.addQuery("is_service", "1");
	gr.query();
	if(gr.hasNext()){
		return;
	}
	
	var insertGr = new GlideRecord("em_impact_graph");
	insertGr.setValue("business_service", business_service);
	insertGr.setValue("status", status);
	insertGr.setValue("child_id", business_service);
	insertGr.setValue("bucket", bucket);
	insertGr.setValue("is_service", 1);
	insertGr.insert();
}

function isServiceRecordsAlreadyExists(){
	var gr = new GlideRecord("em_impact_graph");
	gr.addQuery("is_service", "=", "1");
	gr.query();
    return gr.hasNext();
}
