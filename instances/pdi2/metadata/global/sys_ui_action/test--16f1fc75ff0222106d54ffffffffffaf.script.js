function openTestModal() {
    var modal = new GlideModal("modal_test_core_data_pattern", false, "modal-md");
    modal.setTitle(new GwtMessage().getMessage("Test data pattern"));
    modal.setPreference("sysparm_default_expression", g_form.getValue("expression"));
    modal.setPreference("sysparm_keyword", g_form.getValue("keyword"));
    modal.setPreference("sysparm_keyword_proximity", g_form.getValue("keyword_proximity"));
    modal.setPreference("sysparm_type", g_form.getValue("type"));
	modal.setPreference("sysparm_pattern_id", g_form.getUniqueValue());
    modal.setPreference('focusTrap', true);
    modal.render();
}
