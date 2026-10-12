function generateCallbackURL() {

    var ga = new GlideAjax('DockerWebhookCallbackURLGenerator');
    ga.addParam('sysparm_name', 'generateCallbackURL');
    ga.addParam('sysparm_token', g_form.getValue('token'));
    ga.addParam('sysparm_path', g_form.getValue('path'));
    ga.addParam('sysparm_id', g_form.getUniqueValue());
    ga.getXML(prepareMessage);

    function prepareMessage(response) {
        var url = response.responseXML.documentElement.getAttribute("answer");
        if (url) {
            g_form.addInfoMessage("Webhook Callback URL: " + url);
        }else {
			g_form.addErrorMessage('Webhook Callback URL could not be generated');
		}
    }
}
