function onLoad() {
    
    if (
        g_form.getValue('sub_type') == 11 ||
        (g_form.getValue('sub_type') == 0 && g_form.getValue('container_type') == 'checkbox_container')
    ) {
        g_form.setLabelOf('question_text', 'Name');
    }
}
