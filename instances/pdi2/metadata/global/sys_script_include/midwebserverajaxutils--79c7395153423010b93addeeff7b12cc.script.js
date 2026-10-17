var MidWebServerAjaxUtils = Class.create();
MidWebServerAjaxUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    API_KEY_NOT_FOUND_ERR_PREFIX: "no API Key with sys_id == ",

    generateKeybasedAuthKey: function() {
        return SNC.KeybasedAuthenticationUtil.getSecretKey();
    },

    getDecryptedKey: function() {
        var retJson = {
            api_key: null,
            error: null
        };
        var keyGr = new GlideRecord("mid_webserver_api_key_credentials");
        var keySysId = this.getParameter("sysparm_id");
        if (!keyGr.get(keySysId))
            retJson.error = this.API_KEY_NOT_FOUND_ERR_PREFIX + keySysId;
        else
            retJson.api_key = keyGr.getElement("authentication_key").getDecryptedValue();
        return JSON.stringify(retJson);
    },

    getApiKeyFormInfo: function() {
        var retJson = {
            domain_message: null,
            api_key_expired: false,
            error: null
        };
        var keyGr = new GlideRecord("mid_webserver_api_key_credentials");
        var keySysId = this.getParameter("sysparm_id");
        if (!keyGr.get(keySysId))
            retJson.error = this.API_KEY_NOT_FOUND_ERR_PREFIX + keySysId;
        else {
            if (!GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer"))
                retJson.domain_message = "";
            else if (keyGr.getValue("sys_domain") == "global")
                retJson.domain_message = "API Key applies to all MID Web Server Contexts";
            else
                retJson.domain_message = "API Key applies to all MID Web Server Contexts in this domain, parent domains and in the global domain";
            retJson.api_key_expired = keyGr.getValue("expires") == "1" && new GlideDateTime().compareTo(new GlideDateTime(keyGr.getValue("expiration_time"))) > 0;
        }
        return JSON.stringify(retJson);
    },

    type: 'MidWebServerAjaxUtils'
});
