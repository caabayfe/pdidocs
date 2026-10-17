function onLoad() {
    if (g_form.getValue("type") != "BOOST")
        return;

    // Hide Field Selections
    g_form.setDisplay("boost_context_field", false);
    g_form.setDisplay("boost_field_name", false);
    g_form.setDisplay("boost_value", false);
    g_form.setDisplay("synonym_dictionaries", false);
    g_form.setDisplay("user_dotwalked_field", false);
    g_form.setMandatory("boost_value", false);
    g_form.setMandatory("boost_context_field", false);

    // Set Source to Required
    g_form.setMandatory("boost_indexed_source");

    if (g_form.getValue("state") != "NEW") {
        var boost_type = g_form.getValue("boost_type");
        if (boost_type == "user_context") {
            g_form.setDisplay("boost_context_field", true);
            g_form.setDisplay("boost_field_name", true);
            g_form.setMandatory("boost_context_field", true);
            if ("dot_walked_field" == g_form.getValue("boost_context_field")) {
                g_form.setDisplay("user_dotwalked_field", true);
                g_form.setMandatory("user_dotwalked_field", true);
            }
        } else if (boost_type == "field_boost") {
            g_form.setDisplay("boost_field_name", true);
            g_form.setDisplay("boost_value", true);
            g_form.setMandatory("boost_value", true);
        } else if (boost_type == "synonym_boost") {
            g_form.setDisplay("boost_field_name", true);
            g_form.setDisplay("synonym_dictionaries", true);
            g_form.setMandatory("synonym_dictionaries", true);
        }
    }
}
