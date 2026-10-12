function previewDef() {
    var ajax = new GlideAjax('AJAXJellyRunner', 'AJAXJellyRunner.do');
    ajax.addParam('template', 'export_def_embedded_list');
    ajax.addParam('sysparm_table', g_form.getValue('table_name'));
    ajax.addParam('sysparm_query', g_form.getValue('filter'));
    ajax.addParam('sysparm_view', g_scratchpad.view);
    ajax.addParam('twoPhase', 'true');

    function listResponseCallback(response) {
        $j('#related_lists_wrapper').empty();
        $j('#related_lists_wrapper').append(response.responseText);
    }
    ajax.getXML(listResponseCallback);
}
