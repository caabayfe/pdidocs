(function executeRule(current, previous /*null when async*/) {

	// for manual business service only: insure that CI added only once to the same service
	if (current.service_id.sys_class_name == 'cmdb_ci_service_manual' &&
		(current.ci_id.changes() || current.service_id.changes())) {
		var count = new GlideAggregate('svc_ci_assoc');  
		count.addAggregate('COUNT');  
		count.addQuery('ci_id', '=', current.ci_id);  
		count.addQuery('service_id', '=', current.service_id);  
		count.query();  
		var match = 0;  

		if (count.next())  
		   match = count.getAggregate('COUNT');  

		if(match != 0) {  
		   gs.addInfoMessage(gs.getMessage('The service {0} already contains this CI {1}', [current.service_id.name, current.ci_id.name])); 
		   current.setAbortAction(true);  
		}
	}	

})(current, previous);
