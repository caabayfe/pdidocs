function onClick() {
    var glideAjax = new GlideAjax('sn_nb_action.RecommendedActionsAjax');
    glideAjax.addParam('sysparm_name', 'createSearchResultMapping');
    glideAjax.addParam('sysparm_contextSysId', g_form.getUniqueValue());
    glideAjax.getXMLAnswer(function(answer) {
        if (answer === "false") {
            g_form.addInfoMessage(getMessage("No updates found. The mappings are already in sync with Search application configuration."));
        } else {
            location.reload(true);
        }
    });
}
