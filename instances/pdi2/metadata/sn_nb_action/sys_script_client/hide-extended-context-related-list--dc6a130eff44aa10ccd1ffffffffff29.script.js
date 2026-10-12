function onLoad() {
    var currContextId = g_form.getUniqueValue();
    var ga = new GlideAjax('sn_nb_action.GetRAParentContextMethods');
    ga.addParam('sysparm_name', 'hasExtendedContextRecords');
    ga.addParam('sysparm_currContextId', currContextId);
    ga.getXMLAnswer(function(response) {
        if (response === "false") {
            g_form.hideRelatedList("REL:3a363c65ffbf1210ccd1ffffffffffb5");
        }
    });
}
