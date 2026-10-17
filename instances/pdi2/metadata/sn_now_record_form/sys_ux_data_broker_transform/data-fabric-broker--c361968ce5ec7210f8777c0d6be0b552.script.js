function transform(input) {
	
	var enabled = gs.getProperty("glide.form.data_fabric_messaging.enabled", true) !== "false";
	if (!enabled) return false;

	var gr = new GlideRecord(input.table);
	return gr.isDataFabricOperation() === true;
	
}
