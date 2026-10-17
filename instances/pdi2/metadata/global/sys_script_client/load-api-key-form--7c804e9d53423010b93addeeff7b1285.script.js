function onLoad() {
    if (g_form.isNewRecord())
        g_form.setDisplay("sys_domain", false);
    else {
        var ga = new GlideAjax("global.MidWebServerAjaxUtils");
        ga.addParam("sysparm_name", "getApiKeyFormInfo");
        ga.addParam("sysparm_id", g_form.getUniqueValue());
        ga.getXML(function(response) {
            var respJson = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
            if (respJson.error != undefined && respJson.error != null && respJson.error != "")
                g_form.addErrorMessage(new GwtMessage().getMessage("error getting API Key Info: {0}.", respJson.error));
            else {
                if (respJson.domain_message != undefined && respJson.domain_message != null && respJson.domain_message != "")
                    g_form.showFieldMsg("sys_domain", new GwtMessage().getMessage("{0}.", respJson.domain_message), "info");
                else
                    g_form.setDisplay("sys_domain", false);
                if (respJson.api_key_expired)
                    g_form.showFieldMsg("expiration_time", new GwtMessage().getMessage("API Key has expired. Delete this record or enter a new expiration time which is in the future."), "warning");
            }
        });
    }
    g_form.hideRelatedList("REL:6b3677b4ef23210098d5925495c0fbaf"); // remove Discovery IP Affinity related list
    g_form.setReadOnly("authentication_key", true);
    g_form.setReadOnly("sys_domain", true);
    g_form.setMandatory("name", true);
}
