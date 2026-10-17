(function() {
    if (pm.isZboot())
        return;

	var gr = new GlideRecord("sys_choice");
	gr.addQuery("name", "sys_trigger");
	gr.addQuery("element", "trigger_type");
	gr.addQuery("value", 3);
	gr.addQuery("label", "Day in Week");
	gr.query();
	if (gr.next()) {
		gr.setValue("label", "Days in Week");
		gr.update();
	}
})();
