var tableName;
var sys_id;
var parent_form;

function ok() {
    var ajaxHelper = new GlideAjax('DeleteInactiveVersionsAjax');
	ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
	tableName = '${JS:sysparm_table_name}';
	ajaxHelper.addParam('sysparm_table_name', tableName);
	sys_id = '${JS:sysparm_obj_id}';
    ajaxHelper.addParam('sysparm_obj_id', sys_id);
	parent_form = '${JS:sysparm_parent_form}';
    ajaxHelper.getXMLAnswer(deleteInactiveVersionsCompleted.bind(parent_form));
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
