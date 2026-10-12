function redirectToFormBuilder(answer) {
    if (answer != null) {
        var tableName = g_form.getValue('name');
        var url = new GlideURL('now/build/form/main/params/table/' + tableName + '/view/Default view/page/views/context/platform');
        g_navigation.open(url.getURL(), 'edit_form_builder');
    }
}
function formBuilderOnClick() {
    var ajaxHelper = new GlideAjax('TableEditorAjaxProcessor');
    var tableName = g_form.getValue('name');
    ajaxHelper.addParam('sysparm_type', 'loadDefaultFormSection');
    ajaxHelper.addParam('sysparm_tableName', tableName);
    ajaxHelper.getXMLAnswer(this.redirectToFormBuilder.bind(this));
}
