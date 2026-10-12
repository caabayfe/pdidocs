(function(context, pageParams, blockcontext) {
    var util = new sn_nowassist_admin.NowAssistAdminPluginUtil();
    var pluginStoreLink = util.getStoreBaseUrl() + "sn_appstore_store.do#!/store/search?q=";
    return {
        pluginStoreLink: pluginStoreLink
    };
})(context, pageParams, blockcontext);
