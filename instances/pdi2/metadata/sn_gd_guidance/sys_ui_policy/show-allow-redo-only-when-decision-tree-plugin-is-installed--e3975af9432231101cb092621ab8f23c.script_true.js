function onCondition() {
    g_form.setVisible('allow_redo', false); // setting the field to false, as the below call is ajax
    var ga = new GlideAjax('GuidedDecisionGuidanceHelper');
    ga.addParam('sysparm_name', 'pluginInfo');
    ga.getXMLAnswer(parsePluginInfo);
}

function parsePluginInfo(response) {
    if (response == 'true')
        g_form.setVisible('allow_redo', true);
}
