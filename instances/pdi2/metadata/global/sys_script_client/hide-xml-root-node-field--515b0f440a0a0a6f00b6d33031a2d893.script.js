function onChange(control, oldValue, newValue) {
    if (newValue == 'XML') {
        g_form.setDisplay('xml_root_node', true);
    } else {
        g_form.setDisplay('xml_root_node', false);
    }
}
