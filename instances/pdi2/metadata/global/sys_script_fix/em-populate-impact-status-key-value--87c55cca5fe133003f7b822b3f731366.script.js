gs.info("EM - populate impact_status_key started.");

var sw = new GlideStopWatch();
var bulkSize = GlideProperties.getInt("evt_mgmt.batchInsertSingleField.bulk_size", 500);

var DELIMITER = '#';
var counter = 0;
var total = 0;
var batchUtil = new SNC.BatchCommandsUtil();
var gr = GlideRecord('em_impact_status');
gr.addNullQuery('impact_status_key');
gr.query();
var jsonArr = [];
while(gr.next()){
    var impactKey = DELIMITER;
	var jsonObj = {};
	jsonObj.sys_id = '' + gr.sys_id;
	if(JSUtil.notNil(gr.business_service)){
		impactKey += gr.business_service;
	}
	impactKey +=DELIMITER;

	if(JSUtil.notNil(gr.element_id)){
		impactKey += gr.element_id;
	}
	impactKey +=DELIMITER;
	
	if(JSUtil.notNil(gr.ns_path)){
		impactKey += gr.ns_path;
	}
	impactKey +=DELIMITER;
	
    jsonObj.impact_status_key = impactKey; 
    jsonArr.push(jsonObj);
	counter++;
	total++;
	if(counter >= bulkSize){
		batchUtil.batchUpdateMultiple(JSON.stringify(jsonArr), 'em_impact_status', '');
		counter = 0;
		jsonArr = [];		
	}
}

if(counter > 0){
	//insert rest of records in batch
	batchUtil.batchUpdateMultiple(JSON.stringify(jsonArr), 'em_impact_status', '');
}	
gs.info("EM - populate impact_status_key finished. Updated " + total + " records take " + sw.getTime() + " ms.");
