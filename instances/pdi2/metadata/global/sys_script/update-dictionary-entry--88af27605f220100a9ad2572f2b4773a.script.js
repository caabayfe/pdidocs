updateDictionary("reference_qual");
updateDictionary("default_value");

function updateDictionary(field, referenceField) {
	var d = new GlideRecord("sys_dictionary");
	if (field === "default_value") {
		d.addQuery("dynamic_default_value", previous.sys_id);
		d.addQuery("use_dynamic_default", true);
    }

    if (field === "reference_qual") {
        d.addQuery("dynamic_ref_qual", previous.sys_id);
        d.addQuery("use_reference_qualifier", "dynamic");
    }

	d.query();

	while (d.next()) {
		var scr = d.getValue(field);

		if (scr.trim().indexOf("javascript:") != 0)
			continue;

		scr = scr.substring("javascript:".length);
		if (scr == "")
			continue;

		d.setValue(field, "javascript:" + current.script);
		d.setWorkflow(false);
		d.autoSysFields(false);
		if (d.update()) {
			var um = new GlideUpdateManager2();
			um.saveRecord(d);
		}
		gs.addInfoMessage(gs.getMessage("Changed field {0} of table/column {1}.{2} to {3}",[field,d.name,d.element,current.script]));
	}
}
