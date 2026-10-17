(function executeRule(current, previous /*null when async*/) {

	if (current.operation() == "insert") {
		var grInsert = new GlideRecord("sa_metric_registration");
		grInsert.setValue("source", current.name);
		grInsert.setValue("registration_mode", "0");
		grInsert.setValue("type_default_mode", "0");
		grInsert.setValue("generate_ci", false);
		grInsert.insert();
		
	} else if (previous.name != current.name) { //update operation and the name field has been changed

		var grUpdate = new GlideRecord("sa_metric_registration");
		grUpdate.addQuery("source", previous.name);
		grUpdate.query();
		if (grUpdate.next()) {
			grUpdate.setValue("source", current.name);
			grUpdate.update();
		}
	}

})(current, previous);
