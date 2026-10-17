function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var type = g_form.getValue('type');

    if ((type == '14' || type == '17' ) && newValue != '')
        g_form.getReference('cat_item', checkItemClassName);
    else
        setFieldDisplay(false);

    function checkItemClassName(catItem) {
        if (catItem && (catItem.sys_class_name == 'sc_cat_item_composite_producer' || catItem.sys_class_name == 'sc_cat_item_producer'))
            setFieldDisplay(true);
        else
            setFieldDisplay(false);
    }

    function setFieldDisplay(value) {
        g_form.setDisplay('read_script', value);
        g_form.setDisplay('save_script', value);
        g_form.setDisplay('post_insert_script', value);
    }
}
