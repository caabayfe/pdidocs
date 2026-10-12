function onLoad() {
    // Sets the default value for Limit on new records
	
    if (!g_form.isNewRecord())
        return;

    var ga = new GlideAjax("cxs_TableEmailConfigAJAX");
    ga.addParam('sysparm_name', 'getDefaultLimit');
    ga.getXMLAnswer(function(answer) {
        g_form.setValue("limit", answer);
    });
}
