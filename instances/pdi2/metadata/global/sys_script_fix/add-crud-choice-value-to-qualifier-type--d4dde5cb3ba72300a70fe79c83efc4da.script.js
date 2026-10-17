gs.log("Fix Script: Adding new choice value CRUD to Qualifier Type field in cmdb_rel_attributes started");
checkAndAddField('cmdb_ci_qualifier_crud','CRUD');

function getMaxSequence(){
	gs.log("Fetching max sequence number of choices for cmdb_rel_attributes table on qualifier_type");
	var maxValue = 0;
	var max = new GlideAggregate('sys_choice');
	max.addQuery('name', 'cmdb_rel_attributes');
	max.addQuery('element', 'qualifier_type');
	max.addAggregate('MAX', 'sequence');
	max.setGroup(false);
	max.query();
	if (max.next()) {
		maxValue = max.getAggregate('MAX', 'sequence');
	}
	gs.log("Max sequence number for cmdb_rel_attributes table on qualifier_type is "+ maxValue);
	return parseInt(maxValue);
}

function checkAndAddField(choiceVal,label){
	gs.log("Checking and adding "+label+ " if it doesnt exists");
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', 'cmdb_rel_attributes');
	gr.addQuery('element', 'qualifier_type');
	gr.addQuery('value', choiceVal);
	gr.query();
	if(gr.getRowCount()==0){
		var choiceSequence = getMaxSequence()+1;
		gr.initialize();
		gr.name = 'cmdb_rel_attributes';
		gr.element = 'qualifier_type';
		gr.language = 'en';
		gr.label = label;
		gr.value = choiceVal;
		gr.sequence = choiceSequence ;
		gr.insert();
	}else{
		gs.log("No updation of Qualifier Field choices is required");
	}
}
gs.log("Fix Script: Adding new choice value to Qualifier Type field in cmdb_rel_attributes ended");
