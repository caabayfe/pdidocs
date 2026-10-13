//cleanup
cleanupPrevValue();

var gr = new GlideRecord("sa_hash");
gs.info("EM upgrade. Disable impact calculation while plugin activation.");
gr.addQuery("name", "impact_calculation_enable");
gr.query();
if(gr.next()){
    var currentValue = gr.getValue("hash");
	//in case the impact calculation job has been disabled - we have to add new record with key 'impact_calculation_enable_prev_value'
	// for fix script which will attemp to enable the job after upgrade.
	if("true" == currentValue){
		gr.hash = 'false';
		gr.update();
	} else {
		insertImpactCalculationPrevValue();
	}
} 

function cleanupPrevValue(){
	var gr = new GlideRecord("sa_hash");
	gr.addQuery('name', 'impact_calculation_enable_prev_value');
	gr.query();
	if(gr.next()){
		gr.deleteRecord();
	}
}

function insertImpactCalculationPrevValue() {
	gs.info("EM upgrade. The impact calculation job has been disabled before. Skip.");
	var gr = new GlideRecord("sa_hash");
	gr.addQuery('name', 'impact_calculation_enable_prev_value');
	gr.query();
	if(gr.next()){
		gr.hash = 'false';
		gr.update();
	}else{
		var insertGR = new GlideRecord("sa_hash");
		insertGR.name = 'impact_calculation_enable_prev_value'; 
		insertGR.hash = 'false'; 
		insertGR.insert();					
	}
}
