function onLoad() {
    if (g_form.getValue("update_frequency") == 'do_not_update') {
		var gr = new GlideRecord("ml_advanced_solution_settings");
        gr.addQuery("ml_capability_definition", g_form.getUniqueValue());
        gr.addQuery("solution_parameters", "f4c4ca8053c04010d1dcddeeff7b1236");
        gr.query();
        if (gr.hasNext()) {
             g_form.setReadOnly('update_frequency', true);
        }   
    }
}
