var AuthUtils = Class.create();
AuthUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isPublic: function() {
        // getAvailableLanguages is called before authentication
        return true;
    },

    process: function() {
        if (this.getName() == "getAvailableLanguages") {
            this.getAvailableLanguages();
        }
    },

    getAvailableLanguages: function() {
        if (GlidePluginManager.isActive("com.glide.i18n")) {
            var langEnabled = gs.getProperty('glide.ui.login.language.select');
            if (langEnabled == "true") {
                this.i18Util = new I18nUtils();
                this.i18Util.gc = new GlideController();
                this.i18Util.request = this.request;
                this.i18Util.responseXML = this.responseXML;
                this.i18Util.getAvailableLanguages();
            }
        }
    },


    type: 'AuthUtils'
});
