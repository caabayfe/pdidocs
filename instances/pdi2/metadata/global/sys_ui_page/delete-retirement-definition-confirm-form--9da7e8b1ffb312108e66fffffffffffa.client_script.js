function ok() {
    deleteRetirementDefinition();
	
    return true;
}

function deleteRetirementDefinition() {
    var retirementDefinitionAjaxHelper = new GlideAjax('CMDBCustomRetirmentDefinitionUtil');
    retirementDefinitionAjaxHelper.addParam('sysparm_name', 'deleteRetirementDefinition');
    retirementDefinitionAjaxHelper.addParam('definition_sys_id', '${JS,URL:sysparm_definition_id}');
    retirementDefinitionAjaxHelper.setWantSessionMessages(false);
    retirementDefinitionAjaxHelper.getXMLAnswer(function(response) {
        if (response === 'true') {
            window.location = '${JS,URL:sysparm_table}_list.do';
        } else {
            GlideDialogWindow.get().destroy();
            g_form.addErrorMessage(getMessage("Failed to delete Retirement Definition."));
        }
    });
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
