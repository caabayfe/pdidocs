function markProjectForDeletion() {
    var map = getMessages(["Are you sure?", "Deleting the project/template is permanent and cannot be undone"]);
    var dialog = new GlideModal('glide_confirm_basic');
    dialog.setTitle(map["Are you sure?"]);
    dialog.setPreference('title', map["Deleting the project/template is permanent and cannot be undone"] + "<br/><br/>");
    dialog.setPreference('onPromptComplete', onPromptCompleteForProjectDeletion);
    dialog.render();
}

function onPromptCompleteForProjectDeletion() {
    gsftSubmit(null, g_form.getFormElement(), 'delete_project');
}
if (typeof window == 'undefined') {
    executeProjectDeletion();
}

function executeProjectDeletion() {
    current.deleted = true;
    current.update();
    var url = "/promin_project_list.do?sysparm_query=is_template%3Dfalse%5EsourceINMANUAL%2CDEFAULT%5Edeleted%3Dfalse%5EORdeletedISEMPTY&sysparm_view=";
    action.setRedirectURL(url);
}
