gs.log("Fix Script: Make software model non mandatory start");
makeFieldNonMandatory('cmdb_software_product_model');

function makeFieldNonMandatory(field_name){
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cmdb_ci_business_app');
	gr.addQuery('element', field_name);
	
	gr.query();
	if(gr.next()){
		gr.setValue('mandatory',false);
		gr.update();
		gs.log("Fix Script: Updating Mandatory attribute done");
	}
}
gs.log("Fix Script: Make software model non mandatory end");
