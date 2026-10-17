function onLoad() {
    //Type appropriate comment here, and begin script below
    var interactionSysId = g_form.getUniqueValue();
    var ga = new GlideAjax('UIInteractionAjax');
    ga.addParam('sysparm_name', 'isInteractionTypeReadOnly');
    ga.addParam('sysparm_interaction_sys_id', interactionSysId);
    ga.getXML(parseResponse);
}

function parseResponse(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer === "true") {
        g_form.setReadOnly('type', true);
        g_form.showFieldMsg(
            'type',
            getMessage("This field is read-only because the UI interaction contains step definitions dependent on the current Type."),
            'info'
        );
    }
}
