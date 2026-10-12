function onLoad() {
    var ajaxHandler = new GlideAjax('GetManualReindexMessageSNC');
    var currentTopic = g_form.getUniqueValue();
    ajaxHandler.addParam('sysparm_name', 'collectTablesForManualReIndex');
    ajaxHandler.addParam('sysparam_topic', currentTopic);
    ajaxHandler.getXMLAnswer(messageParse);
}

function messageParse(response) {
    response = JSON.parse(response);
    if (response && response.message) {
        g_form.addInfoMessage(response.message);
    }
}
