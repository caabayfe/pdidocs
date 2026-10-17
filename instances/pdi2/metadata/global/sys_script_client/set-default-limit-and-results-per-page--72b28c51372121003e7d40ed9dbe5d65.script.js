function onLoad() {
    // Sets the default value for Limit and Records per page on new records
	
    if (!g_form.isNewRecord())
        return;
	
    var ga = new GlideAjax("cxs_RPAJAX");
    ga.addParam('sysparm_name', 'getDefaultLimit');
    ga.getXMLAnswer(function(answer) {
        g_form.setValue("limit", answer);
        g_form.setValue("results_per_page", answer);
    });
}
