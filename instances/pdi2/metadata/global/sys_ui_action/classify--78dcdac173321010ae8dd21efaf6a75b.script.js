function classifyDictionaryRecord() {
    var selSysIds = g_list.getChecked();
    if (selSysIds === null || selSysIds === '')
        return;

    var dd = new GlideDialogWindow("sel_data_class_dialog");
    dd.setTitle(new GwtMessage().getMessage('Assign to data class'));
    dd.setPreference('sysparm_sys_source_id_list', selSysIds);
    dd.setWidth(400);
    dd.render();
}
