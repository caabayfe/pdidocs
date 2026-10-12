gs.log("Fix Script: Adding Architecture fields in BA started");
checkAndAddFields('platform_host','Platform Host',getMaxSequence()+1);
checkAndAddFields('platform_application','Platform Application',getMaxSequence()+1);

function getMaxSequence(){
	gs.log("Fetching max sequence number for cmdb_ci_business_app table on architecture_type");
	var maxValue = 0;
	var max = new GlideAggregate('sys_choice');
	max.addQuery('name', 'cmdb_ci_business_app');
	max.addQuery('element', 'architecture_type');
	max.addAggregate('MAX', 'sequence');
	max.setGroup(false);
	max.query();
	if (max.next()) {
		maxValue = max.getAggregate('MAX', 'sequence');
	}
	gs.log("Max sequence number for cmdb_ci_business_app table on architecture_type is "+ maxValue);
	return parseInt(maxValue);
}

function checkAndAddFields(architectureField,label,sequence){
	gs.log("Checking and adding "+label+ " if it doesnt exists");
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', 'cmdb_ci_business_app');
	gr.addQuery('element', 'architecture_type');
	gr.addQuery('value', architectureField);
	
	gr.query();
	if(gr.getRowCount()==0){
		gr.initialize();
		gr.name = 'cmdb_ci_business_app';
		gr.element = 'architecture_type';
		gr.language = 'en';
		gr.label = label;
		gr.value = architectureField;
		gr.sequence =  sequence;
		gr.insert();
	}else{
		gs.log("No updation of Architecture Field choices is required");
	}
}
gs.log("Fix Script: Adding Architecture fields in BA ended");
