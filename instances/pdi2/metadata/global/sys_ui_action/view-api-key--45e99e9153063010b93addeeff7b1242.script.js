function run() {
    var ga = new GlideAjax("global.MidWebServerAjaxUtils");
    ga.addParam("sysparm_name", "getDecryptedKey");
    ga.addParam("sysparm_id", g_form.getUniqueValue());
    ga.getXML(function(response) {
        var respJson = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        var uiPageToShow;
        var preferenceNameToSet;
        var preferenceValueToSet;
        if (respJson.error != undefined && respJson.error != null && respJson.error != "") {
            uiPageToShow = "error_mid_webserver_api_key";
            preferenceNameToSet = "error";
            preferenceValueToSet = new GwtMessage().getMessage("{0}", respJson.error);
        } else {
            uiPageToShow = "view_mid_webserver_api_key";
            preferenceNameToSet = "apiKey";
            preferenceValueToSet = respJson.api_key;
        }
        var dialogWin = new GlideDialogWindow(uiPageToShow);
        dialogWin.setTitle(new GwtMessage().getMessage("MID Web Server API Key - {0}", g_form.getValue("name")));
        dialogWin.setSize(300, 300);
        dialogWin.setPreference(preferenceNameToSet, preferenceValueToSet);
        dialogWin.setNologValue(true);
        dialogWin.render();
    });
}
