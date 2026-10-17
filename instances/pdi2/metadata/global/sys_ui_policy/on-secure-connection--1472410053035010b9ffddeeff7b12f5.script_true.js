function onCondition() {
    g_form.setDisplay("use_unified_keystore", true);
    g_form.setDisplay("keystore_certificate_alias", true);
    if (!g_form.getBooleanValue("use_unified_keystore")) {
        g_form.setVisible("keystore_password", true);
        g_form.setMandatory("keystore_password", true);
        g_form.setVisible("keystore_private_key_password", true);
    }
    var ga = new GlideAjax('InstanceVersion');
    ga.addParam('sysparm_name', 'getVersion');
    ga.getXML(Parser);
    function Parser(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var webserver = '-it-operations-management/page/product/event-management/task/configure-midwebserver-extension-secure.html';
        var href_ = 'https://docs.servicenow.com/bundle/' + answer.toLowerCase() + webserver;
        g_form.addInfoMessage(getMessage("To establish a Secure Connection, ensure that a certificate and a private key pair are accessible to the Web Server Extension. See the <a target='_blank' href =  " + href_ + ">documentation</a> for details."));
    }
}
