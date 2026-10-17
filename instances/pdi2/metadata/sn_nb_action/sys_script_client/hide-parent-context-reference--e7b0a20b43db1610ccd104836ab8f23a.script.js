function onChange() {
    var currContextTable = g_form.getValue('context');
    if (!currContextTable) {
	g_form.setSectionDisplay('parent_contextconfig', false);
        return;
    }
    var ga = new GlideAjax('sn_nb_action.GetRAParentContextMethods');
    ga.addParam('sysparm_name', 'hasParentContextRecords');
    ga.addParam('sysparm_currContextTable', currContextTable);
    ga.getXMLAnswer(function(response) {
        if (response === "true") {
	    g_form.setSectionDisplay('parent_contextconfig', true);
        } else {
            g_form.clearValue('map_parent_context');
	    g_form.setSectionDisplay('parent_contextconfig', false);
            g_form.hideRelatedList("REL:b8b420c3436b9a10ccd104836ab8f2ac"); //Hide inherited rules related list if Parent context is hidden
        }
    });
}
