var viewType;
var selectedSysId;

function confirmAndDeleteDocumentListEntry() {
    selectedSysId = typeof g_list != 'undefined' ? g_list.getChecked() : g_form.getUniqueValue();
    viewType = typeof g_list != 'undefined' ? 'list' : 'form';
	if(!selectedSysId || selectedSysId.length ==0)
		return;
    deleteListEntryRecords();
}

function deleteListEntryRecords() {
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('delete_document_list_entry');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    dlg.setWidth(300);
    dlg.setPreference('sysparm_list_view', viewType);
    if (viewType == 'list') {
        dlg.setPreference('sysparm_document_list_entry_sys_id_list', selectedSysId);
    } else
        dlg.setPreference('sysparm_document_list_entry_sys_id', selectedSysId);
    dlg.render();
}
