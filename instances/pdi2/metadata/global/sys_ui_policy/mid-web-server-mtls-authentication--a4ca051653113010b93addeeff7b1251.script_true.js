function onCondition() {
    g_form.setValue("secure_connection", "true");
    g_form.setReadOnly("secure_connection", true);
    g_form.setVisible("truststore_password", true);
    var ga = new GlideAjax('InstanceVersion');
    ga.addParam('sysparm_name', 'getVersion');
    ga.getXML(Parser);
    function Parser(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
		var webserver = '-it-operations-management/page/product/event-management/task/configure-midwebserver-extension-secure.html';
        var href_ = 'https://docs.servicenow.com/bundle/' + answer.toLowerCase() + webserver;
        g_form.addInfoMessage(getMessage("When using mTLS authentication, a predefined certificate truststore is accessed. If no truststore is defined, the default truststore is used. See the <a target='_blank' href = " + href_ + ">documentation</a> for details."));

    }

}
