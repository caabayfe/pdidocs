function ok() {
    var ajaxHelper = new GlideAjax('DeactivateRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeactivateFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
    ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
    ajaxHelper.addParam('sysparm_date', '${JS:sysparm_date}');
    ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXML(deactivateCompleted.bind('${JS:sysparm_parent_form}'));
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
