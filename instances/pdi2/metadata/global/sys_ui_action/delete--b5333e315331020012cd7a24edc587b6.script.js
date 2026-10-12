var ajaxHelper;
var objSysId;
var tblName;

function confirmAndDeleteFromTemplate() {
    objSysId = g_form.getUniqueValue();
    tblName = g_form.getTableName();

    ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'getCascadeDeleteTables');
    ajaxHelper.addParam('sysparm_obj_id', objSysId);
    ajaxHelper.addParam('sysparm_table_name', tblName);
    ajaxHelper.setWantSessionMessages(false);

    ajaxHelper.getXMLAnswer(getCascadeDelTablesDoneForm.bind(this), null, null);
}

function getCascadeDelTablesDoneForm(answer, s) {
	var url = new GlideURL()
	url.setFromString(window.location.href);

    var ansrArray = answer.split(';');
    returnUrl = ansrArray[0];
    var objList = ansrArray[2];
	var dialogClass = window.GlideModal ? window.GlideModal : window.GlideDialogWindow;
    window.dlg = new dialogClass('delete_confirm_form_template');
    window.dlg.setTitle(new GwtMessage().getMessage('Confirmation'));
    if(objList == null) {
		window.dlg.setWidth(275);
    } else {
       window.dlg.setWidth(450);
    }
    window.dlg.setPreference('sysparm_obj_id', objSysId);
    window.dlg.setPreference('sysparm_table_name', tblName);
    window.dlg.setPreference('sysparm_parent_form', this);
	window.dlg.setPreference('sysparm_record_list', decodeURIComponent(url.getParam('sysparm_record_list')));
    window.dlg.render();

}
