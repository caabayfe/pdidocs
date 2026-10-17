function ok() {
    var checkbox = document.getElementById("agree_checkbox");
    if (checkbox && !checkbox.checked) {
        return;
    }

    return deleteTopics();
}

function deleteCurrentRecord() {
    var ajaxHelper = new GlideAjax('DeleteRecordAjax');
    ajaxHelper.addParam('sysparm_name', 'proceedWithDeleteFromForm');
    ajaxHelper.addParam('sysparm_obj_id', '${JS:sysparm_obj_id}');
    ajaxHelper.addParam('sysparm_table_name', '${JS:sysparm_table_name}');
    ajaxHelper.addParam('sysparm_disable_wf', '${JS:sysparm_disable_wf}');
    ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXMLAnswer(deleteCompleted.bind('${JS:sysparm_parent_form}'));
    return true;
}

function deleteTopics() {
    var tableName = '${JS:sysparm_table_name}';

    var ajax = new GlideAjax('TopicList');
    ajax.addParam('sysparm_name', 'deleteTopics');
    ajax.addParam('sysparm_' + tableName + '_sysid', '${JS:sysparm_obj_id}');
    ajax.getXMLAnswer(function(answer) {
        if (answer === 'true') {
            return deleteCurrentRecord();
        } else {
            var errorMsg = getMessage('An unexpected error occurred while trying to delete the {0}. No changes were made, please try again later.');
            errorMsg = errorMsg.withValues([tableName]);
            g_form.addErrorMessage(errorMsg);
            return cancel();
        }
    });
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
