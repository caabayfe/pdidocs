function clearClassification() {
    var dictSysIds = g_list.getChecked();
    if (dictSysIds === null || dictSysIds === '')
        return;

    var dd = new GlideDialogWindow("clear_classification_confirm_list");
    dd.setTitle(new GwtMessage().getMessage('Clear classification'));
    dd.setPreference('sysparm_sys_source_id_list', dictSysIds);
    dd.render();
}
