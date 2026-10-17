function onLoad() {
    /* Hide context inputs related list if the parent context field is set. */
    var mapParentContextRefererence = g_form.getValue("map_parent_context");
    if (mapParentContextRefererence != "") {
        g_form.hideRelatedList("REL:b70d8cca53631210f917ddeeff7b1232");
    }

    /* Hide parent context field if the context inputs related list has one or more records. */
    var currContextId = g_form.getUniqueValue();
    var glideAjax = new GlideAjax('sn_nb_action.RecommendedActionsAjaxImpl');
    glideAjax.addParam('sysparm_name', 'checkIfContextInputsExist');
    glideAjax.addParam('sysparm_contextSysId', currContextId);
    glideAjax.addParam('sysparm_excludeContextTableInput', true);
    glideAjax.getXMLAnswer(function(response) {
        if (response === "true") {
	    g_form.setSectionDisplay('parent_contextconfig', false);
        }
    });

    /* Hide context inputs related list if the current rule context reference is being used on some other context records. We're restricting the author to use additional input functionality for hierarchical contexts. */
    var glideAjax2 = new GlideAjax('sn_nb_action.GetRAParentContextMethods');
    glideAjax2.addParam('sysparm_name', 'hasExtendedContextRecords');
    glideAjax2.addParam('sysparm_currContextId', currContextId);
    glideAjax2.getXMLAnswer(function(response) {
        if (response === "true") {
            g_form.hideRelatedList("REL:b70d8cca53631210f917ddeeff7b1232");
        }
    });

}
