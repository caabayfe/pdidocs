function copyInputJson() {
    var glideAjax = new GlideAjax('sn_nb_action.RecommendedActionsAjax');
    glideAjax.addParam('sysparm_name', 'generateJsonFromContextInputs');
    glideAjax.addParam('sysparm_contextSysId', g_form.getUniqueValue());
    glideAjax.getXMLAnswer(function(response) {
        copyToClipboard(response);
    });

}
