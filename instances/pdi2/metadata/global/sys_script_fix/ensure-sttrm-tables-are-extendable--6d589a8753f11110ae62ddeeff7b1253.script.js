(function() {
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("sys_db_object");
	gr.addQuery("name", ["sttrm_condition_type", "sttrm_model", "sttrm_state", "sttrm_state_transition", "sttrm_transition_condition"]);
	gr.setValue("is_extendable", true);
	gr.updateMultiple();
})();
