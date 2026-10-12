var uri;
var tableName;
var tableSysId;
var selectedSysId;
var tblName;

function confirmAndRemoveDocuments() {
    selectedSysId = g_list.getChecked();
    tableSysId = g_list.getSubmitValue('sysparm_collectionID'); // sys_id of parent
    tableName = g_list.getSubmitValue('sysparm_collection');
	
    var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
    var dlg = new dialogClass('remove_document_link');
    dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    dlg.setWidth(300);
    dlg.setPreference('sysparm_table_name', tableName);
    dlg.setPreference('sysparm_table_sys_id', tableSysId);
    dlg.setPreference('sysparm_document_sys_id_list', selectedSysId);
    dlg.render();
}
