checkDefaultValue();

function checkDefaultValue() {
	if (current.default_value.trim().indexOf("javascript:") != 0)
		return;
	
	var scr = current.default_value.trim();
	scr = scr.substring("javascript:".length);
	if (scr == "")
		return;

	if (scr.endsWith(";"))
		scr = scr.substring(0, scr.length - 1);
	
	var dyn = new GlideRecord("sys_filter_option_dynamic");
	dyn.addQuery("script", scr).addOrCondition("script", scr + ";");

	//Add the below condition to the query if we want to filter by sys_id=current.dynamic_default_value
	//dyn.addQuery("sys_id", current.dynamic_default_value);
	dyn.query();

	// Don't update the current.dynamic_default_value if it meets any of the below conditions
	// if the result set is empty don't update return back.	
	// if the result set contains more than one record that match the script return
	if (dyn.getRowCount() != 1)
		return;

	dyn.next();
	
	if (current.dynamic_default_value == dyn.sys_id && current.use_dynamic_default == true)
		return;
	
	current.dynamic_default_value = dyn.sys_id;
	current.use_dynamic_default = true;
	current.setWorkflow(false);
	current.autoSysFields(false);
	current.update();
}
