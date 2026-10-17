/**
 Service-now.com
 
 Description: Remove the associated pending application record if the process is marked as deleted
**/

runIT();

function runIT() {
	var gr = new GlideRecord("cmdb_ci_appl_pending");
	if (!gr.isValid())
		return;
	
	gr.addQuery("running_process", current.sys_id);
	gr.query();
	gr.deleteMultiple();
}
