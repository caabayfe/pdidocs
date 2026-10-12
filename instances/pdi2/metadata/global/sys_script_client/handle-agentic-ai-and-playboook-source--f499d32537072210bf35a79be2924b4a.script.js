function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.removeOption("source_type", "AGENTIC_AI_DATA");
		g_form.removeOption("source_type", "PLAYBOOK_DATA");
    } else if (g_form.getValue("source_type") == "AGENTIC_AI_DATA") {
		g_form.setSectionDisplay("advanced_condition", false);
    }
}
