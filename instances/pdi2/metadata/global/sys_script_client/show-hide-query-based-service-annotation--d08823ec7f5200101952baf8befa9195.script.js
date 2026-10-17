function onLoad(control, oldValue, newValue, isLoading, isTemplate) {
    // If 'table' is empty, hide table annotation and show cmdb group annotation
    if (g_form.getValue('table') == '') {
        $('cmdb_group_annotation').up().show();
        $('table_annotation').up().hide();
    }
    // Otherwise, show table annotation and hide cmdb group annotation
    else {
        $('table_annotation').up().show();
        $('cmdb_group_annotation').up().hide();
    }
}
