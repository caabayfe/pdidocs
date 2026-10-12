function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    g_form.setMandatory("synonym_dictionaries", false);
    g_form.setMandatory("boost_value", false);
    g_form.setMandatory("boost_context_field", false);
    g_form.setDisplay("boost_context_field", false);
    g_form.setDisplay("boost_field_name", false);
    g_form.setDisplay("boost_value", false);
    g_form.setDisplay("synonym_dictionaries", false);

    if (newValue == "user_context") {
        g_form.setDisplay("boost_field_name", true);
        g_form.setDisplay("boost_context_field", true);
        g_form.setMandatory("boost_context_field", true);
    } else if (newValue == "field_boost") {
        g_form.setDisplay("boost_field_name", true);
        g_form.setDisplay("boost_value", true);
        g_form.setMandatory("boost_value", true);
    } else if (newValue == "synonym_boost") {
        g_form.setDisplay("boost_field_name", true);
        g_form.setDisplay("synonym_dictionaries", true);
        g_form.setMandatory("synonym_dictionaries", true);
    }

}
