//This script changes the reference from cmdb_ci to service_offering in the service_offering_commitment table
// Previously, a sys_dictionary update record was used.  However, this is a bad practice.  The dictionary
// schema was updated, but older instances need a fix script to change it instead of the sys_dictionary update

if (canFixServiceOfferingReference("service_availability"))
	fixServiceOfferingReference("service_availability");
if (canFixServiceOfferingReference("service_offering_commitment"))
	fixServiceOfferingReference("service_offering_commitment");

function canFixServiceOfferingReference(originTable) {
	var gr = new GlideRecord("sys_dictionary"); 
	gr.addQuery("name", originTable);
	gr.addQuery("element", "service_offering");
	gr.addQuery("reference", "service_offering");
	gr.query();
	
	// Check to see if reference is already set to service_offering
	if (gr.hasNext()) {
		gs.print(originTable + " table already has service_offering reference set to service_offering - NOT cmdb_ci");
		return false;
	}
	
	// Check to see if any of the references are not of type service_offering
	gr = new GlideRecord(originTable);
	gr.query();
	while(gr.next()){
		if(gr.service_offering.sys_class_name != "service_offering"){
			gs.print(originTable + " table has non-service_offering references set in this field - CANNOT CHANGE REFERENCE");
			return false;
		}
	}
	
	// Able to change reference
	return true;
}

function fixServiceOfferingReference(originTable){
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", originTable);
	gr.addQuery("element", "service_offering");
	gr.query();
	if(gr.next()){
		gr.reference = "service_offering";
		gr.update();
		gs.print("Changed " + originTable + ".service_offering reference to service_offering from cmdb_ci");
	}
}
