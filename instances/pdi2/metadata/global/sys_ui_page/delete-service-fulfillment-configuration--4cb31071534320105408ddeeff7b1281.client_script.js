function ok() {
    var ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
    ajaxHelper.getXMLAnswer(closeModalAndNavigateBack);
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}

function closeModalAndNavigateBack() {
    GlideDialogWindow.get().destroy();
    var url = new GlideURL('sc_service_fulfillment_step_configuration_list.do');
    window.location = url.getURL();
}
