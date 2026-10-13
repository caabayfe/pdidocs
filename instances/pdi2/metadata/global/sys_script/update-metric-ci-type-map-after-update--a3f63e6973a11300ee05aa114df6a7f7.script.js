(function executeRule(current, previous /*null when async*/) {

	//This is a post update business rule. We will query sa_metric_ci_type_map, and if no entry exists, create one
	
	//Get ci class
	var ciClass = current.cmdb_ci.sys_class_name;
	var metricType = current.metric_type_id;
	
	//Check for map entry
	var mapGr = new GlideRecord("sa_metric_ci_type_map");
	mapGr.addQuery("cmdb_ci_type", ciClass);
	mapGr.addQuery("metric_type_id", metricType);
	mapGr.query();
	
	//If there is none, creare one
	if (!mapGr.hasNext()) {
		//Create  record
		mapGr.setValue("cmdb_ci_type", ciClass);
		mapGr.setValue("metric_type_id", metricType);
		mapGr.insert();
	}

})(current, previous);
