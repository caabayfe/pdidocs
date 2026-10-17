gs.info("Fix Script setParentReferenceOfCapability: running script");
var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name','cmdb_ci_business_capability');
gr.addQuery('element','parent');
gr.query();
if (gr.next()){
	gs.info("Fix Script setParentReferenceOfCapability: column parent");
	var columnRef = gr.getValue('reference');
	if (columnRef=='cmdb_ci'){
		gs.info("Fix Script setParentReferenceOfCapability: column parent has cmdb_ci reference");
		gr.setValue('reference','cmdb_ci_business_capability');
		gr.update();
		gs.info("Fix Script setParentReferenceOfCapability: changed column parent reference to cmdb_ci_business_capability");
	}
}
gs.info("Fix Script setParentReferenceOfCapability: completed script");
