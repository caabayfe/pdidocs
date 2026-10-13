function onCondition() {
    // This code is running so Keybased is the selected auth type. If the key is not
    // empty and the length is not 32 (length of the standard platform guid value 
    // used for sys_ids and for the API Key, which was populated in the secret_key field
    // before San Diego), then it is the Keybased auth key (length is 40) and we should
    // simply make it visible
    var keyLength = g_form.getValue("secret_key").length;
    if (keyLength > 0 && keyLength != 32) {
        g_form.setVisible("secret_key", true);
        return;
    }
    // Well, key is empty or it is an API Key and Keybased auth is selected so we need
    // to generate a new one suitable for Keybased auth
    var ga = new GlideAjax("global.MidWebServerAjaxUtils");
    ga.addParam("sysparm_name", "generateKeybasedAuthKey");
    ga.getXML(function(response) {
        g_form.setVisible("secret_key", true);
        g_form.setValue("secret_key", response.responseXML.documentElement.getAttribute("answer"));
    });
}
