function onClick(g_form) {
    var msg = getMessage("Deleting the project/template is permanent cannot be undone");
    g_modal.confirm(getMessage("Are you sure?"), msg, function(confirmed) {
        if (confirmed) {
            var ga = new GlideAjax('global.ProminUtilsAJAX');
            ga.addParam('sysparm_name', 'markForDeletion');
            ga.addParam('sysparm_obj_list', [g_form.getUniqueValue()]);
            ga.getXML(executeProjectDeletion);
        }
    });

    function executeProjectDeletion() {
        g_form.addInfoMessage("Project/Template is marked for deletion");
        g_aw.closeRecord();
        var url = "/now/experience/promin/process-models";
        top.window.open(url);
    }
}
