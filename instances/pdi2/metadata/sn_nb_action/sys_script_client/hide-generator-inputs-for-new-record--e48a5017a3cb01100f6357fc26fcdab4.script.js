function onLoad() {

    if (g_form.isNewRecord()) {
        g_form.setSectionDisplay('generator_input', false);
    }

    g_form.setDisplay('generator_type.model_table', false);
}
