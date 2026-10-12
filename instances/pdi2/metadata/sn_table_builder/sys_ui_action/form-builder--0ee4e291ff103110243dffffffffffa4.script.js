function formBuilderOnClick() {
    var tableName = g_form.getValue('name');
    var url = new GlideURL('now/build/form/main/params/table/' + tableName + '/view/Default view/page/views/context/platform');
    g_navigation.open(url.getURL(), 'edit_form_builder');
}
