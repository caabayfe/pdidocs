function onLoad() {
    if ("1" == g_scratchpad.do_test_export_target_connection)
		testConnection();
}

function testConnection() {
    g_form.clearMessages();
    g_form.addInfoMessage(new GwtMessage().getMessage('Testing connection ...'));

    var esajax = new GlideAjax('ExportTargetHelper');
    esajax.addParam('sysparm_name', 'testConnection');
    esajax.addParam('sysparm_export_target_id', g_form.getUniqueValue());
    esajax.getXML(function(resp) {
        processStatus(resp.responseXML);
    });
}

function processStatus(responseXML) {
    var rootElement = responseXML.documentElement;
    var connected = rootElement.getElementsByTagName("connected")[0].getAttribute("value");
    //errorMessage from svc already translated.
    var errorMessage = rootElement.getElementsByTagName("errorMessage")[0].getAttribute("value");

    g_form.clearMessages();
    if (connected == 'true') {
        g_form.addInfoMessage(new GwtMessage().getMessage("Connected Successfully"));
    } else {
        var connFailMessage = new GwtMessage().getMessage("Connection failed");
        if (errorMessage)
            g_form.addErrorMessage(connFailMessage + ",  " + errorMessage, 'error');
        else
            g_form.addErrorMessage(connFailMessage, 'error');
    }
}
